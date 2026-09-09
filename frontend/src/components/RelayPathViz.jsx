import React from 'react';
import { Server, Share2, MapPin } from 'lucide-react';

const RelayPathViz = ({ relayAnalysis }) => {
  if (!relayAnalysis || !relayAnalysis.hops || relayAnalysis.hops.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center h-full">
        <Share2 className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-gray-500">No relay data available</p>
      </div>
    );
  }

  const { total_hops, hops } = relayAnalysis;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Share2 className="w-6 h-6 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-800">Relay Path</h3>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">
          {total_hops} Hops
        </span>
      </div>

      <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-200 before:to-blue-200">
        {hops.map((hopData, idx) => (
          <div key={idx} className="relative flex items-start">
            <div className="absolute left-[-2rem] flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 border-4 border-white text-white font-bold text-xs shadow-sm z-10">
              {hopData.hop}
            </div>
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg flex-1 shadow-sm ml-2">
              <div className="flex items-center gap-2 mb-2 text-sm">
                <Server className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-gray-800 break-all">{hopData.server || 'Unknown Server'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500 block">IP Address</span>
                  <span className="font-mono text-gray-700">{hopData.ip || 'Hidden'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Timestamp</span>
                  <span className="text-gray-700">{hopData.timestamp ? new Date(hopData.timestamp).toLocaleString() : 'Unknown'}</span>
                </div>
                {(hopData.country || hopData.city) && (
                  <div className="sm:col-span-2">
                    <span className="text-gray-500 block">Location</span>
                    <span className="text-gray-700 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-500" />
                      {hopData.city ? `${hopData.city}, ` : ''}{hopData.country || 'Unknown'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelayPathViz;
