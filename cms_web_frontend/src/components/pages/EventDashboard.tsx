import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, Upload, Loader2 } from 'lucide-react';

// Types
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

interface EventResponse {
  id: string;
  name: string;
  location: string;
  start_time: string;
  attendees_count: number;
}

interface EventDashboardProps {
  event: EventResponse;
  onBack: () => void;
}

// Replace with your actual backend URL
const API_BASE_URL = 'https://crowd-management-system-lx1h.onrender.com';

// Zone Service
const zoneService = {
  async getZonesByEvent(eventId: string): Promise<Zone[]> {
    const response = await fetch(`${API_BASE_URL}/zones/?event_id=${eventId}`);
    if (!response.ok) throw new Error('Failed to fetch zones');
    return response.json();
  },

  async createZone(data: any): Promise<Zone> {
    const response = await fetch(`${API_BASE_URL}/zones/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, current_density: 0, density_status: 'low' }),
    });
    if (!response.ok) throw new Error('Failed to create zone');
    return response.json();
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

export default function EventDashboard({ event, onBack }: EventDashboardProps) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [showAddZone, setShowAddZone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    capacity: 0,
    image_url: ''
  });

  // Safety check for event prop
  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 flex items-center justify-center">
        <div className="text-white text-xl">No event selected</div>
      </div>
    );
  }

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
      return;
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
      
      if (imageFile) {
        personCount = await analyzeImage() || 0;
      }

      const currentDensity = formData.capacity > 0 
        ? personCount / formData.capacity 
        : 0;

      const newZone = await zoneService.createZone({
        event_id: event.id,
        name: formData.name,
        capacity: formData.capacity,
        image_url: formData.image_url || null,
      });

      if (personCount > 0) {
        await zoneService.updateZoneDensity(newZone.id, currentDensity);
      }

      setShowAddZone(false);
      setFormData({ name: '', capacity: 0, image_url: '' });
      setImageFile(null);
      setImagePreview('');
      await loadZones();
      
      alert('Zone added successfully!');
    } catch (error) {
      console.error('Error creating zone:', error);
      alert('Failed to create zone. Please try again.');
    } finally {
      setLoading(false);
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

  const getOccupancyPercentage = (zone: Zone) => {
    const occupied = (zone.current_density * zone.capacity);
    const percentage = (occupied / zone.capacity) * 100;
    return Math.min(percentage, 100).toFixed(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
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
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Occupancy:</span>
                    <span className="text-white font-medium">{getOccupancyPercentage(zone)}%</span>
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Zone Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g., Main Hall"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Capacity (people) *
                </label>
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Image URL (Optional)
                </label>
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
                  <label
                    htmlFor="zone-image"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-300">
                      {imageFile ? imageFile.name : 'Click to upload image'}
                    </span>
                  </label>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mt-3 max-h-32 mx-auto rounded-lg"
                    />
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