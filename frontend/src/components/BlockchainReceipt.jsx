import React, { useState } from 'react';
import { Link, Copy, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { getApiBase } from '../api';

const BlockchainReceipt = ({ blockchainReceipt, analysisId }) => {
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  if (!blockchainReceipt) return null;

  const { block_index, analysis_hash, previous_block_hash, block_hash, timestamp } = blockchainReceipt;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const base = getApiBase();
      const response = await axios.get(`${base}/verify/${analysisId}`);
      setVerifyResult(response.data);
    } catch (error) {
      console.error("Verification failed", error);
      setVerifyResult({ verified: false, error: true });
    } finally {
      setVerifying(false);
    }
  };

  const truncateHash = (hash) => {
    if (!hash) return '';
    return hash.substring(0, 16) + '...';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 border-b pb-3 mb-4">
        <Link className="w-5 h-5 text-gray-700" />
        <h2 className="text-xl font-semibold text-gray-800">Blockchain Audit Receipt</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Block Index:</span>
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md font-mono text-sm">
            #{block_index}
          </span>
        </div>

        {[
          { label: 'Analysis Hash', value: analysis_hash },
          { label: 'Previous Block Hash', value: previous_block_hash },
          { label: 'Block Hash', value: block_hash },
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-600">{item.label}</span>
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
              <span className="font-mono text-sm text-gray-800 truncate flex-1">
                {truncateHash(item.value)}
              </span>
              <button
                onClick={() => handleCopy(item.value)}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                title="Copy full hash"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        <div className="text-sm text-gray-600 pt-2 border-t">
          <span className="font-medium">Timestamp:</span> {new Date(timestamp).toLocaleString()}
        </div>

        <div className="pt-4">
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 font-medium transition-colors disabled:opacity-70"
          >
            {verifying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Link className="w-4 h-4" />
            )}
            Verify Integrity
          </button>
        </div>

        {verifyResult && (
          <div className="mt-4">
            {verifyResult.verified ? (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="font-medium">Immutable Chain Verified: Record Tamper-Free ✓</span>
                  {verifyResult.chain_length && (
                    <span className="text-xs text-emerald-600 mt-1">Chain Length: {verifyResult.chain_length} blocks</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-800 rounded-lg border border-rose-200">
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <span className="font-medium">⚠️ Chain Integrity Compromised!</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockchainReceipt;
