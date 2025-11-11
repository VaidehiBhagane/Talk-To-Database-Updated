import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (data) => api.post('/api/auth/login', data),
  verifyToken: () => api.get('/api/auth/verify'),
};

// Business Unit APIs
export const businessUnitAPI = {
  getAll: () => api.get('/api/bu/'),
  getById: (id) => api.get(`/api/bu/${id}`),
  create: (data) => api.post('/api/bu/', data),
  update: (id, data) => api.put(`/api/bu/${id}`, data),
  delete: (id) => api.delete(`/api/bu/${id}`),
  grantAccess: (buId, userId) => api.post(`/api/bu/${buId}/grant-access`, { user_id: userId }),
  revokeAccess: (buId, userId) => api.post(`/api/bu/${buId}/revoke-access`, { user_id: userId }),
  getUsers: (buId) => api.get(`/api/bu/${buId}/users`),
};

// Query APIs
export const queryAPI = {
  execute: (data) => api.post('/api/query/execute', data),
  visualize: (data) => api.post('/api/query/visualize', data),
  export: (data) => api.post('/api/query/export', data, { responseType: 'blob' }),
  getHistory: (params) => api.get('/api/query/history', { params }),
  getSchema: (buId) => api.get(`/api/query/schema/${buId}`),
};

// Admin APIs
export const adminAPI = {
  getAnalytics: () => api.get('/api/admin/analytics'),
  getAllUsers: () => api.get('/api/admin/users'),
  deleteUser: (userId) => api.delete(`/api/admin/users/${userId}`),
  updateUserRole: (userId, role) => api.put(`/api/admin/users/${userId}/role`, { role }),
  grantBUAccess: (userId, buId) => api.post(`/api/admin/users/${userId}/business-units/${buId}/grant`),
  revokeBUAccess: (userId, buId) => api.delete(`/api/admin/users/${userId}/business-units/${buId}/revoke`),
  getQueryLogs: (params) => api.get('/api/admin/query-logs', { params }),
};

// Notification APIs
export const notificationAPI = {
  getAll: () => api.get('/api/notifications/'),
  markAsRead: (notificationId) => api.put(`/api/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/api/notifications/mark-all-read'),
  getAccessRequests: (status) => api.get('/api/notifications/access-requests', { params: { status } }),
  createAccessRequest: (data) => api.post('/api/notifications/access-requests', data),
  approveRequest: (requestId) => api.put(`/api/notifications/access-requests/${requestId}/approve`),
  rejectRequest: (requestId) => api.put(`/api/notifications/access-requests/${requestId}/reject`),
};

// Profile APIs
export const profileAPI = {
  get: () => api.get('/api/profile/'),
  update: (data) => api.put('/api/profile/', data),
  getAvailableBusinessUnits: () => api.get('/api/profile/available-business-units'),
  requestAccess: (data) => api.post('/api/profile/request-access', data),
};

export default api;
