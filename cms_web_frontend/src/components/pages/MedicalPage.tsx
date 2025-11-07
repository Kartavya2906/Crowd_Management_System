import { useState, useEffect } from 'react';
import { Plus, Activity, Phone, MapPin, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Event, MedicalFacility } from '../../types';

interface MedicalPageProps {
  events: Event[];
}

export default function MedicalPage({ events }: MedicalPageProps) {
  const [facilities, setFacilities] = useState<MedicalFacility[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    facility_name: '',
    facility_type: 'hospital' as 'hospital' | 'clinic' | 'first-aid',
    contact_number: '',
    address: ''
  });

  useEffect(() => {
    if (selectedEvent) {
      loadFacilities();
    }
  }, [selectedEvent]);

  const loadFacilities = async () => {
    const { data } = await supabase
      .from('medical_facilities')
      .select('*')
      .eq('event_id', selectedEvent)
      .order('created_at', { ascending: false });

    if (data) {
      setFacilities(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from('medical_facilities')
      .insert([{
        event_id: selectedEvent,
        ...formData
      }]);

    if (!error) {
      setShowAddModal(false);
      setFormData({
        facility_name: '',
        facility_type: 'hospital',
        contact_number: '',
        address: ''
      });
      loadFacilities();
    }
  };

  const getFacilityIcon = (type: string) => {
    return Activity;
  };

  const getFacilityColor = (type: string) => {
    switch (type) {
      case 'hospital':
        return 'text-red-400';
      case 'clinic':
        return 'text-blue-400';
      case 'first-aid':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Medical Facilities</h1>
      <p className="text-gray-300 mb-8">Manage emergency medical contacts and facilities</p>

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
            Add Facility
          </button>
        )}
      </div>

      {selectedEvent && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility) => {
            const Icon = getFacilityIcon(facility.facility_type);
            return (
              <div
                key={facility.id}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-blue-400/50 transition"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-blue-500/20 p-3 rounded-lg">
                    <Icon className={`w-6 h-6 ${getFacilityColor(facility.facility_type)}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">
                      {facility.facility_name}
                    </h3>
                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full">
                      {facility.facility_type}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-sm">{facility.contact_number}</span>
                  </div>
                  {facility.address && (
                    <div className="flex items-start gap-3 text-gray-300">
                      <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-1" />
                      <span className="text-sm">{facility.address}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl p-8 max-w-md w-full border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Add Medical Facility</h2>
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
                  Facility Name
                </label>
                <input
                  type="text"
                  value={formData.facility_name}
                  onChange={(e) => setFormData({ ...formData, facility_name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Facility Type
                </label>
                <select
                  value={formData.facility_type}
                  onChange={(e) => setFormData({ ...formData, facility_type: e.target.value as any })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="hospital">Hospital</option>
                  <option value="clinic">Clinic</option>
                  <option value="first-aid">First Aid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  rows={3}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition"
              >
                Add Facility
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
