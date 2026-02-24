import axios from 'axios';

// Export methods
export const exportTradesCSV = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/api/export/csv?${params}`, {
    responseType: 'blob',
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `trades_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const exportTradesJSON = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/api/export/json?${params}`);
  return response.data;
};

// Import method
export const importTradesJSON = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/api/import/json', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }

  
);

export default api;