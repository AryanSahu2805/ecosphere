import axiosInstance from './axiosInstance';

const emailPreferencesApi = {
  get: () =>
    axiosInstance.get('/email-preferences'),
  update: (data) =>
    axiosInstance.put('/email-preferences', data),
};

export default emailPreferencesApi;
