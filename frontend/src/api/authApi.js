import axiosInstance from './axiosInstance';

const authApi = {
  login: (data) =>
    axiosInstance.post('/auth/login', data),
  register: (data) =>
    axiosInstance.post('/auth/register', data),
};

export default authApi;
