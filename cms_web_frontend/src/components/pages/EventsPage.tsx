import { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Users, X, Loader2, Trash2, Edit, ArrowRight } from 'lucide-react';

// Replace with your actual backend URL
const API_BASE_URL = 'https://crowd-management-system-lx1h.onrender.com';

// Types
interface Area {
  name: string;
  location: {
    lat: number;
    lon: number;
  };
  radius_m: number;
}

interface EventPayload {
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  capacity: number;
  organizer_id: string;
  areas?: Area[];
}

interface EventResponse {
  id: string;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  capacity: number;
  attendees_count: number;
  areas: Area[];
  date: string | null;
  organizer_id: string;
  status: 'upcoming' | 'live' | 'completed';
  created_at: string;
}

interface Zone {
  id: string;
  event_id: string;
  name: string;
  capacity: number;
  current_density: number;
  density_status: 'low' | 'moderate' | 'crowded';
  image_url: string | null;
  last_updated: string;
  created_at: string;
}

// Event Service
const eventService = {
  async createEvent(eventData: EventPayload): Promise<EventResponse> {
    const response = await fetch(`${API_BASE_URL}/events/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.detail || 'Failed to create event');
    }
    return response.json();
  },

  async getAllEvents(): Promise<EventResponse[]> {
    const response = await fetch(`${API_BASE_URL}/events/`);
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
  },

  async getEventsByStatus(status: string): Promise<EventResponse[]> {
    const response = await fetch(`${API_BASE_URL}/events/?status=${status}`);
    if (!response.ok) throw new Error('Failed to fetch events by status');
    return response.json();
  },

  async updateEvent(eventId: string, eventData: EventPayload): Promise<EventResponse> {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    if (!response.ok) throw new Error('Failed to update event');
    return response.json();
  },

  async updateEventStatus(eventId: string, status: 'live' | 'completed'): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/status?status=${status}`, {
      method: 'PATCH',
    });
    if (!response.ok) throw new Error('Failed to update event status');
    return response.json();
  },

  async deleteEvent(eventId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete event');
    return response.json();
  },
};

