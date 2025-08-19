export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer';
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Threat {
  id: string;
  type: 'DDoS' | 'Phishing' | 'Malware' | 'Ransomware' | 'Data Breach' | 'SQL Injection' | 'XSS' | 'Social Engineering' | 'Other';
  location: string;
  country: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  severity: 'Low' | 'Medium' | 'High';
  time_detected: string;
  description: string;
  status: 'Active' | 'Investigating' | 'Resolved' | 'False Positive';
  source?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: User;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface ThreatsResponse {
  threats: Threat[];
  pagination: PaginationInfo;
}

export interface ThreatStats {
  summary: {
    totalThreats: number;
    activeThreats: number;
    timeRange: string;
  };
  threatsByType: Array<{
    type: string;
    count: number;
  }>;
  threatsBySeverity: Array<{
    severity: string;
    count: number;
  }>;
  threatsByCountry: Array<{
    country: string;
    count: number;
  }>;
  threatsOverTime: Array<{
    date: string;
    count: number;
  }>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'analyst' | 'viewer';
}

export interface ThreatFormData {
  type: Threat['type'];
  location: string;
  country: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  severity: Threat['severity'];
  time_detected: string;
  description: string;
  status?: Threat['status'];
  source?: string;
}

export interface FilterOptions {
  type?: string;
  severity?: string;
  country?: string;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface WebSocketContextType {
  socket: any;
  isConnected: boolean;
}
