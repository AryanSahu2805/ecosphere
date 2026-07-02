import axiosInstance from './axiosInstance';

const auditLogsApi = {
  getRecent: (page = 0, size = 20) =>
    axiosInstance.get('/audit-logs', {
      params: { page, size }
    }),
  getByEntity: (entityType, entityId) =>
    axiosInstance.get(
      `/audit-logs/entity/${entityType}/${entityId}`),
};

export default auditLogsApi;
