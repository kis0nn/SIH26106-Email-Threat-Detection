import React, { useState } from 'react';
import { FileText, X, Download, Loader2, Shield } from 'lucide-react';
import { downloadReport } from '../api';

const ReportModal = ({ isOpen, onClose, analysisId, blockchainReceipt }) => {
  const [maskPii, setMaskPii] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!analysisId) {
      setError('No analysis found. Please scan an email first, then try again.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const blob = await downloadReport(analysisId, maskPii);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `forensic_report_${analysisId.substring(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const msg = err?.response?.status === 404
        ? 'Analysis not found. The backend database may have been reset.'
        : 'Could not connect to backend. Make sure start.bat is running.';
      setError(`⚠️ ${msg}`);
      console.error('PDF download error:', err);
    } finally {
      setLoading(false);
    }
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

        {error && <div className="mb-4 text-sm text-red-600 font-medium">{error}</div>}

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
