import axiosInstance from './axiosInstance';

const alertsApi = {
  getByOrganization: (orgId) =>
    axiosInstance.get(
      `/alerts/organization/${orgId}`),
  getActive: (orgId) =>
    axiosInstance.get(
      `/alerts/organization/${orgId}/active`),
  resolve: (id) =>
    axiosInstance.put(`/alerts/${id}/resolve`),
};

export default alertsApi;
