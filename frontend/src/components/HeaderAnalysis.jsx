import React from 'react';
import { CheckCircle, XCircle, MinusCircle, Shield } from 'lucide-react';

const StatusBadge = ({ name, status }) => {
  const getStyle = (s) => {
    switch (s?.toLowerCase()) {
      case 'pass': return { bg: 'bg-emerald-100', text: 'text-emerald-800', Icon: CheckCircle, iconColor: 'text-emerald-500' };
      case 'fail': return { bg: 'bg-rose-100', text: 'text-rose-800', Icon: XCircle, iconColor: 'text-rose-500' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', Icon: MinusCircle, iconColor: 'text-gray-500' };
    }
  };

  const { bg, text, Icon, iconColor } = getStyle(status);

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
      <span className="font-semibold text-gray-700">{name}</span>
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${bg} ${text}`}>
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        {status || 'NONE'}
      </div>
    </div>
  );
};

const HeaderAnalysis = ({ headerAnalysis }) => {
  if (!headerAnalysis) return null;

  const { spf, dkim, dmarc, return_path } = headerAnalysis;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <Shield className="w-6 h-6 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-800">Authentication Headers</h3>
      </div>
      
      <div className="space-y-3 mb-5">
        <StatusBadge name="SPF" status={spf} />
        <StatusBadge name="DKIM" status={dkim} />
        <StatusBadge name="DMARC" status={dmarc} />
      </div>
      
      <div className="pt-3 border-t border-gray-100">
        <h4 className="text-sm font-semibold text-gray-500 mb-1">Return-Path</h4>
        <div className="bg-gray-50 p-2 rounded text-sm text-gray-800 font-mono break-all border border-gray-200">
          {return_path || 'Not specified'}
        </div>
      </div>
    </div>
  );
};

export default HeaderAnalysis;
