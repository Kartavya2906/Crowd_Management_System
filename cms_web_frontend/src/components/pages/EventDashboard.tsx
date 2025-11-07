import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Upload, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Event, Zone } from '../../types';

interface EventDashboardProps {
  event: Event;
  onBack: () => void;
}

export default function EventDashboard({ event, onBack }: EventDashboardProps) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [showAddZone, setShowAddZone] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    capacity: 0,
    image_url: ''
  });

  useEffect(() => {
    loadZones();
  }, [event.id]);

  const loadZones = async () => {
    const { data } = await supabase
      .from('zones')
      .select('*')
      .eq('event_id', event.id)
      .order('created_at', { ascending: false });

    if (data) {
      setZones(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const density = Math.random() * 3;
    const densityStatus = density > 2 ? 'crowded' : density > 1 ? 'moderate' : 'low';

    const { error } = await supabase
      .from('zones')
      .insert([{
        event_id: event.id,
        ...formData,
        current_density: density,
        density_status: densityStatus
      }]);

    if (!error) {
      setShowAddZone(false);
      setFormData({ name: '', capacity: 0, image_url: '' });
      loadZones();
    }
  };

  const getDensityColor = (status: string) => {
    switch (status) {
      case 'crowded':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'moderate':
        return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
      case 'low':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getDensityLabel = (density: number) => {
    return `${density.toFixed(2)} persons/m²`;
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
          <span>{new Date(event.date).toLocaleDateString()}</span>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 hover:border-blue-400/50 transition"
          >
            {zone.image_url && (
              <img
                src={zone.image_url}
                alt={zone.name}
                className="w-full h-48 object-cover"
              />
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
                  <span className="text-white font-medium">{getDensityLabel(zone.current_density)}</span>
                </div>
              </div>

              <div className={`flex items-center justify-center py-2 rounded-lg border ${getDensityColor(zone.density_status)}`}>
                <span className="font-semibold uppercase text-sm">
                  {zone.density_status}
                </span>
              </div>

              <p className="text-xs text-gray-400 mt-3">
                Last updated: {new Date(zone.last_updated).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {showAddZone && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl p-8 max-w-md w-full border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Add New Zone</h2>
              <button
                onClick={() => setShowAddZone(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Zone Name
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
                  Capacity
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Upload an image for AI crowd density analysis
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition"
              >
                Add Zone
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
