import React, { useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { analyzeEmail, analyzeRawEmail } from '../api';

const UploadZone = ({ onAnalyze }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [loading, setLoading] = useState(false);
  const [rawText, setRawText] = useState('');
  const [error, setError] = useState('');

  const handleFileDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file) => {
    setLoading(true);
    setError('');
    try {
      const result = await analyzeEmail(file);
      onAnalyze(result);
    } catch (err) {
      setError(err.message || 'Error analyzing file');
    } finally {
      setLoading(false);
    }
  };

  const handlePasteAnalyze = async () => {
    if (!rawText.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await analyzeRawEmail(rawText);
      onAnalyze(result);
    } catch (err) {
      setError(err.message || 'Error analyzing raw text');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="flex gap-4 mb-6 border-b border-gray-200 pb-2">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'upload' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload File
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'paste' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('paste')}
        >
          Paste Source
        </button>
      </div>

      {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

      {activeTab === 'upload' ? (
        <div
          className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg p-12 text-center transition-colors cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          onClick={() => document.getElementById('file-upload').click()}
        >
          <input
            id="file-upload"
            type="file"
            accept=".eml"
            className="hidden"
            onChange={handleFileSelect}
          />
          {loading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
              <p className="text-gray-600">Analyzing...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-10 h-10 text-gray-400 mb-4" />
              <p className="text-gray-700 font-medium mb-1">Click or drag file to this area to upload</p>
              <p className="text-sm text-gray-500">Supports .eml files</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <textarea
            className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4"
            placeholder="Paste raw email source here..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            disabled={loading}
          />
          <button
            onClick={handlePasteAnalyze}
            disabled={loading || !rawText.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Paste & Analyze
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadZone;
