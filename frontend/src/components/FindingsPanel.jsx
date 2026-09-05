import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react';

const FindingItem = ({ finding }) => {
  const [expanded, setExpanded] = useState(false);

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'low': return 'bg-emerald-100 text-emerald-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'high': return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg mb-2 overflow-hidden">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${getSeverityColor(finding?.severity)}`}>
            {finding?.severity || 'Unknown'}
          </div>
          <span className="font-medium text-gray-800">{finding?.check || 'Unnamed Check'}</span>
        </div>
        <div className="flex items-center gap-3">
          {finding?.score_contribution > 0 && (
            <span className="text-sm font-semibold text-rose-600">+{finding.score_contribution} pts</span>
          )}
          {expanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
        </div>
      </div>
      {expanded && (
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-gray-700 text-sm">
          {finding?.detail || 'No details provided.'}
        </div>
      )}
    </div>
  );
};

const FindingsPanel = ({ findings }) => {
  if (!findings || findings.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center h-full text-center">
        <CheckCircle className="w-12 h-12 text-emerald-500 mb-3" />
        <h3 className="text-lg font-semibold text-emerald-700">No issues detected</h3>
        <p className="text-sm text-gray-500 mt-1">This email passed all security checks.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <AlertCircle className="w-6 h-6 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-800">Security Findings</h3>
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {findings.map((finding, idx) => (
          <FindingItem key={idx} finding={finding} />
        ))}
      </div>
    </div>
  );
};

export default FindingsPanel;
