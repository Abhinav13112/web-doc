import axios from 'axios';
import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000 // 60s timeout for large uploads
});

// Automatically inject Supabase JWT access token into outgoing requests
api.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch (err) {
    console.warn('Could not retrieve Supabase session token:', err);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Global response error handler
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected API error occurred.';
    return Promise.reject(new Error(message));
  }
);

export const documentsApi = {
  list: (params = {}) => api.get('/documents', { params }),
  
  upload: (formData, onProgress, cancelToken) => {
    return api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
      cancelToken
    });
  },

  getStats: () => api.get('/documents/stats'),
  
  getById: (id) => api.get(`/documents/${id}`),

  getDownloadUrl: (id) => api.get(`/documents/${id}/download`),

  getPreviewUrl: (id) => api.get(`/documents/${id}/preview`),

  update: (id, updates) => api.patch(`/documents/${id}`, updates),

  moveToTrash: (id) => api.delete(`/documents/${id}/trash`),

  restore: (id) => api.patch(`/documents/${id}/restore`),

  permanentDelete: (id) => api.delete(`/documents/${id}/permanent`),

  emptyTrash: () => api.delete('/documents/trash/empty'),

  getProfile: () => api.get('/user/profile')
};

export default api;
