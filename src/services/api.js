import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for logging
api.interceptors.request.use(
    (config) => {
        console.log(`Making ${config.method.toUpperCase()} request to: ${config.url}`);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        
        // Handle specific error cases
        if (error.response?.status === 404) {
            console.error('Resource not found');
        } else if (error.response?.status === 500) {
            console.error('Server error');
        }
        
        return Promise.reject(error);
    }
);

// Health Records API
export const healthAPI = {
    // Create a new health record
    create: async (healthData) => {
        try {
            const response = await api.post('/health', healthData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to create health record');
        }
    },

    // Get all health records with pagination and search
    getAll: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const response = await api.get(`/health${queryParams ? `?${queryParams}` : ''}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch health records');
        }
    },

    // Get a single health record by ID
    getById: async (id) => {
        try {
            const response = await api.get(`/health/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch health record');
        }
    },

    // Update a health record
    update: async (id, healthData) => {
        try {
            const response = await api.put(`/health/${id}`, healthData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update health record');
        }
    },

    // Delete a health record
    delete: async (id) => {
        try {
            const response = await api.delete(`/health/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete health record');
        }
    },

    // Get health statistics
    getStats: async () => {
        try {
            const response = await api.get('/health/stats');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch health statistics');
        }
    },

    // Search health records by email
    searchByEmail: async (email) => {
        try {
            const response = await api.get(`/health?email=${encodeURIComponent(email)}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to search health records');
        }
    }
};

// Health check API
export const healthCheck = async () => {
    try {
        const response = await api.get('/health-check');
        return response.data;
    } catch (error) {
        throw new Error('API is not available');
    }
};

export default api;
