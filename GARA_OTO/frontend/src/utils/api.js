import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' },
});

// ---- Response interceptor: bắt lỗi chung ----
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message || 'Lỗi kết nối server';
        return Promise.reject(new Error(message));
    }
);

export default api;