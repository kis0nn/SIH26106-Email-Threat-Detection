import React, { useState } from 'react';
import { FileText, X, Download, Loader2, Shield, Printer } from 'lucide-react';
import { downloadReport } from '../api';

const ReportModal = ({ isOpen, onClose, analysisId, blockchainReceipt, analysisData }) => {
  const [maskPii, setMaskPii] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!analysisId && !analysisData) {
      setError('No analysis found. Please scan an email first, then try again.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const blob = await downloadReport(analysisId || 'report', maskPii, analysisData);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `forensic_report_${(analysisId || 'case').substring(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download error:', err);
      // Fallback: Generate printable view directly if backend is completely unavailable
      setError('Backend unreachable. Click below to print or save forensic report as PDF directly from browser:');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintFallback = () => {
    const data = analysisData || {};
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const mask = (str) => {
      if (!maskPii || !str) return str || '';
      return str.replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '***@$2');
    };

    const senderEmail = mask(data.sender?.email || 'Unknown');
    const senderName = mask(data.sender?.display_name || '');
    const subject = data.subject || 'No Subject';
    const fraudScore = data.fraud_score ?? 0;
    const riskLevel = (data.risk_level || 'low').toUpperCase();
    const findings = data.findings || [];

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Forensic Email Report - ${displayId}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1e293b; }
          .header { border-bottom: 3px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
          .title { font-size: 24px; font-bold: bold; color: #1e3a5f; margin: 0; }
          .subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
          .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-weight: bold; font-size: 12px; color: white; background: ${riskLevel === 'HIGH' ? '#e11d48' : (riskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981')}; }
          .finding { border-left: 3px solid #cbd5e1; padding: 8px 12px; margin-bottom: 8px; background: white; font-size: 13px; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">SIH26106 Forensic Email Threat Report</h1>
          <div class="subtitle">Official Intelligence Dossier | Generated: ${new Date().toLocaleString()}</div>
        </div>
        <div class="box">
          <div class="grid">
            <div><strong>Case ID:</strong> ${displayId}</div>
            <div><strong>Risk Assessment:</strong> <span class="badge">${riskLevel} (Score: ${fraudScore}/100)</span></div>
            <div><strong>Sender:</strong> ${senderName ? `"${senderName}" ` : ''}&lt;${senderEmail}&gt;</div>
            <div><strong>Subject:</strong> ${subject}</div>
          </div>
        </div>
        <h3>Security Findings (${findings.length})</h3>
        ${findings.map(f => `
          <div class="finding">
            <strong>${f.check || 'Security Check'}</strong>: ${f.detail || ''} 
            ${f.score_contribution ? `(+${f.score_contribution} pts)` : ''}
          </div>
        `).join('')}
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const blockIndex = blockchainReceipt?.block_index || 'N/A';
  const displayId = analysisId ? analysisId.substring(0, 8) : 'N/A';
  const timestamp = new Date().toLocaleString();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Download Forensic Report (PDF)</h2>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-700 space-y-2">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-500">Case ID:</span>
            <span className="font-mono">{displayId}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-500">Timestamp:</span>
            <span>{timestamp}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-500">Block Index:</span>
            <span className="font-mono">{blockIndex}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Mask PII</span>
          </div>
          <div 
            onClick={() => setMaskPii(!maskPii)}
            className={`w-11 h-6 rounded-full cursor-pointer transition-colors flex items-center px-1 ${maskPii ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${maskPii ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800 font-medium mb-2">{error}</p>
            <button
              onClick={handlePrintFallback}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print / Save Browser PDF
            </button>
          </div>
        )}

        <button
          onClick={handleDownload}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg py-3 font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          {loading ? 'Generating Report...' : 'Download Official PDF'}
        </button>
      </div>
    </div>
  );
};

export default ReportModal;
