import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchOverview = async (filters: any = {}) => {
  const { data } = await api.get('/overview', { params: filters });
  return data;
};

export const fetchSales = async (filters: any = {}) => {
  const { data } = await api.get('/sales', { params: filters });
  return data;
};

export const fetchCustomers = async () => {
  const { data } = await api.get('/customers');
  return data;
};

export const fetchChurn = async () => {
  const { data } = await api.get('/churn');
  return data;
};

export const fetchProducts = async () => {
  const { data } = await api.get('/products');
  return data;
};

export const fetchInventory = async () => {
  const { data } = await api.get('/inventory');
  return data;
};

export const fetchDeliveries = async () => {
  const { data } = await api.get('/deliveries');
  return data;
};

export const fetchMarketing = async () => {
  const { data } = await api.get('/marketing');
  return data;
};

export const fetchAnomalies = async () => {
  const { data } = await api.get('/anomalies');
  return data;
};

export const fetchForecast = async (metric = 'revenue', horizon = 6) => {
  const { data } = await api.get('/forecast', { params: { metric, horizon } });
  return data;
};

export const fetchAIInsights = async () => {
  const { data } = await api.get('/insights');
  return data;
};

export const fetchRootCause = async (metric = 'revenue') => {
  const { data } = await api.get('/root-cause', { params: { metric } });
  return data;
};

export const askOpsPulse = async (question: string) => {
  const { data } = await api.post('/ask-opspulse', { question });
  return data;
};

export const fetchDataQuality = async () => {
  const { data } = await api.get('/data-quality');
  return data;
};

export const fetchAlerts = async () => {
  const { data } = await api.get('/alerts');
  return data;
};

export const fetchSqlLabQueries = async () => {
  const { data } = await api.get('/sql-lab/queries');
  return data;
};

export const executeSqlLab = async (sql: string) => {
  const { data } = await api.post('/sql-lab/execute', { sql });
  return data;
};

export const fetchExplorerTables = async () => {
  const { data } = await api.get('/explorer/tables');
  return data;
};

export const fetchTableData = async (tableName: string, limit = 50, offset = 0, search = '') => {
  const { data } = await api.get(`/explorer/table/${tableName}`, {
    params: { limit, offset, search },
  });
  return data;
};

export const uploadDataset = async (file: File, datasetType = 'orders') => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post(`/upload?dataset_type=${datasetType}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export default api;
