import React, { useState } from 'react';
import { Shield, FileText } from 'lucide-react';
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

function App() {
  const [result, setResult] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const handleAnalyze = (data) => {
    setResult(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Email Threat Intelligence Platform</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <UploadZone onAnalyze={handleAnalyze} />

        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Government Domain Banner (top of dashboard) */}
            <GovDomainBanner sender={result.sender} />

            <RiskBadge result={result} />

            {/* Download Report Button */}
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
                <HeaderAnalysis headerAnalysis={result.header_analysis} />
                <DomainIntelCard domainIntel={result.domain_intel} />
                <BrandTrustPanel brandTrust={result.brand_trust} />
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                <GeoMap geolocation={result.geolocation} />
                <RelayPathViz relayAnalysis={result.relay_analysis} />
                <BlockchainReceipt 
                  blockchainReceipt={result.blockchain_receipt} 
                  analysisId={result.id} 
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        analysisId={result?.id}
        blockchainReceipt={result?.blockchain_receipt}
      />
    </div>
  );
}

export default App;
