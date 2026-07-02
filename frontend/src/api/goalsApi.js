import axiosInstance from './axiosInstance';

const goalsApi = {
  getByOrganization: (orgId) =>
    axiosInstance.get(
      `/goals/organization/${orgId}`),
  getProgress: (id) =>
    axiosInstance.get(`/goals/${id}/progress`),
  create: (data) =>
    axiosInstance.post('/goals', data),
  cancel: (id) =>
    axiosInstance.put(`/goals/${id}/cancel`),
};

export default goalsApi;
