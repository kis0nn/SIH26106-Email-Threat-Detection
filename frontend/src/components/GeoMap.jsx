import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, AlertCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// RFC 5737 documentation IPs — these are fake example IPs, never geolocate them
const BOGON_PREFIXES = [
  '192.0.2.', '198.51.100.', '203.0.113.',
  '10.', '127.', '192.168.', '0.',
  // Major provider relay prefixes
  '209.85.', '74.125.', '66.102.', '64.233.', '72.14.',
  '108.177.', '142.250.', '172.217.', '216.58.',
  '40.92.', '40.107.', '52.100.', '104.47.',
];

function isBogon(ip) {
  if (!ip) return true;
  return BOGON_PREFIXES.some(p => ip.startsWith(p));
}

const GeoMap = ({ geolocation, relayAnalysis }) => {
  // Use the backend-resolved geolocation as primary.
  // If it's null/invalid (e.g., all IPs were bogons), look through relay hops
  // for a hop that has location data resolved server-side.
  let geo = geolocation;

  // Try to find a geolocated hop from the relay chain if main geo is missing
  if ((!geo || !geo.lat) && relayAnalysis?.hops) {
    const geoHop = relayAnalysis.hops.find(
      h => h.geo?.lat && h.geo?.lon && !isBogon(h.ip)
    );
    if (geoHop) {
      geo = {
        ip: geoHop.ip,
        lat: geoHop.geo.lat,
        lon: geoHop.geo.lon,
        city: geoHop.geo.city,
        country: geoHop.geo.country,
        isp: geoHop.geo.isp || null,
        org: geoHop.geo.org || null,
      };
    }
  }

  // Check if all relay IPs are bogon/demo IPs
  const allBogon = relayAnalysis?.hops?.length > 0
    && relayAnalysis.hops.every(h => isBogon(h.ip));

  if (!geo || !geo.lat || !geo.lon) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center h-80 text-center">
        <MapPin className="w-12 h-12 text-gray-300 mb-3" />
        {allBogon ? (
          <>
            <p className="text-gray-600 font-semibold">Demo Sample — No Real IP</p>
            <p className="text-xs text-gray-400 mt-2 max-w-xs">
              This email uses example IPs (RFC 5737 range 198.51.100.x) for illustration.
              Paste a real forwarded email to see live geolocation.
            </p>
          </>
        ) : (
          <p className="text-gray-500">Geolocation data unavailable for this email's origin IP.</p>
        )}
      </div>
    );
  }

  const { lat, lon, city, country, isp, org, ip } = geo;
  const position = [lat, lon];
  const locationLabel = [city, country].filter(Boolean).join(', ') || 'Unknown Location';

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <MapPin className="w-6 h-6 text-blue-600" />
        <div>
          <h3 className="text-lg font-bold text-gray-900">Origin Geolocation</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            True sender IP — provider and relay hops excluded
          </p>
        </div>
      </div>

      <div className="h-64 rounded-xl overflow-hidden border border-gray-200 relative z-0">
        <MapContainer center={position} zoom={6} scrollWheelZoom={false} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              <div className="text-sm min-w-36">
                <div className="font-bold border-b pb-1 mb-1 font-mono">{ip}</div>
                <div className="font-semibold">{locationLabel}</div>
                {isp && <div className="text-gray-500 text-xs mt-1">ISP: {isp}</div>}
                {org && <div className="text-gray-500 text-xs">Org: {org}</div>}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <span className="text-gray-500 block text-xs mb-0.5">Originating IP Address</span>
          <span className="font-mono font-semibold text-gray-900">{ip || 'N/A'}</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <span className="text-gray-500 block text-xs mb-0.5">Location</span>
          <span className="font-semibold text-gray-900">{locationLabel}</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <span className="text-gray-500 block text-xs mb-0.5">Internet Service Provider</span>
          <span className="font-semibold text-gray-900 text-xs leading-tight">{isp || 'N/A'}</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <span className="text-gray-500 block text-xs mb-0.5">Organization / AS</span>
          <span className="font-semibold text-gray-900 text-xs leading-tight">{org || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

export default GeoMap;
