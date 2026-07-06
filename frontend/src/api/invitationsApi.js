import axiosInstance from './axiosInstance';

const invitationsApi = {
  send: (data) =>
    axiosInstance.post('/invitations/send', data),
  validate: (token) =>
    axiosInstance.get(`/invitations/validate/${token}`),
  accept: (data) =>
    axiosInstance.post('/invitations/accept', data),
};

export default invitationsApi;
