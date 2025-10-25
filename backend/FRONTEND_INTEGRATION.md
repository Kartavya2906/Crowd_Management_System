# Frontend Integration Guide

This guide helps integrate the backend API with the React/TypeScript frontend.

## API Base Configuration

Create an API client configuration file:

```typescript
// src/api/config.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Auth
  register: '/auth/register',
  login: '/auth/login',
  users: '/auth/users',
  
  // Events
  events: '/events',
  eventById: (id: string) => `/events/${id}`,
  eventStatus: (id: string) => `/events/${id}/status`,
  
  // Crowd Density
  crowdDensity: '/crowd-density',
  crowdDensityLatest: (eventId: string) => `/crowd-density/event/${eventId}/latest`,
  crowdDensityAreas: (eventId: string) => `/crowd-density/event/${eventId}/areas`,
  
  // Medical Emergencies
  medicalEmergencies: '/medical-emergencies',
  medicalEmergencyById: (id: string) => `/medical-emergencies/${id}`,
  medicalEmergencyStatus: (id: string) => `/medical-emergencies/${id}/status`,
  medicalEmergencyStats: (eventId: string) => `/medical-emergencies/stats/event/${eventId}`,
  
  // Lost Persons
  lostPersons: '/lost-persons',
  lostPersonById: (id: string) => `/lost-persons/${id}`,
  lostPersonStatus: (id: string) => `/lost-persons/${id}/status`,
  lostPersonActive: '/lost-persons/search/active',
  lostPersonStats: (eventId: string) => `/lost-persons/stats/event/${eventId}`,
  
  // Feedback
  feedback: '/feedback',
  feedbackStats: (eventId: string) => `/feedback/event/${eventId}/stats`,
  feedbackRecent: (eventId: string) => `/feedback/event/${eventId}/recent`,
  
  // Facilities
  facilities: '/facilities',
  facilityById: (id: string) => `/facilities/${id}`,
  facilityAvailability: (id: string) => `/facilities/${id}/availability`,
  facilityNearby: '/facilities/nearby/search',
  
  // Alerts
  alerts: '/alerts',
  alertById: (id: string) => `/alerts/${id}`,
  alertDeactivate: (id: string) => `/alerts/${id}/deactivate`,
  weatherAlerts: '/alerts/weather',
  weatherAlertLatest: (eventId: string) => `/alerts/weather/event/${eventId}/latest`,
};
```

## Type Definitions

```typescript
// src/types/api.ts

export interface Location {
  lat: number;
  lon: number;
}

export interface Area {
  name: string;
  location: Location;
  radius_m: number;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  location: string;
  capacity: number;
  organizer_id: string;
  status: 'upcoming' | 'live' | 'completed';
  areas: Area[];
  created_at: string;
}

export interface CrowdDensity {
  id: string;
  event_id: string;
  area_name: string;
  location: Location;
  radius_m: number;
  person_count: number;
  area_m2?: number;
  people_per_m2?: number;
  density_level?: 'Safe' | 'Moderate' | 'Risky' | 'Overcrowded';
  timestamp: string;
}

export interface MedicalEmergency {
  id: string;
  user_id: string;
  event_id?: string;
  emergency_type: 'injury' | 'illness' | 'heatstroke' | 'cardiac' | 'other';
  severity: 'minor' | 'moderate' | 'severe' | 'critical';
  patient_name: string;
  patient_age: number;
  description: string;
  location: string;
  status: 'reported' | 'responder_dispatched' | 'on_scene' | 'transported' | 'resolved';
  responder_name?: string;
  response_time?: number;
  reported_at: string;
}

export interface LostPersonReport {
  id: string;
  reporter_id: string;
  reporter_name: string;
  reporter_contact: string;
  person_name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  description?: string;
  last_seen_location: string;
  last_seen_time: string;
  photo_url?: string;
  event_id?: string;
  status: 'reported' | 'searching' | 'found' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'critical';
  reported_at: string;
}

export interface Feedback {
  id: string;
  user_id: string;
  event_id: string;
  rating: number;
  comments?: string;
  submitted_at: string;
  ai_sentiment?: string;
}

export interface Alert {
  id: string;
  event_id: string;
  title: string;
  message: string;
  alert_type: 'warning' | 'emergency' | 'info' | 'weather';
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  created_at: string;
}
```

## API Service