// Zone Service
const zoneService = {
  async getZonesByEvent(eventId: string): Promise<Zone[]> {
    const response = await fetch(`${API_BASE_URL}/zones/?event_id=${eventId}`);
    if (!response.ok) throw new Error('Failed to fetch zones');
    return response.json();
  },

  async createZone(data: any): Promise<Zone> {
    try {
      console.log('Zone API Request:', {
        url: `${API_BASE_URL}/zones/`,
        payload: {
          ...data,
          current_density: 0,
          density_status: 'low'
        }
      });

      const response = await fetch(`${API_BASE_URL}/zones/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          current_density: 0,
          density_status: 'low'
        }),
      });

      console.log('Zone API Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Zone API Error:', errorData);
        throw new Error(errorData?.detail || errorData?.message || `HTTP ${response.status}: Failed to create zone`);
      }

      const result = await response.json();
      console.log('Zone created:', result);
      return result;
    } catch (error) {
      console.error('Zone Service Error:', error);
      throw error;
    }
  },

  async updateZoneDensity(zoneId: string, currentDensity: number): Promise<Zone> {
    const response = await fetch(
      `${API_BASE_URL}/zones/${zoneId}/density?current_density=${currentDensity}`,
      { method: 'PATCH' }
    );
    if (!response.ok) throw new Error('Failed to update zone density');
    return response.json();
  },

  async countPeopleInImage(imageFile: File): Promise<{ image_filename: string; person_count: number }> {
    const formData = new FormData();
    formData.append('file', imageFile);
    const response = await fetch(`${API_BASE_URL}/inference/count`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to count people in image');
    return response.json();
  },

  calculateDensityStatus(currentDensity: number, capacity: number): 'low' | 'moderate' | 'crowded' {
    const percentage = (currentDensity / capacity) * 100;
    if (percentage >= 80) return 'crowded';
    if (percentage >= 50) return 'moderate';
    return 'low';
  },
};

/* Event Dashboard Component - Now handled by separate EventDashboard.tsx component
function EventDashboard({ event, onBack }: { event: EventResponse; onBack: () => void }) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [showAddZone, setShowAddZone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [updatingZone, setUpdatingZone] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: 0,
    image_url: ''
  });

  useEffect(() => {
    if (event?.id) {
      loadZones();
    }
  }, [event?.id]);

  const loadZones = async () => {
    try {
      setLoading(true);
      const data = await zoneService.getZonesByEvent(event.id);
      setZones(data);
    } catch (error) {
      console.error('Error loading zones:', error);
      alert('Failed to load zones. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!imageFile) {
      alert('Please select an image first');
      return 0;
    }

    try {
      setAnalyzingImage(true);
      const result = await zoneService.countPeopleInImage(imageFile);
      
      const density = formData.capacity > 0 
        ? result.person_count / formData.capacity 
        : 0;

      alert(`Analysis complete! Detected ${result.person_count} people. Estimated density: ${density.toFixed(2)} persons/m²`);
      
      return result.person_count;
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('Failed to analyze image. Please try again.');
      return 0;
    } finally {
      setAnalyzingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || formData.capacity <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      let personCount = 0;
      
      // Analyze image first if provided
      if (imageFile) {
        try {
          setAnalyzingImage(true);
          const result = await zoneService.countPeopleInImage(imageFile);
          personCount = result.person_count;
          
          console.log('AI detected people:', personCount);
          alert(`AI Analysis: Detected ${personCount} people`);
        } catch (error) {
          console.error('Image analysis error:', error);
          alert('Image analysis failed, creating zone without density data...');
        } finally {
          setAnalyzingImage(false);
        }
      }

      // Create zone payload
      const zonePayload = {
        event_id: event.id,
        name: formData.name,
        capacity: formData.capacity,
        image_url: formData.image_url || null,
      };

      console.log('Creating zone with payload:', zonePayload);

      // Create the zone
      const newZone = await zoneService.createZone(zonePayload);
      console.log('Zone created successfully:', newZone);

      // IMPORTANT: Update density if we have person count
      // Your API expects the ABSOLUTE density value (person_count), not the ratio
      if (personCount > 0) {
        try {
          console.log(`Updating zone ${newZone.id} with person count: ${personCount}`);
          const updatedZone = await zoneService.updateZoneDensity(newZone.id, personCount);
          console.log('Density updated successfully:', updatedZone);
          alert(`Zone created! Density: ${updatedZone.current_density} people, Status: ${updatedZone.density_status}`);
        } catch (error) {
          console.error('Failed to update density:', error);
          alert('Zone created but density update failed. Please check console.');
        }
      } else {
        alert('Zone created successfully (no density data)');
      }

      // Reset and reload
      setShowAddZone(false);
      setFormData({ name: '', capacity: 0, image_url: '' });
      setImageFile(null);
      setImagePreview('');
      await loadZones();
      
    } catch (error: any) {
      console.error('Error creating zone:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      alert(`Failed to create zone: ${errorMessage}`);
    } finally {
      setLoading(false);
      setAnalyzingImage(false);
    }
  };

  const getDensityColor = (status: string) => {
    switch (status) {
      case 'crowded': return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'moderate': return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const handleManualDensityUpdate = async (zoneId: string) => {
    const testCount = prompt('Enter test person count (e.g., 150):');
    if (!testCount || isNaN(Number(testCount))) return;

    try {
      setUpdatingZone(zoneId);
      console.log(`Manually updating zone ${zoneId} with count: ${testCount}`);
      
      const updated = await zoneService.updateZoneDensity(zoneId, Number(testCount));
      console.log('Manual update response:', updated);
      
      await loadZones();
      alert(`Zone density updated! Current: ${updated.current_density}, Status: ${updated.density_status}`);
    } catch (error) {
      console.error('Manual update failed:', error);
      alert('Failed to update density');
    } finally {
      setUpdatingZone(null);
    }
  };

  const getDensityLabel = (zone: Zone) => {
    // The current_density from API represents actual person count, not persons/m²
    // Calculate the actual density ratio
    const actualDensity = zone.capacity > 0 ? zone.current_density / zone.capacity : 0;
    return `${actualDensity.toFixed(2)} persons/m²`;
  };

  const getOccupancyPercentage = (zone: Zone) => {
    // current_density is the person count, not the ratio
    const percentage = zone.capacity > 0 ? (zone.current_density / zone.capacity) * 100 : 0;
    return Math.min(percentage, 100).toFixed(0);
  };

  return (
    <div className="p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Events
      </button>

      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{event.name}</h1>
        <div className="flex flex-wrap gap-4 text-gray-300">
          <span>{event.location}</span>
          <span>•</span>
          <span>{new Date(event.start_time).toLocaleDateString()}</span>
          <span>•</span>
          <span>{event.attendees_count.toLocaleString()} attendees</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Zone Management</h2>
        <button
          onClick={() => setShowAddZone(true)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-medium transition"
        >
          <Plus className="w-5 h-5" />
          Add Zone
        </button>
      </div>

      {loading && zones.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      ) : zones.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No zones added yet. Click "Add Zone" to create your first zone.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 hover:border-blue-400/50 transition"
            >
              {zone.image_url && (
                <img src={zone.image_url} alt={zone.name} className="w-full h-48 object-cover" />
              )}
              <div className="p-5">
                <h3 className="text-xl font-bold text-white mb-3">{zone.name}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Capacity:</span>
                    <span className="text-white font-medium">{zone.capacity.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Density:</span>
                    <span className="text-white font-medium">{getDensityLabel(zone)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Occupancy:</span>
                    <span className="text-white font-medium">{getOccupancyPercentage(zone)}%</span>
                  </div>
                </div>
                <div className={`flex items-center justify-center py-2 rounded-lg border ${getDensityColor(zone.density_status)}`}>
                  <span className="font-semibold uppercase text-sm">{zone.density_status}</span>
                </div>

                <button
                  onClick={() => handleManualDensityUpdate(zone.id)}
                  disabled={updatingZone === zone.id}
                  className="w-full mt-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                >
                  {updatingZone === zone.id ? 'Updating...' : 'Test Update Density'}
                </button>

                <p className="text-xs text-gray-400 mt-3">
                  Last updated: {new Date(zone.last_updated).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddZone && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl p-8 max-w-md w-full border border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Add New Zone</h2>
              <button
                onClick={() => {
                  setShowAddZone(false);
                  setImageFile(null);
                  setImagePreview('');
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Zone Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g., Main Hall"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Capacity (people) *</label>
                <input
                  type="number"
                  value={formData.capacity || ''}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  min="1"
                  placeholder="500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Image URL (Optional)</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload Image for AI Density Analysis (Optional)
                </label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center hover:border-blue-400/50 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="zone-image"
                  />
                  <label htmlFor="zone-image" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-300">
                      {imageFile ? imageFile.name : 'Click to upload image'}
                    </span>
                  </label>
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="mt-3 max-h-32 mx-auto rounded-lg" />
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  AI will automatically count people and calculate density
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || analyzingImage}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                {loading || analyzingImage ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {analyzingImage ? 'Analyzing Image...' : 'Creating Zone...'}
                  </>
                ) : (
                  'Add Zone'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
*/

interface EventsPageProps {
  organizerId: string;
  onEventSelect?: (event: EventResponse) => void;
}

// Main App Component
export default function App({ organizerId, onEventSelect }: EventsPageProps) {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'live' | 'completed'>('all');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    capacity: 100,
    areas: [] as Area[]
  });

  useEffect(() => {
    fetchEvents();
  }, [statusFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let data: EventResponse[];
      
      if (statusFilter === 'all') {
        data = await eventService.getAllEvents();
      } else {
        data = await eventService.getEventsByStatus(statusFilter);
      }
      
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const startTime = formData.start_time ? `${formData.start_time}:00` : '';
      const endTime = formData.end_time ? `${formData.end_time}:00` : '';

      const payload = {
        name: formData.name,
        description: formData.description,
        start_time: startTime,
        end_time: endTime,
        location: formData.location,
        capacity: formData.capacity,
        organizer_id: organizerId,
        areas: formData.areas.length > 0 ? formData.areas : undefined
      };
      
      await eventService.createEvent(payload);

      setShowAddModal(false);
      resetForm();
      fetchEvents();
      alert('Event created successfully!');
    } catch (error: any) {
      alert(`Failed to create event: ${error.message || 'Unknown error'}`);
    }
  };

  const handleUpdate = async () => {
    if (!selectedEvent) return;

    try {
      const startTime = formData.start_time ? `${formData.start_time}:00` : '';
      const endTime = formData.end_time ? `${formData.end_time}:00` : '';

      const payload = {
        name: formData.name,
        description: formData.description,
        start_time: startTime,
        end_time: endTime,
        location: formData.location,
        capacity: formData.capacity,
        organizer_id: organizerId,
        areas: formData.areas.length > 0 ? formData.areas : undefined
      };

      await eventService.updateEvent(selectedEvent.id, payload);

      setShowEditModal(false);
      setSelectedEvent(null);
      resetForm();
      fetchEvents();
      alert('Event updated successfully!');
    } catch (error: any) {
      alert(`Failed to update event: ${error.message || 'Unknown error'}`);
    }
  };

  const handleStatusChange = async (eventId: string, newStatus: 'live' | 'completed') => {
    try {
      await eventService.updateEventStatus(eventId, newStatus);
      fetchEvents();
      alert(`Event status updated to ${newStatus}!`);
    } catch (error) {
      alert('Failed to update event status');
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await eventService.deleteEvent(eventId);
      fetchEvents();
      alert('Event deleted successfully!');
    } catch (error) {
      alert('Failed to delete event');
    }
  };

  const openEditModal = (event: EventResponse) => {
    setSelectedEvent(event);
    setFormData({
      name: event.name,
      description: event.description,
      start_time: event.start_time.split('T')[0] + 'T' + event.start_time.split('T')[1].substring(0, 5),
      end_time: event.end_time.split('T')[0] + 'T' + event.end_time.split('T')[1].substring(0, 5),
      location: event.location,
      capacity: event.capacity,
      areas: event.areas
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      start_time: '',
      end_time: '',
      location: '',
      capacity: 100,
      areas: []
    });
  };

  const addArea = () => {
    setFormData({
      ...formData,
      areas: [
        ...formData.areas,
        { name: '', location: { lat: 28.6139, lon: 77.2090 }, radius_m: 50 }
      ]
    });
  };

  const removeArea = (index: number) => {
    setFormData({
      ...formData,
      areas: formData.areas.filter((_, i) => i !== index)
    });
  };

  const updateArea = (index: number, field: string, value: any) => {
    const newAreas = [...formData.areas];
    if (field === 'lat' || field === 'lon') {
      newAreas[index] = {
        ...newAreas[index],
        location: {
          ...newAreas[index].location,
          [field]: parseFloat(value)
        }
      };
    } else if (field === 'radius_m') {
      newAreas[index] = { ...newAreas[index], [field]: parseFloat(value) };
    } else {
      newAreas[index] = { ...newAreas[index], [field]: value };
    }
    setFormData({ ...formData, areas: newAreas });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Events Management</h1>
          <p className="text-gray-300">Manage and monitor your events</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Event
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        {(['all', 'upcoming', 'live', 'completed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              statusFilter === status
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-blue-400/50 transition group"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition">
                  {event.name}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  event.status === 'live'
                    ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                    : event.status === 'upcoming'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                    : 'bg-gray-500/20 text-gray-300 border border-gray-400/30'
                }`}>
                  {event.status}
                </span>
              </div>

              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">{event.location}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">
                    {new Date(event.start_time).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">
                    {event.attendees_count} / {event.capacity} attendees
                  </span>
                </div>
              </div>

              <button
                onClick={() => onEventSelect?.(event)}
                className="w-full mt-4 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 border border-purple-400/30"
              >
                View Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
                <button
                  onClick={() => openEditModal(event)}
                  className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                {event.status === 'upcoming' && (
                  <button
                    onClick={() => handleStatusChange(event.id, 'live')}
                    className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 py-2 rounded-lg font-medium transition"
                  >
                    Start
                  </button>
                )}
                {event.status === 'live' && (
                  <button
                    onClick={() => handleStatusChange(event.id, 'completed')}
                    className="flex-1 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 py-2 rounded-lg font-medium transition"
                  >
                    Complete
                  </button>
                )}
                <button
                  onClick={() => handleDelete(event.id)}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-300 py-2 px-3 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-xl p-8 max-w-2xl w-full border border-white/20 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {showAddModal ? 'Add New Event' : 'Edit Event'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedEvent(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Capacity
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  min="1"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Event Areas (Optional)
                  </label>
                  <button
                    onClick={addArea}
                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Area
                  </button>
                </div>
                
                {formData.areas.map((area, index) => (
                  <div key={index} className="bg-white/5 p-4 rounded-lg mb-3 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">Area {index + 1}</span>
                      <button
                        onClick={() => removeArea(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Area Name"
                      value={area.name}
                      onChange={(e) => updateArea(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                    />
                    
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        step="0.0001"
                        placeholder="Latitude"
                        value={area.location.lat}
                        onChange={(e) => updateArea(index, 'lat', e.target.value)}
                        className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                      />
                      <input
                        type="number"
                        step="0.0001"
                        placeholder="Longitude"
                        value={area.location.lon}
                        onChange={(e) => updateArea(index, 'lon', e.target.value)}
                        className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Radius (m)"
                        value={area.radius_m}
                        onChange={(e) => updateArea(index, 'radius_m', e.target.value)}
                        className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={showAddModal ? handleSubmit : handleUpdate}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition"
              >
                {showAddModal ? 'Create Event' : 'Update Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}