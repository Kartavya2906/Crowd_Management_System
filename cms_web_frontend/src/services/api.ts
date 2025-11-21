import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  Event,
  Zone,
  LostPerson,
  MedicalFacility,
  EmergencyExit,
  Feedback,
  WashroomFacility
} from '../types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://crowd-management-system-lx1h.onrender.com';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for adding auth tokens
apiClient.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response: any) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic API methods
async function get<T>(url: string, params?: Record<string, any>): Promise<T> {
  const response = await apiClient.get<T>(url, { params });
  return response.data;
}

async function post<T>(url: string, data?: any): Promise<T> {
  const response = await apiClient.post<T>(url, data);
  return response.data;
}

async function put<T>(url: string, data?: any): Promise<T> {
  const response = await apiClient.put<T>(url, data);
  return response.data;
}

async function patch<T>(url: string, data?: any): Promise<T> {
  const response = await apiClient.patch<T>(url, data);
  return response.data;
}

async function del<T>(url: string): Promise<T> {
  const response = await apiClient.delete<T>(url);
  return response.data;
}

// ============================================
// Authentication API
// ============================================
export const authAPI = {
  login: async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await apiClient.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    return response.data;
  },

  register: async (userData: { name: string; email: string; password: string; role?: string }) => {
    return post('/auth/register', userData);
  },

  logout: () => {
    localStorage.removeItem('access_token');
  },

  getCurrentUser: () => {
    return get('/auth/me');
  },
};

// ============================================
// Events API
// ============================================
export const eventsAPI = {
  getAll: (organizerId?: string) => get<Event[]>('/events/', { organizer_id: organizerId }),
  getById: (id: string) => get<Event>(`/events/${id}`),
  create: (event: Partial<Event>) => post<Event>('/events/', event),
  update: (id: string, event: Partial<Event>) => put<Event>(`/events/${id}`, event),
  delete: (id: string) => del(`/events/${id}`),
  updateStatus: (id: string, status: string) => patch<Event>(`/events/${id}/status?status=${status}`),
};

// ============================================
// Zones API (Crowd Density Tracking)
// ============================================
export const zonesAPI = {
  getAll: (eventId?: string) => get<Zone[]>('/zones/', { event_id: eventId }),
  getById: (id: string) => get<Zone>(`/zones/${id}`),
  create: (zone: Partial<Zone>) => post<Zone>('/zones/', zone),
  update: (id: string, zone: Partial<Zone>) => put<Zone>(`/zones/${id}`, zone),
  delete: (id: string) => del(`/zones/${id}`),
  updateDensity: (id: string, currentDensity: number, densityStatus?: string) =>
    patch<Zone>(`/zones/${id}/density?current_density=${currentDensity}${densityStatus ? `&density_status=${densityStatus}` : ''}`),
};

// ============================================
// Lost Persons API
// ============================================
export const lostPersonsAPI = {
  getAll: (eventId?: string, status?: string) =>
    get<LostPerson[]>('/lost-persons/', { event_id: eventId, status }),
  getById: (id: string) => get<LostPerson>(`/lost-persons/${id}`),
  create: (person: Partial<LostPerson>) => post<LostPerson>('/lost-persons/', person),
  update: (id: string, person: Partial<LostPerson>) => put<LostPerson>(`/lost-persons/${id}`, person),
  updateStatus: (id: string, status: 'missing' | 'found') =>
    patch<LostPerson>(`/lost-persons/${id}/status?status=${status}`),
  delete: (id: string) => del(`/lost-persons/${id}`),
};

// ============================================
// Medical Facilities API
// ============================================
export const medicalFacilitiesAPI = {
  getAll: (eventId?: string) => get<MedicalFacility[]>('/medical-facilities/', { event_id: eventId }),
  getById: (id: string) => get<MedicalFacility>(`/medical-facilities/${id}`),
  create: (facility: Partial<MedicalFacility>) => post<MedicalFacility>('/medical-facilities/', facility),
  update: (id: string, facility: Partial<MedicalFacility>) =>
    put<MedicalFacility>(`/medical-facilities/${id}`, facility),
  delete: (id: string) => del(`/medical-facilities/${id}`),
};

