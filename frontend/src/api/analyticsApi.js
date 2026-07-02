import axiosInstance from './axiosInstance';

const analyticsApi = {
  getSummary: (orgId, from, to) =>
    axiosInstance.get('/emissions/summary', {
      params: { organizationId: orgId, from, to }
    }),
  getTrends: (orgId, year) =>
    axiosInstance.get('/emissions/trends', {
      params: { organizationId: orgId, year }
    }),
};

export default analyticsApi;
