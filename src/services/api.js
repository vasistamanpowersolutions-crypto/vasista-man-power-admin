import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET_KEY;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'x-admin-secret': ADMIN_SECRET,
  }
});

// Candidate APIs
export const candidateAPI = {
  // Get all candidates
  getAll: () => apiClient.get('/candidates'),
  
  // Get single candidate
  getById: (id) => apiClient.get(`/candidates/${id}`),
  
  // Create new candidate
  create: (data) => apiClient.post('/candidates', data),
  
  // Update candidate
  update: (id, data) => apiClient.put(`/candidates/${id}`, data),
  
  // Delete candidate
  delete: (id) => apiClient.delete(`/candidates/${id}`),
};

export default apiClient;