```typescript
// src/api/service.ts
import { API_BASE_URL, API_ENDPOINTS } from './config';

class APIService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Events
  async getEvents(filters?: { status?: string; organizer_id?: string }) {
    const params = new URLSearchParams(filters as any);
    return this.request<Event[]>(`${API_ENDPOINTS.events}?${params}`);
  }

  async createEvent(event: Omit<Event, 'id' | 'status' | 'created_at'>) {
    return this.request<Event>(API_ENDPOINTS.events, {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async updateEventStatus(eventId: string, status: string) {
    return this.request(`${API_ENDPOINTS.eventStatus(eventId)}?status=${status}`, {
      method: 'PATCH',
    });
  }

  // Crowd Density
  async getCrowdDensity(eventId?: string) {
    const params = eventId ? `?event_id=${eventId}` : '';
    return this.request<CrowdDensity[]>(`${API_ENDPOINTS.crowdDensity}${params}`);
  }

  async createCrowdDensity(data: Omit<CrowdDensity, 'id' | 'timestamp'>) {
    return this.request<CrowdDensity>(API_ENDPOINTS.crowdDensity, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAreasDensity(eventId: string) {
    return this.request<CrowdDensity[]>(API_ENDPOINTS.crowdDensityAreas(eventId));
  }

  // Medical Emergencies
  async getMedicalEmergencies(filters?: {
    event_id?: string;
    status?: string;
    severity?: string;
  }) {
    const params = new URLSearchParams(filters as any);
    return this.request<MedicalEmergency[]>(
      `${API_ENDPOINTS.medicalEmergencies}?${params}`
    );
  }

  async createMedicalEmergency(data: any) {
    return this.request<MedicalEmergency>(API_ENDPOINTS.medicalEmergencies, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmergencyStatus(
    emergencyId: string,
    status: string,
    responderName?: string,
    responseTime?: number
  ) {
    const params = new URLSearchParams({
      new_status: status,
      ...(responderName && { responder_name: responderName }),
      ...(responseTime && { response_time: responseTime.toString() }),
    });
    return this.request<MedicalEmergency>(
      `${API_ENDPOINTS.medicalEmergencyStatus(emergencyId)}?${params}`,
      { method: 'PATCH' }
    );
  }

  async getEmergencyStats(eventId: string) {
    return this.request(API_ENDPOINTS.medicalEmergencyStats(eventId));
  }

  // Lost Persons
  async getLostPersons(filters?: {
    event_id?: string;
    status?: string;
    priority?: string;
  }) {
    const params = new URLSearchParams(filters as any);
    return this.request<LostPersonReport[]>(
      `${API_ENDPOINTS.lostPersons}?${params}`
    );
  }

  async createLostPersonReport(data: any) {
    return this.request<LostPersonReport>(API_ENDPOINTS.lostPersons, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLostPersonStatus(reportId: string, status: string) {
    return this.request<LostPersonReport>(
      `${API_ENDPOINTS.lostPersonStatus(reportId)}?new_status=${status}`,
      { method: 'PATCH' }
    );
  }

  async getActiveLostPersons(eventId?: string) {
    const params = eventId ? `?event_id=${eventId}` : '';
    return this.request<LostPersonReport[]>(
      `${API_ENDPOINTS.lostPersonActive}${params}`
    );
  }

  // Feedback
  async getFeedback(eventId?: string) {
    const params = eventId ? `?event_id=${eventId}` : '';
    return this.request<Feedback[]>(`${API_ENDPOINTS.feedback}${params}`);
  }

  async createFeedback(data: Omit<Feedback, 'id' | 'submitted_at' | 'ai_sentiment'>) {
    return this.request<Feedback>(API_ENDPOINTS.feedback, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getFeedbackStats(eventId: string) {
    return this.request(API_ENDPOINTS.feedbackStats(eventId));
  }

  // Alerts
  async getAlerts(filters?: {
    event_id?: string;
    alert_type?: string;
    is_active?: boolean;
  }) {
    const params = new URLSearchParams(filters as any);
    return this.request<Alert[]>(`${API_ENDPOINTS.alerts}?${params}`);
  }

  async createAlert(data: Omit<Alert, 'id' | 'is_active' | 'created_at'>) {
    return this.request<Alert>(API_ENDPOINTS.alerts, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLatestWeatherAlert(eventId: string) {
    return this.request(API_ENDPOINTS.weatherAlertLatest(eventId));
  }
}

export const apiService = new APIService();
```

## React Hooks

```typescript
// src/hooks/useEvents.ts
import { useState, useEffect } from 'react';
import { apiService } from '../api/service';
import { Event } from '../types/api';

export function useEvents(filters?: { status?: string }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const data = await apiService.getEvents(filters);
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [filters?.status]);

  return { events, loading, error, refetch: () => fetchEvents() };
}
```

```typescript
// src/hooks/useMedicalEmergencies.ts
import { useState, useEffect } from 'react';
import { apiService } from '../api/service';
import { MedicalEmergency } from '../types/api';

export function useMedicalEmergencies(eventId?: string) {
  const [emergencies, setEmergencies] = useState<MedicalEmergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmergencies = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMedicalEmergencies({ event_id: eventId });
      setEmergencies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch emergencies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencies();
  }, [eventId]);

  return { emergencies, loading, error, refetch: fetchEmergencies };
}
```

## Environment Variables

Create a `.env` file in the frontend root:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Usage Examples

```typescript
// In a component
import { useEvents } from '../hooks/useEvents';
import { apiService } from '../api/service';

function EventsList() {
  const { events, loading, error } = useEvents({ status: 'live' });

  const handleCreateEvent = async (eventData) => {
    try {
      const newEvent = await apiService.createEvent(eventData);
      console.log('Event created:', newEvent);
      // Refresh events list
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
```

## WebSocket Integration (Future Enhancement)

For real-time updates, consider adding WebSocket support:

```typescript
// src/api/websocket.ts
export class WebSocketService {
  private ws: WebSocket | null = null;

  connect(eventId: string) {
    this.ws = new WebSocket(`ws://localhost:8000/ws/${eventId}`);
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Handle real-time updates
    };
  }

  disconnect() {
    this.ws?.close();
  }
}
```

## Error Handling Best Practices

1. Always wrap API calls in try-catch blocks
2. Display user-friendly error messages
3. Log errors for debugging
4. Implement retry logic for failed requests
5. Handle network errors gracefully

## Performance Optimization

1. Use React Query or SWR for caching
2. Implement pagination for large datasets
3. Debounce search inputs
4. Use optimistic updates for better UX
5. Implement request cancellation for unmounted components