// ============================================
// Emergency Exits API
// ============================================
export const emergencyExitsAPI = {
  getAll: (eventId?: string) => get<EmergencyExit[]>('/emergency-exits/', { event_id: eventId }),
  getById: (id: string) => get<EmergencyExit>(`/emergency-exits/${id}`),
  create: (exit: Partial<EmergencyExit>) => post<EmergencyExit>('/emergency-exits/', exit),
  update: (id: string, exit: Partial<EmergencyExit>) => put<EmergencyExit>(`/emergency-exits/${id}`, exit),
  updateStatus: (id: string, status: 'crowded' | 'moderate' | 'clear') =>
    patch<EmergencyExit>(`/emergency-exits/${id}/status?status=${status}`),
  delete: (id: string) => del(`/emergency-exits/${id}`),
};

// ============================================
// Feedback API
// ============================================
export const feedbackAPI = {
  getAll: (eventId?: string) => get<Feedback[]>('/feedback/', { event_id: eventId }),
  getById: (id: string) => get<Feedback>(`/feedback/${id}`),
  create: (feedback: Partial<Feedback>) => post<Feedback>('/feedback/', feedback),
  getStats: (eventId: string) => get(`/feedback/event/${eventId}/stats`),
};

// ============================================
// Washroom Facilities API
// ============================================
export const washroomFacilitiesAPI = {
  getAll: (eventId?: string) => get<WashroomFacility[]>('/washroom-facilities/', { event_id: eventId }),
  getById: (id: string) => get<WashroomFacility>(`/washroom-facilities/${id}`),
  create: (facility: Partial<WashroomFacility>) =>
    post<WashroomFacility>('/washroom-facilities/', facility),
  update: (id: string, facility: Partial<WashroomFacility>) =>
    put<WashroomFacility>(`/washroom-facilities/${id}`, facility),
  updateStatus: (id: string, status: 'available' | 'occupied' | 'maintenance') =>
    patch<WashroomFacility>(`/washroom-facilities/${id}/status?status=${status}`),
  delete: (id: string) => del(`/washroom-facilities/${id}`),
};

// ============================================
// Medical Emergencies API
// ============================================
export const medicalEmergenciesAPI = {
  getAll: (eventId?: string, status?: string) =>
    get('/medical-emergencies/', { event_id: eventId, status }),
  getById: (id: string) => get(`/medical-emergencies/${id}`),
  create: (emergency: any) => post('/medical-emergencies/', emergency),
  update: (id: string, emergency: any) => put(`/medical-emergencies/${id}`, emergency),
  updateStatus: (id: string, status: string) =>
    patch(`/medical-emergencies/${id}/status?status=${status}`),
  delete: (id: string) => del(`/medical-emergencies/${id}`),
};

// ============================================
// Alerts API
// ============================================
export const alertsAPI = {
  getAll: (eventId?: string) => get('/alerts/', { event_id: eventId }),
  getById: (id: string) => get(`/alerts/${id}`),
  create: (alert: any) => post('/alerts/', alert),
  update: (id: string, alert: any) => put(`/alerts/${id}`, alert),
  deactivate: (id: string) => patch(`/alerts/${id}/deactivate`),
  delete: (id: string) => del(`/alerts/${id}`),
};

// ============================================
// Inference API (Image Upload for Crowd Counting)
// ============================================
export const inferenceAPI = {
  countPeople: async (file: File, eventId?: string, areaName?: string, radiusM?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    if (eventId) formData.append('event_id', eventId);
    if (areaName) formData.append('area_name', areaName);
    if (radiusM) formData.append('radius_m', radiusM.toString());
    formData.append('save_record', 'true');

    const response = await apiClient.post('/inference/count', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// Export the configured axios instance for custom requests
export { apiClient };

export default {
  auth: authAPI,
  events: eventsAPI,
  zones: zonesAPI,
  lostPersons: lostPersonsAPI,
  medicalFacilities: medicalFacilitiesAPI,
  emergencyExits: emergencyExitsAPI,
  feedback: feedbackAPI,
  washroomFacilities: washroomFacilitiesAPI,
  medicalEmergencies: medicalEmergenciesAPI,
  alerts: alertsAPI,
  inference: inferenceAPI,
};
