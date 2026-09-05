import React from 'react';

const RiskBadge = ({ result }) => {
  if (!result) return null;

  const { fraud_score, risk_level, sender, subject, created_at } = result;

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'bg-emerald-500';
      case 'medium': return 'bg-amber-500';
      case 'high': return 'bg-rose-600';
      default: return 'bg-gray-500';
    }
  };

  const getRiskLabel = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'Looks Safe';
      case 'medium': return 'Caution';
      case 'high': return 'High Risk';
      default: return 'Unknown Risk';
    }
  };

  const scoreColor = getRiskColor(risk_level);
  const label = getRiskLabel(risk_level);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 w-full flex flex-col md:flex-row items-center gap-6">
      <div className={`${scoreColor} text-white rounded-2xl p-6 flex flex-col items-center justify-center min-w-40`}>
        <span className="text-4xl font-bold mb-1">{fraud_score ?? '?'}</span>
        <span className="text-sm font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex-1 space-y-2 text-center md:text-left">
        <h2 className="text-xl font-semibold text-gray-800 break-all">
          Subject: {subject || 'No Subject'}
        </h2>
        <div className="text-gray-600">
          <span className="font-medium text-gray-700">From: </span>
          {sender?.display_name ? `"${sender.display_name}" ` : ''}
          <span className="text-blue-600">&lt;{sender?.email || 'Unknown'}&gt;</span>
        </div>
        <div className="text-sm text-gray-500 mt-2">
          Analysis completed: {created_at ? new Date(created_at).toLocaleString() : new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default RiskBadge;
