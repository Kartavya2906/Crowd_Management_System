import { useState } from 'react';
import { Plus, Calendar, MapPin, Users, X } from 'lucide-react';
import api from '../../services/api';
import { Event } from '../../types';

interface EventsPageProps {
  events: Event[];
  onEventSelect: (event: Event) => void;
  onEventsUpdate: () => void;
}

export default function EventsPage({ events, onEventSelect, onEventsUpdate }: EventsPageProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    date: '',
    start_time: '',
    end_time: '',
    capacity: 0,
    attendees_count: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get organizer_id from localStorage or use a default for testing
      const userId = localStorage.getItem('user_id') || 'ORG_DEFAULT_123';
      
      const eventData = {
        name: formData.name,
        description: formData.description || undefined,
        location: formData.location,
        date: formData.date,
        start_time: formData.start_time || undefined,
        end_time: formData.end_time || undefined,
        capacity: formData.capacity || undefined,
        attendees_count: formData.attendees_count,
        organizer_id: userId,
        areas: []
      };

      await api.events.create(eventData);
      
      setShowAddModal(false);
      setFormData({ 
        name: '', 
        description: '',
        location: '', 
        date: '', 
        start_time: '',
        end_time: '',
        capacity: 0,
        attendees_count: 0 
      });
      onEventsUpdate();
    } catch (err: any) {
      console.error('Failed to create event:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to create event');
      alert('Failed to create event: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            onClick={() => onEventSelect(event)}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-blue-400/50 transition cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition">
                {event.name}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                event.status === 'active'
                  ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                  : 'bg-gray-500/20 text-gray-300 border border-gray-400/30'
              }`}>
                {event.status}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-sm">{event.location}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-sm">{event.attendees_count.toLocaleString()} attendees</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <button className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 py-2 rounded-lg font-medium transition">
                View Dashboard
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl p-8 max-w-md w-full border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Add New Event</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Areas (Optional)
                </label>
                <button
                  type="button"
                  className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Area
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
