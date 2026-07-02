import axiosInstance from './axiosInstance';

const departmentsApi = {
  getAll: () =>
    axiosInstance.get('/departments'),
  getByLocation: (locationId) =>
    axiosInstance.get(
      `/departments/location/${locationId}`),
  create: (data) =>
    axiosInstance.post('/departments', data),
  update: (id, data) =>
    axiosInstance.put(`/departments/${id}`, data),
  delete: (id) =>
    axiosInstance.delete(`/departments/${id}`),
};

export default departmentsApi;
