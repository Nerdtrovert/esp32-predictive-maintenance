import axios from 'axios';

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const getBaseUrl = () => {
  const raw = import.meta.env.VITE_API_URL;
  if (!raw) {
    return '/api';
  }

  const normalized = trimTrailingSlash(raw);
  return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiService = {
  getFactoryStats: async () => (await apiClient.get('/factory/stats')).data,
  getFactoryMachines: async () => (await apiClient.get('/factory/machines')).data,
  getRecentAlerts: async () => (await apiClient.get('/factory/alerts/recent')).data,
  getQuickSummary: async () => (await apiClient.get('/factory/summary')).data,

  getMachineDetails: async (machineId) => (await apiClient.get(`/machine/${machineId}`)).data,
  getMachineSensorData: async (machineId) => (await apiClient.get(`/machine/${machineId}/sensors`)).data,
  getMachineHealth: async (machineId) => (await apiClient.get(`/machine/${machineId}/health`)).data,

  getAIAnalysis: async () => (await apiClient.get('/ai/analysis')).data,
  getAIRecommendations: async () => (await apiClient.get('/ai/recommendations')).data,

  getAlerts: async (limit = 50) => (await apiClient.get('/alerts', { params: { limit } })).data,

  getReports: async () => (await apiClient.get('/reports')).data,
  getReportById: async (reportId) => (await apiClient.get(`/reports/${reportId}`)).data,

  getMaintenanceHistory: async (limit = 50) => (
    await apiClient.get('/maintenance/history', { params: { limit } })
  ).data,
  getMaintenanceRecommendations: async () => (await apiClient.get('/maintenance/recommendations')).data,

  getSettings: async () => (await apiClient.get('/settings')).data,
  updateSettings: async (settings) => (await apiClient.put('/settings', settings)).data,
};

export default apiService;
