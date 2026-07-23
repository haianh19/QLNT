import api from '../utils/api';

const reportService = {
    getDashboard: () => api.get('/reports/dashboard'),
    getRevenue: (params) => api.get('/reports/revenue', { params }),
    getByBrand: (params) => api.get('/reports/by-brand', { params }),
};

export default reportService;