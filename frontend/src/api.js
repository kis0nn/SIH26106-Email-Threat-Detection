import axios from 'axios';
import { analyzeEmailClientSide } from './offlineEngine';

// Always fall back to localhost:8000 — never use an empty string in prod
// because there is no hosted backend (only the React static site is hosted).
// The local FastAPI server must be running for PDF, blockchain verify, and history features.
export const getApiBase = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('sih_api_url');
    if (saved) return saved.trim().replace(/\/$/, '');
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.trim().replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8000';
  }
  return 'https://sih26106-backend.onrender.com';
};

const API_BASE = getApiBase();

export const analyzeEmail = async (file) => {
  const base = getApiBase();
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${base}/analyze`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return response.data;
  } catch (err) {
    console.warn("Backend unavailable, activating in-browser fallback engine:", err.message);
    const text = await file.text();
    return analyzeEmailClientSide(text);
  }
};

export const analyzeRawEmail = async (rawEmail) => {
  const base = getApiBase();
  try {
    const response = await axios.post(`${base}/analyze`, { raw_email: rawEmail }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000,
    });
    return response.data;
  } catch (err) {
    console.warn("Backend unavailable, activating in-browser fallback engine:", err.message);
    return analyzeEmailClientSide(rawEmail);
  }
};

export const checkHealth = async () => {
  const base = getApiBase();
  try {
    const response = await axios.get(`${base}/health`, { timeout: 8000 });
    return response.data;
  } catch (err) {
    return { status: 'offline', mode: 'client-fallback' };
  }
};

export const verifyChain = async (analysisId) => {
  const base = getApiBase();
  const response = await axios.get(`${base}/verify/${analysisId}`, { timeout: 15000 });
  return response.data;
};

export const downloadReport = async (analysisId, maskPii = false, analysisData = null) => {
  const base = getApiBase();
  const response = await axios.post(
    `${base}/report/${analysisId}?mask_pii=${maskPii}`,
    analysisData || {},
    { responseType: 'blob', timeout: 60000 }
  );
  return response.data;
};

export { API_BASE };
