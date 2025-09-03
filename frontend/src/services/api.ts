import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import type {
    LoginCredentials,
    RegisterData,
    User,
    AuthTokens,
    Prediction,
    FAQ,
    Hospital,
    ConsentStatus,
    AdminMetrics
} from '../types';

const API_BASE_URL = 'http://localhost:8000'; // Adjust to your Django backend URL

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const { tokens } = useAuthStore.getState();
    if (tokens?.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      
      try {
        const { tokens, updateTokens, logout } = useAuthStore.getState();
        
        if (tokens?.refresh) {
          const response = await axios.post(
            `${API_BASE_URL}/api/auth/refresh/`,
            { refresh: tokens.refresh }
          );
          
          const newTokens = {
            access: response.data.access,
            refresh: tokens.refresh
          };
          
          updateTokens(newTokens);
          original.headers.Authorization = `Bearer ${newTokens.access}`;
          
          return api(original);
        }
      } catch (refreshError) {
        logout();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
    const response = await api.post('/api/auth/login/', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> => {
    const response = await api.post('/api/auth/register/', data);
    return response.data;
  },

  refresh: async (refresh: string): Promise<{ access: string }> => {
    const response = await api.post('/api/auth/refresh/', { refresh });
    return response.data;
  },
};

// Features API
export const featuresAPI = {
  getFeatures: async (): Promise<string[]> => {
    const response = await api.get('/api/features/');
    return response.data;
  },
};

// Predictions API
export const predictionsAPI = {
  predict: async (features: Record<string, any>): Promise<Prediction> => {
    const response = await api.post('/api/predict/', { features });
    return response.data;
  },

  getPredictions: async (): Promise<Prediction[]> => {
    const response = await api.get('/api/predictions/');
    return response.data;
  },

  exportPredictions: async (): Promise<Blob> => {
    const response = await api.get('/api/predictions/export/', {
      responseType: 'blob',
    });
    return response.data;
  },
};

// General API calls
export const generalAPI = {
  getFAQs: async (): Promise<FAQ[]> => {
    const response = await api.get('/api/faqs/');
    return response.data;
  },

  getHospitals: async (): Promise<Hospital[]> => {
    const response = await api.get('/api/hospitals/');
    return response.data;
  },
};

// Consent API
export const consentAPI = {
  getStatus: async (): Promise<ConsentStatus> => {
    const response = await api.get('/api/consent/status/');
    return response.data;
  },

  acceptConsent: async (): Promise<ConsentStatus> => {
    const response = await api.post('/api/consent/accept/');
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getMetrics: async (): Promise<AdminMetrics> => {
    const response = await api.get('/api/admin/metrics/');
    return response.data;
  },
};

export default api;

function logout() {
    const { logout } = useAuthStore.getState();
    logout();
    window.location.href = '/login';
}


