import axios from 'axios';
import { analyzeEmailClientSide } from './offlineEngine';

// Always fall back to localhost:8000 — never use an empty string in prod
// because there is no hosted backend (only the React static site is hosted).
// The local FastAPI server must be running for PDF, blockchain verify, and history features.
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const analyzeEmail = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_BASE}/analyze`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 15000,
    });
    return response.data;
  } catch (err) {
    console.warn("Backend unavailable, activating in-browser fallback engine:", err.message);
    const text = await file.text();
    return analyzeEmailClientSide(text);
  }
};

export const analyzeRawEmail = async (rawEmail) => {
  try {
    const response = await axios.post(`${API_BASE}/analyze`, { raw_email: rawEmail }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });
    return response.data;
  } catch (err) {
    console.warn("Backend unavailable, activating in-browser fallback engine:", err.message);
    return analyzeEmailClientSide(rawEmail);
  }
};

export const checkHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE}/health`, { timeout: 3000 });
    return response.data;
  } catch (err) {
    return { status: 'offline', mode: 'client-fallback' };
  }
};

export const verifyChain = async (analysisId) => {
  const response = await axios.get(`${API_BASE}/verify/${analysisId}`, { timeout: 10000 });
  return response.data;
};

export const downloadReport = async (analysisId, maskPii = false) => {
  const response = await axios.post(
    `${API_BASE}/report/${analysisId}?mask_pii=${maskPii}`,
    null,
    { responseType: 'blob', timeout: 30000 }
  );
  return response.data;
};

export { API_BASE };
