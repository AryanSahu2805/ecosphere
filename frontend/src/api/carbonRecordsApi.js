import axiosInstance from './axiosInstance';

const makeRecordApi = (path) => ({
  getAll: () =>
    axiosInstance.get(`/${path}`),
  getByDepartment: (deptId) =>
    axiosInstance.get(`/${path}/department/${deptId}`),
  create: (data) =>
    axiosInstance.post(`/${path}`, data),
  update: (id, data) =>
    axiosInstance.put(`/${path}/${id}`, data),
  delete: (id) =>
    axiosInstance.delete(`/${path}/${id}`),
  getByOrganization: (orgId) =>
    axiosInstance.get(`/${path}/organization/${orgId}`),
});

export const energyRecordsApi =
  makeRecordApi('energy-records');
export const travelRecordsApi =
  makeRecordApi('travel-records');
export const serverRecordsApi =
  makeRecordApi('server-usage-records');
