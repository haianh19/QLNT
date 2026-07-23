import api from '../utils/api';

const paymentService = {
    getAll: () => api.get('/payments'),
    create: (data) => api.post('/payments', data),
};

export default paymentService;