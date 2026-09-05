import axios from 'axios';

const API_BASE = 'http://localhost:8000';

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
