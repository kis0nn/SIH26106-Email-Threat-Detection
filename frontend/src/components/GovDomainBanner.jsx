import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

const GovDomainBanner = ({ sender }) => {
  if (!sender) return null;
  
  if (!sender.is_gov && !sender.claims_gov) {
    return null;
  }

  if (sender.is_gov) {
    return (
      <div className="bg-blue-50 border border-blue-300 rounded-xl p-4 flex items-center gap-3">
        <ShieldCheck className="text-blue-600 w-6 h-6 flex-shrink-0" />
        <span className="text-blue-800 font-semibold">
          Verified Official Government Email (.gov.in / nic.in)
        </span>
      </div>
    );
  }

  if (sender.claims_gov && !sender.is_gov) {
    return (
      <div className="bg-rose-50 border-2 border-rose-500 rounded-xl p-4 flex items-center gap-3 animate-pulse">
        <AlertTriangle className="text-rose-600 w-6 h-6 flex-shrink-0" />
        <span className="text-rose-800 font-bold">
          CRITICAL WARNING: Claims to be Government Agency but originating from unauthorized domain!
        </span>
      </div>
    );
  }

  return null;
};

export default GovDomainBanner;
