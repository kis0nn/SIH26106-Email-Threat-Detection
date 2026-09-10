import React, { useState, useEffect } from 'react';
import { Shield, FileText, History, LayoutDashboard, Loader2 } from 'lucide-react';
import UploadZone from './components/UploadZone';
import RiskBadge from './components/RiskBadge';
import FindingsPanel from './components/FindingsPanel';
import HeaderAnalysis from './components/HeaderAnalysis';
import GeoMap from './components/GeoMap';
import DomainIntelCard from './components/DomainIntelCard';
import RelayPathViz from './components/RelayPathViz';
import GovDomainBanner from './components/GovDomainBanner';
import BrandTrustPanel from './components/BrandTrustPanel';
import BlockchainReceipt from './components/BlockchainReceipt';
import ReportModal from './components/ReportModal';
import AttachmentPanel from './components/AttachmentPanel';
import HistoryPage from './pages/HistoryPage';
import { getApiBase } from './api';

function App() {
  const [result, setResult] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [autoLoading, setAutoLoading] = useState(false);

  const [initialRaw, setInitialRaw] = useState(null);

  // ── Auto-load analysis from URL param ?load=<analysis_id> ──
  // This is triggered when the Chrome Extension opens the dashboard
  // with a specific analysis already done, so the result appears instantly.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const analysisId = params.get('load');
    const rawParam = params.get('raw');

    if (rawParam) {
      setInitialRaw(rawParam);
    }

    if (!analysisId) return;

    setAutoLoading(true);
    const base = getApiBase();
    fetch(`${base}/analysis/${analysisId}`)
      .then(r => {
        if (!r.ok) throw new Error('Analysis not found');
        return r.json();
      })
      .then(data => {
        setResult(data);
        setCurrentPage('dashboard');
        // Clean the URL so the param doesn't persist on refresh
        window.history.replaceState({}, '', window.location.pathname);
      })
      .catch(err => {
        console.error('Auto-load failed, backend DB might have reset:', err);
        // Clean URL but leave the raw text prefilled in the textarea
        window.history.replaceState({}, '', window.location.pathname);
      })
      .finally(() => setAutoLoading(false));
  }, []);

  const handleAnalyze = (data) => {
    setResult(data);
    setCurrentPage('dashboard');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight hidden sm:block">
              Email Threat Intelligence Platform
            </h1>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight sm:hidden">
              SIH26106
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 'dashboard' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentPage('history')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 'history' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Case History</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentPage === 'history' ? (
          <HistoryPage onSelectAnalysis={handleAnalyze} />
        ) : (
          <>
            {/* Auto-loading spinner — shown when extension triggers a load */}
            {autoLoading && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-gray-600 font-medium">Loading analysis from Chrome Extension…</p>
              </div>
            )}

            {!autoLoading && <UploadZone onAnalyze={handleAnalyze} initialRawEmail={result?.raw_email || initialRaw} />}

            {!autoLoading && result && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <GovDomainBanner sender={result.sender} />

                <RiskBadge result={result} />

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2.5 font-medium shadow-md transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Download Forensic Report (PDF)
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <FindingsPanel findings={result.findings} />
                    <AttachmentPanel attachments={result.attachments} />
                    <HeaderAnalysis headerAnalysis={result.header_analysis} />
                    <DomainIntelCard domainIntel={result.domain_intel} />
                    <BrandTrustPanel brandTrust={result.brand_trust} />
                  </div>
                  
                  {/* Right Column */}
                  <div className="space-y-6">
                    <GeoMap geolocation={result.geolocation} relayAnalysis={result.relay_analysis} />
                    <RelayPathViz relayAnalysis={result.relay_analysis} />
                    <BlockchainReceipt 
                      blockchainReceipt={result.blockchain_receipt} 
                      analysisId={result.id} 
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        analysisId={result?.id}
        blockchainReceipt={result?.blockchain_receipt}
        analysisData={result}
      />
    </div>
  );
}

export default App;
