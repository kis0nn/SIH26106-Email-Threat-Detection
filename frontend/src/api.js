import axios from 'axios';
import { analyzeEmailClientSide } from './offlineEngine';

const API_BASE = import.meta.env.VITE_API_URL !== undefined
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.PROD ? '' : 'http://localhost:8000');

export const analyzeEmail = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_BASE}/analyze`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 6000,
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
      timeout: 6000,
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
