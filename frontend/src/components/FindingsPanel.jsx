import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';

// Maps raw backend check keys → human-readable full forms
const CHECK_LABELS = {
  // Authentication
  spf_fail:             'Sender Policy Framework (SPF) — Authentication Failure',
  spf_none:             'Sender Policy Framework (SPF) — No Record Found',
  dkim_fail:            'DomainKeys Identified Mail (DKIM) — Signature Failure',
  dkim_none:            'DomainKeys Identified Mail (DKIM) — Not Signed',
  dmarc_fail:           'Domain-based Message Authentication (DMARC) — Policy Failure',
  dmarc_none:           'Domain-based Message Authentication (DMARC) — No Policy',
  // Sender / Domain
  typosquat:            'Typosquatting / Lookalike Domain Detection',
  lookalike_domain:     'Lookalike Domain Detection (Brand Impersonation)',
  display_name_spoof:   'Display Name Spoofing — Sender Identity Mismatch',
  suspicious_tld:       'Suspicious Top-Level Domain (TLD) Abuse',
  reply_to_mismatch:    'Reply-To Address Mismatch — Redirect Attack',
  return_path_mismatch: 'Return-Path / From Domain Mismatch',
  // Content
  urgency_keywords:     'Urgency & Social Engineering Keywords Detected',
  link_mismatch:        'Hyperlink Text vs. Destination URL Mismatch',
  obfuscated_url:       'Obfuscated or Shortened URL Detected',
  suspicious_link:      'Suspicious / Malicious URL Detected',
  // AI
  nlp_classifier:       'DistilBERT AI Phishing Classifier — Semantic Analysis',
  // Relay / Routing
  relay_anomaly:        'Email Relay Hop Anomaly — Suspicious Routing Pattern',
  // Attachments
  dangerous_attachment: 'Dangerous Attachment — Executable or Macro File Detected',
  suspicious_attachment:'Suspicious Attachment — Double Extension or Unusual File Type',
  // Governance
  gov_impersonation:    'Government Agency Impersonation Detected',
  brand_mismatch:       'Brand Trust Mismatch — Unverified Corporate Identity Claim',
};

function expandCheckName(raw) {
  if (!raw) return 'Unknown Security Check';
  const key = raw.toLowerCase().replace(/[\s-]/g, '_');
  return CHECK_LABELS[key] || raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const FindingItem = ({ finding }) => {
  const [expanded, setExpanded] = useState(false);

  const getSeverityStyle = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'low':    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'medium': return 'bg-amber-100   text-amber-800   border-amber-200';
      case 'high':   return 'bg-rose-100    text-rose-800    border-rose-200';
      default:       return 'bg-gray-100    text-gray-700    border-gray-200';
    }
  };

  const label = expandCheckName(finding?.check);
  const severityStyle = getSeverityStyle(finding?.severity);

  return (
    <div className="border border-gray-200 rounded-xl mb-2 overflow-hidden shadow-sm">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <ShieldAlert className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 text-sm leading-tight">{label}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${severityStyle}`}>
              {finding?.severity || 'Unknown'} severity
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          {finding?.score_contribution > 0 && (
            <span className="text-sm font-bold text-rose-600 whitespace-nowrap">+{finding.score_contribution} pts</span>
          )}
          {expanded
            ? <ChevronUp  className="w-5 h-5 text-gray-400" />
            : <ChevronDown className="w-5 h-5 text-gray-400" />
          }
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-200 text-sm text-gray-700 leading-relaxed">
          {finding?.detail || 'No additional details available.'}
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
        <h3 className="text-lg font-bold text-emerald-700">No Threats Detected</h3>
        <p className="text-sm text-gray-500 mt-1">
          This email passed all security checks — no suspicious indicators found.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
        <AlertCircle className="w-6 h-6 text-rose-600" />
        <div>
          <h3 className="text-lg font-bold text-gray-900">Security Findings</h3>
          <p className="text-xs text-gray-500 mt-0.5">{findings.length} threat indicator{findings.length !== 1 ? 's' : ''} detected — click each to expand details</p>
        </div>
      </div>
      <div className="space-y-1 max-h-[480px] overflow-y-auto pr-1">
        {findings.map((finding, idx) => (
          <FindingItem key={idx} finding={finding} />
        ))}
      </div>
    </div>
  );
};

export default FindingsPanel;
