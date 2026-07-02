import axiosInstance from './axiosInstance';

const reportsApi = {
  downloadSummaryCsv: (orgId, from, to) =>
    axiosInstance.get(
      '/reports/emissions-summary/csv',
      {
        params: { organizationId: orgId, from, to },
        responseType: 'blob'
      }
    ),
  downloadEnergyRecordsCsv: (orgId, from, to) =>
    axiosInstance.get(
      '/reports/energy-records/csv',
      {
        params: { organizationId: orgId, from, to },
        responseType: 'blob'
      }
    ),
  downloadSummaryPdf: (orgId, from, to) =>
    axiosInstance.get(
      '/reports/emissions-summary/pdf',
      {
        params: { organizationId: orgId, from, to },
        responseType: 'blob'
      }
    ),
};

export default reportsApi;
