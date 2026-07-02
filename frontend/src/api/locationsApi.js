import axiosInstance from './axiosInstance';

const locationsApi = {
  getAll: () =>
    axiosInstance.get('/locations'),
  getByOrganization: (orgId) =>
    axiosInstance.get(
      `/locations/organization/${orgId}`),
  create: (data) =>
    axiosInstance.post('/locations', data),
  update: (id, data) =>
    axiosInstance.put(`/locations/${id}`, data),
  delete: (id) =>
    axiosInstance.delete(`/locations/${id}`),
};

export default locationsApi;
