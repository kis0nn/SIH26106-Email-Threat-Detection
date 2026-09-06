import axios from 'axios';

// When deployed on same server (Render / Docker), API_BASE is relative ('').
// When deployed on GitHub Pages or Vercel, VITE_API_URL can point to the hosted backend.
// In local development, falls back to http://localhost:8000.
const API_BASE = import.meta.env.VITE_API_URL !== undefined
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.PROD ? '' : 'http://localhost:8000');

export const analyzeEmail = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_BASE}/analyze`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const analyzeRawEmail = async (rawEmail) => {
  const response = await axios.post(`${API_BASE}/analyze`, { raw_email: rawEmail }, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

export const checkHealth = async () => {
  const response = await axios.get(`${API_BASE}/health`);
  return response.data;
};
