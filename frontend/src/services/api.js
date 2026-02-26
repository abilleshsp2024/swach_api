import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Connecting to backend on port 8000

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: Add token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: Handle sliding session token update
api.interceptors.response.use(
    (response) => {
        const newToken = response.headers['x-refresh-token'];
        if (newToken) {
            localStorage.setItem('access_token', newToken);
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_id');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const registerUser = async (userData) => {
    try {
        const response = await api.post('/register', userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const loginUser = async (userData) => {
    try {
        const response = await api.post('/login', userData);
        if (response.data.access_token) {
            localStorage.setItem('access_token', response.data.access_token);
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const uploadSwatch = async (formData) => {
    try {
        const response = await api.post('/upload-swatch', formData, {
            headers: {
                'Content-Type': undefined // Drop default JSON header
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const fetchSwachCount = async () => {
    try {
        const response = await api.get('/total-swach-count');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const fetchTotalList = async () => {
    try {
        const response = await api.get('/list-all');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export default api;
