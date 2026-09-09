import React from 'react';
import { Shield, CheckCircle, XCircle } from 'lucide-react';

const BrandTrustPanel = ({ brandTrust }) => {
  if (!brandTrust) return null;

  const { claimed_brand, brand_verified, official_domain, brand_trust_score, explanation } = brandTrust;

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-emerald-700 bg-emerald-100';
    if (score >= 40) return 'text-amber-700 bg-amber-100';
    return 'text-rose-700 bg-rose-100';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 border-b pb-3 mb-4">
        <Shield className="w-5 h-5 text-gray-700" />
        <h2 className="text-xl font-semibold text-gray-800">Brand Verification</h2>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">{claimed_brand || 'Unknown Brand'}</span>
          {brand_verified ? (
            <div className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Verified</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-full font-medium">
              <XCircle className="w-4 h-4" />
              <span>Unverified</span>
            </div>
          )}
        </div>

        {official_domain && (
          <div className="text-sm">
            <span className="font-medium text-gray-700">Official Domain:</span>{' '}
            <span className={brand_verified ? 'text-emerald-600' : 'text-rose-600'}>
              {official_domain}
            </span>
          </div>
        )}

        {brand_trust_score !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-700">Trust Score:</span>
            <span className={`px-2 py-0.5 rounded-full font-bold ${getScoreColor(brand_trust_score)}`}>
              {brand_trust_score}/100
            </span>
          </div>
        )}

        {explanation && (
          <p className="text-sm text-gray-600 mt-2 p-3 bg-gray-50 rounded-lg">
            {explanation}
          </p>
        )}
      </div>
    </div>
  );
};

export default BrandTrustPanel;
