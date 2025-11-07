export interface Organizer {
  id: string;
  organizer_id: string;
  name: string;
  email: string;
}

export interface Event {
  id: string;
  organizer_id: string;
  name: string;
  location: string;
  date: string;
  attendees_count: number;
  status: string;
  created_at: string;
}

export interface Zone {
  id: string;
  event_id: string;
  name: string;
  capacity: number;
  current_density: number;
  density_status: 'crowded' | 'moderate' | 'low';
  image_url: string | null;
  last_updated: string;
  created_at: string;
}

export interface LostPerson {
  id: string;
  event_id: string;
  name: string;
  age: number;
  gender: string;
  photo_url: string | null;
  last_seen_location: string;
  last_seen_time: string;
  description: string;
  reporter_name: string;
  reporter_phone: string;
  status: 'missing' | 'found';
  created_at: string;
}

export interface MedicalFacility {
  id: string;
  event_id: string;
  facility_name: string;
  facility_type: 'hospital' | 'clinic' | 'first-aid';
  contact_number: string;
  address: string | null;
  created_at: string;
}

export interface EmergencyExit {
  id: string;
  event_id: string;
  exit_name: string;
  location: string;
  status: 'crowded' | 'moderate' | 'clear';
  last_updated: string;
  created_at: string;
}

export interface Feedback {
  id: string;
  event_id: string;
  rating: number;
  category: 'general' | 'safety' | 'navigation' | 'facilities' | 'emergency';
  comment: string;
  created_at: string;
}

export interface WashroomFacility {
  id: string;
  event_id: string;
  name: string;
  gender: 'male' | 'female' | 'unisex';
  floor_level: string | null;
  capacity: number;
  availability_status: 'available' | 'occupied' | 'maintenance';
  location_details: string | null;
  created_at: string;
  updated_at: string;
}
