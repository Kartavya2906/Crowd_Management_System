import { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Users, X, Loader2, Trash2, Edit, ArrowRight } from 'lucide-react';
import { 
  createEvent, 
  getAllEvents, 
  getEventsByStatus,
  updateEvent,
  updateEventStatus,
  deleteEvent,
  EventResponse,
  Area 
} from '../../services/eventService';

interface EventsPageProps {
  organizerId?: string;
  onEventSelect?: (event: EventResponse) => void;
}

export default function EventsPage({ organizerId = 'USR1CC763E064C2', onEventSelect }: EventsPageProps) {
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

  // Fetch events on mount and when filter changes
  useEffect(() => {
    fetchEvents();
  }, [statusFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let data: EventResponse[];
      
      if (statusFilter === 'all') {
        data = await getAllEvents();
      } else {
        data = await getEventsByStatus(statusFilter);
      }
      
      setEvents(data);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      alert(`Failed to fetch events: ${error.message || 'Please check if backend is running'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Ensure organizerId is not empty
      if (!organizerId || organizerId.trim() === '') {
        alert('Organizer ID is missing. Please log in again.');
        return;
      }

      // Parse and format datetime properly
      let startTime = formData.start_time;
      let endTime = formData.end_time;

      // Check if we need to add seconds
      if (startTime && !startTime.includes(':00:')) {
        // If format is YYYY-MM-DDTHH:MM, add :00
        if (startTime.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
          startTime = `${startTime}:00`;
        }
      }

      if (endTime && !endTime.includes(':00:')) {
        if (endTime.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
          endTime = `${endTime}:00`;
        }
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        start_time: startTime,
        end_time: endTime,
        location: formData.location,
        capacity: formData.capacity,
        organizer_id: organizerId, // This must be included!
        ...(formData.areas.length > 0 && { areas: formData.areas })
      };

      console.log('Submitting payload with organizer_id:', JSON.stringify(payload, null, 2));
      
      const result = await createEvent(payload);
      console.log('Event created:', result);

      setShowAddModal(false);
      resetForm();
      fetchEvents();
      alert('Event created successfully!');
    } catch (error: any) {
      console.error('Full error object:', error);
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      alert(`Failed to create event: ${errorMessage}`);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEvent) return;

    try {
      // Convert datetime-local format to ISO format with seconds
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

      await updateEvent(selectedEvent.id, payload);

      setShowEditModal(false);
      setSelectedEvent(null);
      resetForm();
      fetchEvents();
      alert('Event updated successfully!');
    } catch (error: any) {
      console.error('Error updating event:', error);
      alert(`Failed to update event: ${error.message || 'Unknown error'}`);
    }
  };

  const handleStatusChange = async (eventId: string, newStatus: 'live' | 'completed') => {
    try {
      await updateEventStatus(eventId, newStatus);
      fetchEvents();
      alert(`Event status updated to ${newStatus}!`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update event status');
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await deleteEvent(eventId);
      fetchEvents();
      alert('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
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
    <div className="p-8">
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

      {/* Status Filter */}
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

              <p className="text-gray-400 text-sm mb-4">{event.description}</p>

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

              {/* View Dashboard Button */}
              {onEventSelect && (
                <button
                  onClick={() => onEventSelect(event)}
                  className="w-full mt-4 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 border border-purple-400/30"
                >
                  View Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

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

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-xl p-8 max-w-2xl w-full border border-white/20 my-8">
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

            <form onSubmit={showAddModal ? handleSubmit : handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
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
                  required
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
                    onChange={(e) => {
                      console.log('Start time input:', e.target.value);
                      setFormData({ ...formData, start_time: e.target.value });
                    }}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => {
                      console.log('End time input:', e.target.value);
                      setFormData({ ...formData, end_time: e.target.value });
                    }}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
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
                  required
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
                  required
                  min="1"
                />
              </div>

              {/* Areas Section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Event Areas (Optional)
                  </label>
                  <button
                    type="button"
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
                        type="button"
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
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition"
              >
                {showAddModal ? 'Create Event' : 'Update Event'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}