import axios, { AxiosResponse } from 'axios';
import {
  AuthResponse,
  ApiResponse,
  User,
  Threat,
  ThreatsResponse,
  ThreatStats,
  LoginCredentials,
  RegisterCredentials,
  ThreatFormData,
  FilterOptions,
} from '../types';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
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

// Response interceptor for error handling
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

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/register', credentials);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.get('/auth/profile');
    return response.data;
  },
};

// Threats API
export const threatsAPI = {
  getThreats: async (filters?: FilterOptions): Promise<ApiResponse<ThreatsResponse>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response: AxiosResponse<ApiResponse<ThreatsResponse>> = await api.get(
      `/threats?${params.toString()}`
    );
    return response.data;
  },

  getThreatById: async (id: string): Promise<ApiResponse<{ threat: Threat }>> => {
    const response: AxiosResponse<ApiResponse<{ threat: Threat }>> = await api.get(`/threats/${id}`);
    return response.data;
  },

  createThreat: async (threatData: ThreatFormData): Promise<ApiResponse<{ threat: Threat }>> => {
    const response: AxiosResponse<ApiResponse<{ threat: Threat }>> = await api.post('/threats', threatData);
    return response.data;
  },

  updateThreat: async (id: string, threatData: Partial<ThreatFormData>): Promise<ApiResponse<{ threat: Threat }>> => {
    const response: AxiosResponse<ApiResponse<{ threat: Threat }>> = await api.put(`/threats/${id}`, threatData);
    return response.data;
  },

  deleteThreat: async (id: string): Promise<ApiResponse<null>> => {
    const response: AxiosResponse<ApiResponse<null>> = await api.delete(`/threats/${id}`);
    return response.data;
  },

  getThreatStats: async (timeRange?: string): Promise<ApiResponse<ThreatStats>> => {
    const params = timeRange ? `?timeRange=${timeRange}` : '';
    const response: AxiosResponse<ApiResponse<ThreatStats>> = await api.get(`/threats/stats${params}`);
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async (): Promise<ApiResponse<null>> => {
    const response: AxiosResponse<ApiResponse<null>> = await api.get('/health');
    return response.data;
  },
};

export default api;
