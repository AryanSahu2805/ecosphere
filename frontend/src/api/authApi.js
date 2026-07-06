import axiosInstance from './axiosInstance';

const authApi = {
  login: (data) =>
    axiosInstance.post('/auth/login', data),
  register: (data) =>
    axiosInstance.post('/auth/register', data),
  registerCompany: (data) =>
    axiosInstance.post('/auth/register-company', data),
  getAllUsers: () =>
    axiosInstance.get('/auth/users'),
  assignOrganization: (userId, orgId) =>
    axiosInstance.put(`/auth/users/${userId}/organization/${orgId}`),
  deleteUser: (userId) =>
    axiosInstance.delete(`/auth/users/${userId}`),
};

export default authApi;
