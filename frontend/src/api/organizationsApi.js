import axiosInstance from './axiosInstance';

const organizationsApi = {
  getAll: () =>
    axiosInstance.get('/organizations'),
  getById: (id) =>
    axiosInstance.get(`/organizations/${id}`),
  create: (data) =>
    axiosInstance.post('/organizations', data),
  update: (id, data) =>
    axiosInstance.put(`/organizations/${id}`, data),
  delete: (id) =>
    axiosInstance.delete(`/organizations/${id}`),
};

export default organizationsApi;
