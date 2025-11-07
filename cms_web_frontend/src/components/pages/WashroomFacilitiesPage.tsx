import { useState, useEffect } from 'react';
import { Plus, Users, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Event, WashroomFacility } from '../../types';

interface WashroomFacilitiesPageProps {
  events: Event[];
}

export default function WashroomFacilitiesPage({ events }: WashroomFacilitiesPageProps) {
  const [washrooms, setWashrooms] = useState<WashroomFacility[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gender: 'unisex' as 'male' | 'female' | 'unisex',
    floor_level: '',
    capacity: 1,
    availability_status: 'available' as 'available' | 'occupied' | 'maintenance',
    location_details: ''
  });

  useEffect(() => {
    if (selectedEvent) {
      loadWashrooms();
    }
  }, [selectedEvent]);

  const loadWashrooms = async () => {
    const { data } = await supabase
      .from('washroom_facilities')
      .select('*')
      .eq('event_id', selectedEvent)
      .order('gender', { ascending: true });

    if (data) {
      setWashrooms(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from('washroom_facilities')
      .insert([{
        event_id: selectedEvent,
        ...formData
      }]);

    if (!error) {
      setShowAddModal(false);
      setFormData({
        name: '',
        gender: 'unisex',
        floor_level: '',
        capacity: 1,
        availability_status: 'available',
        location_details: ''
      });
      loadWashrooms();
    }
  };

  const updateStatus = async (id: string, status: 'available' | 'occupied' | 'maintenance') => {
    await supabase
      .from('washroom_facilities')
      .update({ availability_status: status, updated_at: new Date().toISOString() })
      .eq('id', id);

    loadWashrooms();
  };

  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case 'male':
        return '♂';
      case 'female':
        return '♀';
      case 'unisex':
        return '⚬';
      default:
        return '•';
    }
  };

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'male':
        return 'from-blue-500/20 to-blue-600/20 border-blue-400/30 text-blue-300';
      case 'female':
        return 'from-pink-500/20 to-pink-600/20 border-pink-400/30 text-pink-300';
      case 'unisex':
        return 'from-purple-500/20 to-purple-600/20 border-purple-400/30 text-purple-300';
      default:
        return 'from-gray-500/20 to-gray-600/20 border-gray-400/30 text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'occupied':
        return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
      case 'maintenance':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const maleWashrooms = washrooms.filter(w => w.gender === 'male');
  const femaleWashrooms = washrooms.filter(w => w.gender === 'female');
  const unisexWashrooms = washrooms.filter(w => w.gender === 'unisex');

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Washroom Facilities</h1>
      <p className="text-gray-300 mb-8">Manage and monitor washroom availability by gender classification</p>

      <div className="flex gap-4 mb-8">
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select an event</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>{event.name}</option>
          ))}
        </select>

        {selectedEvent && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            <Plus className="w-5 h-5" />
            Add Washroom
          </button>
        )}
      </div>

      {selectedEvent && (
        <div className="space-y-8">
          {[
            { title: 'Male Washrooms', icon: '♂', washrooms: maleWashrooms, color: 'from-blue-500/10' },
            { title: 'Female Washrooms', icon: '♀', washrooms: femaleWashrooms, color: 'from-pink-500/10' },
            { title: 'Unisex Washrooms', icon: '⚬', washrooms: unisexWashrooms, color: 'from-purple-500/10' }
          ].map((section) => (
            section.washrooms.length > 0 && (
              <div key={section.title}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`text-2xl w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br ${section.color}`}>
                    {section.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                  <span className="text-sm text-gray-400">({section.washrooms.length})</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {section.washrooms.map((washroom) => (
                    <div
                      key={washroom.id}
                      className={`bg-gradient-to-br ${getGenderColor(washroom.gender)} backdrop-blur-lg rounded-xl p-6 border`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">
                            {washroom.name}
                          </h3>
                          {washroom.floor_level && (
                            <p className="text-sm text-gray-300">{washroom.floor_level}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">Capacity:</span>
                          <span className="text-white font-medium">{washroom.capacity} stalls</span>
                        </div>
                        {washroom.location_details && (
                          <div className="text-xs text-gray-300 bg-white/5 p-2 rounded-lg">
                            {washroom.location_details}
                          </div>
                        )}
                      </div>

                      <div className={`flex items-center justify-center py-2 rounded-lg border mb-4 ${getStatusColor(washroom.availability_status)}`}>
                        <span className="font-semibold uppercase text-sm">
                          {washroom.availability_status}
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 mb-4">
                        Last updated: {new Date(washroom.updated_at).toLocaleString()}
                      </p>

                      <div className="space-y-2">
                        <p className="text-xs text-gray-400 mb-2">Update Status:</p>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => updateStatus(washroom.id, 'available')}
                            className={`py-2 px-2 rounded-lg text-xs font-medium transition ${
                              washroom.availability_status === 'available'
                                ? 'bg-green-500/30 text-green-300 border border-green-400/50'
                                : 'bg-green-500/10 text-green-300 hover:bg-green-500/20'
                            }`}
                          >
                            Available
                          </button>
                          <button
                            onClick={() => updateStatus(washroom.id, 'occupied')}
                            className={`py-2 px-2 rounded-lg text-xs font-medium transition ${
                              washroom.availability_status === 'occupied'
                                ? 'bg-amber-500/30 text-amber-300 border border-amber-400/50'
                                : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                            }`}
                          >
                            Occupied
                          </button>
                          <button
                            onClick={() => updateStatus(washroom.id, 'maintenance')}
                            className={`py-2 px-2 rounded-lg text-xs font-medium transition ${
                              washroom.availability_status === 'maintenance'
                                ? 'bg-red-500/30 text-red-300 border border-red-400/50'
                                : 'bg-red-500/10 text-red-300 hover:bg-red-500/20'
                            }`}
                          >
                            Maintenance
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl p-8 max-w-md w-full border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Add Washroom</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Washroom Name/Location
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g., Main Floor Male"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gender Classification
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Floor/Level
                </label>
                <input
                  type="text"
                  value={formData.floor_level}
                  onChange={(e) => setFormData({ ...formData, floor_level: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g., Ground Floor, 1st Floor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Capacity (Number of Stalls)
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location Details
                </label>
                <textarea
                  value={formData.location_details}
                  onChange={(e) => setFormData({ ...formData, location_details: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g., Near entrance, wheelchair accessible"
                  rows={2}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition"
              >
                Add Washroom
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
