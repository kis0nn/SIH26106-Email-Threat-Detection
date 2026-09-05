import React from 'react';
import { Globe, AlertTriangle } from 'lucide-react';

const DomainIntelCard = ({ domainIntel }) => {
  if (!domainIntel) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center">
        <Globe className="w-8 h-8 text-gray-300 mb-2" />
        <p className="text-gray-500 text-sm">No domain intelligence available</p>
      </div>
    );
  }

  const { domain, age_days, is_newly_registered, registrar, created_date } = domainIntel;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <Globe className="w-6 h-6 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-800">Domain Intelligence</h3>
      </div>

      {is_newly_registered && (
        <div className="mb-4 bg-rose-100 border border-rose-500 text-rose-700 p-3 rounded-lg flex items-center gap-2 text-sm font-medium">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          ⚠️ Newly Registered Domain (less than 30 days old)
        </div>
      )}

      <div className="space-y-4">
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold block mb-1">Domain Name</span>
          <span className="text-gray-800 font-medium text-lg">{domain || 'N/A'}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold block mb-1">Age</span>
            <span className="text-gray-800">{age_days !== undefined && age_days !== null ? `${age_days} days` : 'Unknown'}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold block mb-1">Created Date</span>
            <span className="text-gray-800">{created_date ? new Date(created_date).toLocaleDateString() : 'Unknown'}</span>
          </div>
        </div>

        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold block mb-1">Registrar</span>
          <span className="text-gray-800 break-words">{registrar || 'Unknown'}</span>
        </div>
      </div>
    </div>
  );
};

export default DomainIntelCard;
