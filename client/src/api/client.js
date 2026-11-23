import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const http = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

function extractError(err) {
  if (err.response?.data?.error) return err.response.data.error;
  if (err.response?.data?.message) return err.response.data.message;
  return err.message || 'Error de conexión con el servidor.';
}

export async function simulate(config, results) {
  const res = await http.post('/calculate/simulate', { config, results });
  return res.data.data;
}

export async function getModes() {
  const res = await http.get('/calculate/modes');
  return res.data.data;
}

export async function getScenarios(config) {
  const res = await http.post('/scenarios', { config });
  return res.data.data;
}

export async function getProbabilities(config, estimatedProbability) {
  const res = await http.post('/probabilities', { config, estimatedProbability });
  return res.data.data;
}

export async function listHistory(filters = {}) {
  const res = await http.get('/history', { params: filters });
  return res.data.data;
}

export async function createHistory(payload) {
  const res = await http.post('/history', payload);
  return res.data.data;
}

export async function updateHistory(id, payload) {
  const res = await http.put(`/history/${id}`, payload);
  return res.data.data;
}

export async function deleteHistory(id) {
  const res = await http.delete(`/history/${id}`);
  return res.data.data;
}

export async function exportHistory(format, filters = {}) {
  const res = await http.get('/history/export', {
    params: { ...filters, format },
    responseType: 'blob',
  });
  const disposition = res.headers['content-disposition'] || '';
  const match = disposition.match(/filename="?([^";]+)"?/);
  const filename = match ? match[1] : `historial.${format === 'xlsx' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'csv'}`;
  const url = URL.createObjectURL(res.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export { extractError };
