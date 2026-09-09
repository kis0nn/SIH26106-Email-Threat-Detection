import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin } from 'lucide-react';
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

const GeoMap = ({ geolocation }) => {
  if (!geolocation || !geolocation.lat || !geolocation.lon) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center h-80 text-center">
        <MapPin className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-gray-500">No geolocation data available</p>
      </div>
    );
  }

  const { lat, lon, city, country, isp, org, ip } = geolocation;
  const position = [lat, lon];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <MapPin className="w-6 h-6 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-800">Sender Location</h3>
      </div>
      
      <div className="h-64 rounded-lg overflow-hidden border border-gray-200 relative z-0">
        <MapContainer center={position} zoom={5} scrollWheelZoom={false} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              <div className="text-sm">
                <div className="font-bold border-b pb-1 mb-1">{ip}</div>
                <div>{city ? `${city}, ` : ''}{country || 'Unknown Location'}</div>
                {isp && <div className="text-gray-600 mt-1">ISP: {isp}</div>}
                {org && <div className="text-gray-600">Org: {org}</div>}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500 block">IP Address</span>
          <span className="font-medium text-gray-800">{ip || 'N/A'}</span>
        </div>
        <div>
          <span className="text-gray-500 block">Location</span>
          <span className="font-medium text-gray-800">
            {city ? `${city}, ` : ''}{country || 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-gray-500 block">ISP</span>
          <span className="font-medium text-gray-800">{isp || 'N/A'}</span>
        </div>
        <div>
          <span className="text-gray-500 block">Organization</span>
          <span className="font-medium text-gray-800">{org || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

export default GeoMap;
