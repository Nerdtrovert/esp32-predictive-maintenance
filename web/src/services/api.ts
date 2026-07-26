import apiService, { apiClient } from './apiService';

const wrap = (fn: (...args: any[]) => Promise<any>) => (...args: any[]) =>
  fn(...args).then((data) => ({ data }));

export const factoryApi = {
  getStats: wrap(apiService.getFactoryStats),
  getMachines: wrap(apiService.getFactoryMachines),
  getRecentAlerts: wrap(apiService.getRecentAlerts),
  getQuickSummary: wrap(apiService.getQuickSummary),
};

export const machineApi = {
  getMachine: wrap(apiService.getMachineDetails),
  getSensorData: wrap(apiService.getMachineSensorData),
  getHealth: wrap(apiService.getMachineHealth),
};

export const aiApi = {
  getAnalysis: wrap(apiService.getAIAnalysis),
  getRecommendations: wrap(apiService.getAIRecommendations),
};

export const alertsApi = {
  getAlerts: wrap(apiService.getAlerts),
};

export const reportsApi = {
  getReports: wrap(apiService.getReports),
  getReport: wrap(apiService.getReportById),
};

export const maintenanceApi = {
  getHistory: wrap(apiService.getMaintenanceHistory),
  getRecommendations: wrap(apiService.getMaintenanceRecommendations),
};

export const settingsApi = {
  getSettings: wrap(apiService.getSettings),
  updateSettings: wrap(apiService.updateSettings),
};

export { apiClient };
export default apiService;
