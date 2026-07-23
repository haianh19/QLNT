import api from '../utils/api';

const notificationService = {
    getAll: () => api.get('/notifications'),
};

export default notificationService;