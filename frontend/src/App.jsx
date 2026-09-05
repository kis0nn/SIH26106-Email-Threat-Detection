import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import UploadZone from './components/UploadZone';
import RiskBadge from './components/RiskBadge';
import FindingsPanel from './components/FindingsPanel';
import HeaderAnalysis from './components/HeaderAnalysis';
import GeoMap from './components/GeoMap';
import DomainIntelCard from './components/DomainIntelCard';
import RelayPathViz from './components/RelayPathViz';

function App() {
  const [result, setResult] = useState(null);

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
            <RiskBadge result={result} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <FindingsPanel findings={result.findings} />
                <HeaderAnalysis headerAnalysis={result.header_analysis} />
                <DomainIntelCard domainIntel={result.domain_intel} />
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                <GeoMap geolocation={result.geolocation} />
                <RelayPathViz relayAnalysis={result.relay_analysis} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
