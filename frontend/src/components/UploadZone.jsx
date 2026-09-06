import React, { useState } from 'react';
import { Upload, FileText, Loader2, AlertOctagon, Landmark, AlertTriangle, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { analyzeEmail, analyzeRawEmail } from '../api';

const PHISHING_PAYPAL_SAMPLE = `Received: from mail.paypa1-secure.tk (198.51.100.5) by mx.victim.com; Sat, 6 Sep 2026 10:00:00 +0000
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

const BANKING_SBI_SAMPLE = `Received: from mail.sbi-secure-portal.xyz (185.220.101.42) by mx.victim.com; Sun, 7 Sep 2026 04:15:00 +0000
From: SBI Online Alerts <alerts@sbi-secure-portal.xyz>
To: user@example.com
Reply-To: sbi-support@sbi-secure-portal.xyz
Return-Path: <no-reply@sbi-secure-portal.xyz>
Subject: Critical: SBI NetBanking Access Restricted - Immediate Action Required
Message-ID: <sbi9910@sbi-secure-portal.xyz>
Authentication-Results: mx.victim.com; spf=fail; dkim=none; dmarc=none
MIME-Version: 1.0
Content-Type: text/plain; charset="utf-8"

Dear State Bank of India Customer,

We noticed unusual activity on your SBI NetBanking portal. Your account access will be suspended within 24 hours.

Immediate action is required. Please verify your account credentials and confirm your password by clicking the official portal:
http://sbi-secure-portal.xyz/kyc-update

Regards,
State Bank of India Security Division`;

const INVOICE_MEDIUM_SAMPLE = `Received: from mail.vendor-billing-corp.com (104.244.42.1) by mx.victim.com; Sun, 7 Sep 2026 06:30:00 +0000
From: Accounts Receivable <billing@vendor-billing-corp.com>
To: finance@victim.com
Reply-To: payment-desk@vendor-billing-corp.com
Return-Path: <billing@vendor-billing-corp.com>
Subject: Urgent: Overdue Invoice Payment & Wire Transfer Required
Message-ID: <inv8821@vendor-billing-corp.com>
Authentication-Results: mx.victim.com; spf=pass; dkim=none; dmarc=none
MIME-Version: 1.0
Content-Type: text/plain; charset="utf-8"

Hello Finance Team,

Please find attached the updated payment schedule. Immediate action is required to avoid service interruption.

Kindly confirm your payment and initiate the wire transfer today. Limited time remains before late penalties are applied.

Thank you,
Accounting Department`;

const LEGITIMATE_SAMPLE = `Received: from mail.google.com (209.85.220.41) by mx.company.com; Sat, 6 Sep 2026 09:00:00 +0000
From: John Smith <john.smith@gmail.com>
To: colleague@company.com
Return-Path: <john.smith@gmail.com>
Subject: Meeting Confirmation: Project Milestone Review Tomorrow
Message-ID: <real456@mail.gmail.com>
Authentication-Results: mx.company.com; spf=pass; dkim=pass; dmarc=pass
MIME-Version: 1.0
Content-Type: text/plain; charset="utf-8"

Hi Team,

Just confirming our project review meeting tomorrow at 3:00 PM in Conference Room B.

Agenda:
- Review Q3 milestones
- Architecture walkthrough
- Next development sprint planning

Best regards,
John Smith`;

const SAMPLES = [
  {
    id: 'paypal',
    title: 'PayPal Phishing',
    subtitle: 'Typosquatting & Hidden URL',
    tag: 'High Risk · 70 pts',
    border: 'border-rose-200 hover:border-rose-400',
    bg: 'bg-rose-50/50 hover:bg-rose-50',
    tagBadge: 'bg-rose-600 text-white',
    icon: AlertOctagon,
    iconColor: 'text-rose-600',
    domain: 'paypa1-secure.tk',
    content: PHISHING_PAYPAL_SAMPLE
  },
  {
    id: 'sbi',
    title: 'SBI Banking BEC',
    subtitle: 'Brand Spoof & .xyz Abuse',
    tag: 'High Risk · 55 pts',
    border: 'border-orange-200 hover:border-orange-400',
    bg: 'bg-orange-50/50 hover:bg-orange-50',
    tagBadge: 'bg-orange-600 text-white',
    icon: Landmark,
    iconColor: 'text-orange-600',
    domain: 'sbi-secure-portal.xyz',
    content: BANKING_SBI_SAMPLE
  },
  {
    id: 'invoice',
    title: 'Urgent Wire Transfer',
    subtitle: 'Social Engineering Coercion',
    tag: 'Caution · 35 pts',
    border: 'border-amber-200 hover:border-amber-400',
    bg: 'bg-amber-50/50 hover:bg-amber-50',
    tagBadge: 'bg-amber-500 text-white',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
    domain: 'vendor-billing-corp.com',
    content: INVOICE_MEDIUM_SAMPLE
  },
  {
    id: 'safe',
    title: 'Clean Team Meeting',
    subtitle: 'Passing SPF/DKIM/DMARC',
    tag: 'Looks Safe · 0 pts',
    border: 'border-emerald-200 hover:border-emerald-400',
    bg: 'bg-emerald-50/50 hover:bg-emerald-50',
    tagBadge: 'bg-emerald-600 text-white',
    icon: ShieldCheck,
    iconColor: 'text-emerald-600',
    domain: 'gmail.com',
    content: LEGITIMATE_SAMPLE
  }
];

const UploadZone = ({ onAnalyze }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [loading, setLoading] = useState(false);
  const [activeSampleId, setActiveSampleId] = useState(null);
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
    setActiveSampleId(null);
    try {
      const result = await analyzeEmail(file);
      onAnalyze(result);
    } catch (err) {
      setError(err.message || 'Error analyzing file. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasteAnalyze = async (textToAnalyze, sampleId = null) => {
    const content = textToAnalyze || rawText;
    if (!content.trim()) return;
    setLoading(true);
    setError('');
    setActiveSampleId(sampleId);
    try {
      const result = await analyzeRawEmail(content);
      onAnalyze(result);
    } catch (err) {
      setError(err.message || 'Error analyzing raw text. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sample) => {
    setRawText(sample.content);
    setActiveTab('paste');
    handlePasteAnalyze(sample.content, sample.id);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-8 border border-gray-100">
      {/* Tab Selectors */}
      <div className="flex items-center justify-between gap-4 mb-6 border-b border-gray-200 pb-3">
        <div className="flex gap-4">
          <button
            className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'upload' ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload .EML File
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'paste' ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('paste')}
          >
            Paste Raw RFC 822 Source
          </button>
        </div>

        <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          AI Forensic Pipeline Active
        </span>
      </div>

      {error && (
        <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-800 font-bold ml-2">&times;</button>
        </div>
      )}

      {activeTab === 'upload' ? (
        <div
          className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl p-10 text-center transition-all cursor-pointer bg-gray-50/50 hover:bg-blue-50/20 group"
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
            <div className="flex flex-col items-center py-4">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
              <p className="text-gray-700 font-semibold text-sm">Deconstructing email headers & evaluating threat vectors...</p>
              <p className="text-xs text-gray-400 mt-1">Tracing sender IP, typosquat ratios, SPF/DKIM/DMARC, and relay hops</p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-gray-800 font-semibold mb-1">Click or drag an .eml email file here to analyze</p>
              <p className="text-xs text-gray-500">Supports standard RFC 822 .eml export from Gmail, Outlook, Thunderbird</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <textarea
            className="w-full h-44 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-xs resize-none mb-3 bg-gray-50/40"
            placeholder="Paste raw email RFC 822 source headers and body here..."
            value={rawText}
            onChange={(e) => {
              setRawText(e.target.value);
              setActiveSampleId(null);
            }}
            disabled={loading}
          />
          <button
            onClick={() => handlePasteAnalyze()}
            disabled={loading || !rawText.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex justify-center items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Executing Threat Analysis Pipeline...
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

      {/* 4 Interactive Example Threat Samples */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Instant Demo Samples (Click to Test Live Threat Scores)
            </h3>
          </div>
          <span className="text-[11px] text-gray-500 hidden sm:inline">
            1-Click automated test for PPT & Evaluator Review
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAMPLES.map((s) => {
            const IconComponent = s.icon;
            const isSelected = activeSampleId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                disabled={loading}
                onClick={() => loadSample(s)}
                className={`text-left p-3.5 rounded-xl border transition-all duration-200 ${s.border} ${s.bg} flex flex-col justify-between relative group ${isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-sm'}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className={`w-4 h-4 ${s.iconColor}`} />
                      <span className="text-xs font-bold text-gray-900">{s.title}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.tagBadge}`}>
                      {s.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-tight mb-2">
                    {s.subtitle}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px] text-gray-500">
                  <span className="font-mono truncate max-w-[130px]">{s.domain}</span>
                  <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Test <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UploadZone;
