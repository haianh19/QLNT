import api from '../utils/api';

const materialService = {
    getAll: (params) => api.get('/materials', { params }),
    getById: (id) => api.get(`/materials/${id}`),
    create: (data) => api.post('/materials', data),
    update: (id, data) => api.put(`/materials/${id}`, data),
    delete: (id) => api.delete(`/materials/${id}`),
};

export default materialService;