import axios from 'axios';

const api = axios.create({ 
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api' 
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const googleLogin = (accessToken) => api.post('/auth/google', { accessToken });
export const requestOtp = (email) => api.post('/auth/otp/request', { email });
export const verifyOtp = (email, code) => api.post('/auth/otp/verify', { email, code });
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token, newPassword) => api.post('/auth/reset-password', { token, newPassword });
export const submitComplaint = (formData) => api.post('/complaints', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const myComplaints = () => api.get('/complaints/my');
export const getComplaint = (id) => api.get(`/complaints/${id}`);
export const wardComplaints = (params) => api.get('/officer/complaints', { params });
export const updateStatus = (id, data) => api.patch(`/officer/complaints/${id}`, data);

export const getWardsList = () => api.get('/complaints/wards');
export const detectWard = (lat, lng) => api.get('/complaints/detect-ward', { params: { lat, lng } });
export const submitFeedback = (id, data) => api.post(`/complaints/${id}/feedback`, data);

export const myRewards = () => api.get('/rewards/my');
export const leaderboard = () => api.get('/rewards/leaderboard');

export default api;