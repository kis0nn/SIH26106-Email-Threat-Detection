import React from 'react';
import { CheckCircle, XCircle, MinusCircle, Shield, Info } from 'lucide-react';

// Full forms with explanations shown as tooltip/subtitle
const AUTH_PROTOCOLS = {
  spf: {
    full: 'Sender Policy Framework (SPF)',
    desc: 'Verifies that the sending mail server is authorized by the domain owner to send email on behalf of that domain.',
  },
  dkim: {
    full: 'DomainKeys Identified Mail (DKIM)',
    desc: 'A cryptographic signature attached to the email that proves the message was not altered in transit and genuinely originates from the claimed domain.',
  },
  dmarc: {
    full: 'Domain-based Message Authentication, Reporting & Conformance (DMARC)',
    desc: 'Builds on SPF and DKIM — tells receiving servers what to do (quarantine / reject) if authentication fails, and enables abuse reporting back to the domain owner.',
  },
};

const StatusBadge = ({ protocolKey, status }) => {
  const proto = AUTH_PROTOCOLS[protocolKey] || { full: protocolKey.toUpperCase(), desc: '' };

  const getStyle = (s) => {
    switch (s?.toLowerCase()) {
      case 'pass':     return { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', Icon: CheckCircle, iconColor: 'text-emerald-500', label: 'PASS' };
      case 'fail':     return { bg: 'bg-rose-100',    text: 'text-rose-800',    border: 'border-rose-200',    Icon: XCircle,     iconColor: 'text-rose-500',    label: 'FAIL' };
      case 'softfail': return { bg: 'bg-amber-100',   text: 'text-amber-800',   border: 'border-amber-200',   Icon: MinusCircle, iconColor: 'text-amber-500',   label: 'SOFTFAIL' };
      default:         return { bg: 'bg-gray-100',    text: 'text-gray-700',    border: 'border-gray-200',    Icon: MinusCircle, iconColor: 'text-gray-400',    label: 'NONE' };
    }
  };

  const { bg, text, border, Icon, iconColor, label } = getStyle(status);

  return (
    <div className={`p-4 rounded-xl border ${border} ${bg} mb-3`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="font-bold text-gray-900 text-sm leading-tight">{proto.full}</p>
          <p className="text-xs text-gray-500 mt-1 leading-snug">{proto.desc}</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap ${bg} ${text} border ${border}`}>
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
          {label}
        </div>
      </div>
    </div>
  );
};

const HeaderAnalysis = ({ headerAnalysis }) => {
  if (!headerAnalysis) return null;

  const { spf, dkim, dmarc, return_path } = headerAnalysis;

  const allPass = ['pass'].includes(spf) && ['pass'].includes(dkim) && ['pass'].includes(dmarc);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
        <Shield className="w-6 h-6 text-blue-600" />
        <div>
          <h3 className="text-lg font-bold text-gray-900">Email Authentication Analysis</h3>
          <p className="text-xs text-gray-500 mt-0.5">Cryptographic verification of email origin and integrity</p>
        </div>
      </div>

      <div className="mb-5">
        <StatusBadge protocolKey="spf"   status={spf}   />
        <StatusBadge protocolKey="dkim"  status={dkim}  />
        <StatusBadge protocolKey="dmarc" status={dmarc} />
      </div>

      {allPass && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-800 text-sm font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          All three authentication checks passed — email origin is cryptographically verified.
        </div>
      )}

      <div className="pt-3 border-t border-gray-100">
        <h4 className="text-sm font-bold text-gray-600 mb-1 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          Return-Path Header
        </h4>
        <p className="text-xs text-gray-400 mb-2">
          The address where bounce/delivery failure notices are sent. Mismatches between Return-Path and From are a common spoofing indicator.
        </p>
        <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-800 font-mono break-all border border-gray-200">
          {return_path || 'Not specified'}
        </div>
      </div>
    </div>
  );
};

export default HeaderAnalysis;
