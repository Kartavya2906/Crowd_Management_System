import { useState, useEffect } from 'react';
import { Search, AlertCircle, CheckCircle, Clock, Phone, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Event, LostPerson } from '../../types';

interface LostPersonsPageProps {
  events: Event[];
}

export default function LostPersonsPage({ events }: LostPersonsPageProps) {
  const [lostPersons, setLostPersons] = useState<LostPerson[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [stats, setStats] = useState({ total: 0, missing: 0, found: 0 });

  useEffect(() => {
    loadLostPersons();
  }, [selectedEvent]);

  const loadLostPersons = async () => {
    let query = supabase.from('lost_persons').select('*').order('created_at', { ascending: false });

    if (selectedEvent !== 'all') {
      query = query.eq('event_id', selectedEvent);
    }

    const { data } = await query;

    if (data) {
      setLostPersons(data);
      setStats({
        total: data.length,
        missing: data.filter(p => p.status === 'missing').length,
        found: data.filter(p => p.status === 'found').length
      });
    }
  };

  const updateStatus = async (id: string, status: 'missing' | 'found') => {
    await supabase
      .from('lost_persons')
      .update({ status })
      .eq('id', id);

    loadLostPersons();
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Lost Persons Management</h1>
      <p className="text-gray-300 mb-8">Track and manage lost person reports</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-500/20 backdrop-blur-lg rounded-xl p-6 border border-blue-400/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Total Cases</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-blue-400" />
          </div>
        </div>

        <div className="bg-amber-500/20 backdrop-blur-lg rounded-xl p-6 border border-amber-400/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-200 text-sm mb-1">Missing</p>
              <p className="text-3xl font-bold text-white">{stats.missing}</p>
            </div>
            <Search className="w-12 h-12 text-amber-400" />
          </div>
        </div>

        <div className="bg-green-500/20 backdrop-blur-lg rounded-xl p-6 border border-green-400/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm mb-1">Found</p>
              <p className="text-3xl font-bold text-white">{stats.found}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Event</label>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="all">All Events</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>{event.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {lostPersons.map((person) => (
          <div
            key={person.id}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <div className="flex gap-4">
              {person.photo_url && (
                <img
                  src={person.photo_url}
                  alt={person.name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              )}

              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">{person.name}</h3>
                    <p className="text-gray-300 text-sm">
                      {person.age} years • {person.gender}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    person.status === 'found'
                      ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                  }`}>
                    {person.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span>Last seen: {person.last_seen_location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>{new Date(person.last_seen_time).toLocaleString()}</span>
                  </div>
                </div>

                {person.description && (
                  <p className="text-sm text-gray-300 mb-4 p-3 bg-white/5 rounded-lg">
                    {person.description}
                  </p>
                )}

                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs text-gray-400 mb-2">Reporter Details:</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{person.reporter_name}</span>
                    <div className="flex items-center gap-2 text-blue-300">
                      <Phone className="w-4 h-4" />
                      <span>{person.reporter_phone}</span>
                    </div>
                  </div>
                </div>

                {person.status === 'missing' && (
                  <button
                    onClick={() => updateStatus(person.id, 'found')}
                    className="w-full mt-4 bg-green-500/20 hover:bg-green-500/30 text-green-300 py-2 rounded-lg font-medium transition"
                  >
                    Mark as Found
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
