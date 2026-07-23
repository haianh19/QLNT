import api from '../utils/api';

const repairService = {
    getAll: (params) => api.get('/repairs', { params }),
    getById: (id) => api.get(`/repairs/${id}`),
    create: (data) => api.post('/repairs', data),
    update: (id, data) => api.put(`/repairs/${id}`, data),
    delete: (id) => api.delete(`/repairs/${id}`),
};

export default repairService;