import React, { useState } from 'react';
import { Upload, FileText, Loader2, Zap, ShieldCheck } from 'lucide-react';
import { analyzeEmail, analyzeRawEmail } from '../api';

const PHISHING_SAMPLE = `Received: from mail.paypa1-secure.tk (198.51.100.5) by mx.victim.com; Sat, 6 Sep 2026 10:00:00 +0000
From: PayPal Support <support@paypa1-secure.tk>
To: victim@example.com
Reply-To: attacker@gmail.com
Return-Path: <bounce@paypa1-secure.tk>
Subject: Urgent: Verify Your Account Immediately
Message-ID: <fake123@paypa1-secure.tk>
Authentication-Results: mx.victim.com; spf=fail; dkim=fail; dmarc=fail
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="boundary123"

--boundary123
Content-Type: text/plain; charset="utf-8"

Dear Customer,

We detected unusual activity on your PayPal account. Your account will be suspended unless you verify your identity immediately.

Click here now to confirm your payment details: http://paypa1-secure.tk/verify

Act now - this link expires soon!

PayPal Security Team

--boundary123
Content-Type: text/html; charset="utf-8"

<html><body>
<p>Dear Customer,</p>
<p>We detected <b>unusual activity</b> on your PayPal account. Your account will be suspended unless you verify your identity immediately.</p>
<p><a href="http://paypa1-secure.tk/verify">https://www.paypal.com/verify</a></p>
<p><a href="http://bit.ly/3xFake">Click here now</a> to confirm your payment details.</p>
<p>Act now - this link expires soon!</p>
<p>PayPal Security Team</p>
</body></html>

--boundary123--`;

const LEGITIMATE_SAMPLE = `Received: from mail.google.com (209.85.220.41) by mx.company.com; Sat, 6 Sep 2026 09:00:00 +0000
From: John Smith <john.smith@gmail.com>
To: colleague@company.com
Return-Path: <john.smith@gmail.com>
Subject: Meeting Tomorrow
Message-ID: <real456@mail.gmail.com>
Authentication-Results: mx.company.com; spf=pass; dkim=pass; dmarc=pass
MIME-Version: 1.0
Content-Type: text/plain; charset="utf-8"

Hi,

Just confirming our meeting tomorrow at 3 PM in the conference room.

Best regards,
John`;

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
      setError(err.message || 'Error analyzing file. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasteAnalyze = async (textToAnalyze) => {
    const content = textToAnalyze || rawText;
    if (!content.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await analyzeRawEmail(content);
      onAnalyze(result);
    } catch (err) {
      setError(err.message || 'Error analyzing raw text. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sampleText) => {
    setRawText(sampleText);
    setActiveTab('paste');
    handlePasteAnalyze(sampleText);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200 pb-4">
        <div className="flex gap-4">
          <button
            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'upload' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload File
          </button>
          <button
            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'paste' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('paste')}
          >
            Paste Source
          </button>
        </div>

        {/* Quick Demo Samples for PPT / Live Testing */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Demo:</span>
          <button
            type="button"
            disabled={loading}
            onClick={() => loadSample(PHISHING_SAMPLE)}
            className="text-xs px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-medium border border-rose-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Load sample phishing email"
          >
            <Zap className="w-3.5 h-3.5 text-rose-600" />
            Phishing Sample
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => loadSample(LEGITIMATE_SAMPLE)}
            className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-medium border border-emerald-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Load sample legitimate email"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Safe Sample
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-800 font-bold ml-2">&times;</button>
        </div>
      )}

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
              <p className="text-gray-600 font-medium">Analyzing email forensic indicators...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-10 h-10 text-gray-400 mb-4" />
              <p className="text-gray-700 font-medium mb-1">Click or drag an .eml file here to upload</p>
              <p className="text-sm text-gray-500">Full header and body inspection will run automatically</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <textarea
            className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-xs resize-none mb-4"
            placeholder="Paste raw email RFC 822 source headers and body here..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            disabled={loading}
          />
          <button
            onClick={() => handlePasteAnalyze()}
            disabled={loading || !rawText.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing email...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Analyze Raw Source
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadZone;
