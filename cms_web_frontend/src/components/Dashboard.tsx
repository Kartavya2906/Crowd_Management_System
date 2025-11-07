import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, AlertTriangle, Activity, MessageSquare, LogOut, Plus, Calendar, Droplets } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Event } from '../types';
import EventsPage from './pages/EventsPage';
import EventDashboard from './pages/EventDashboard';
import LostPersonsPage from './pages/LostPersonsPage';
import MedicalPage from './pages/MedicalPage';
import EmergencyExitsPage from './pages/EmergencyExitsPage';
import FeedbackPage from './pages/FeedbackPage';
import WashroomFacilitiesPage from './pages/WashroomFacilitiesPage';

type Page = 'events' | 'event-dashboard' | 'lost-persons' | 'medical' | 'emergency-exits' | 'feedback' | 'washrooms';

export default function Dashboard() {
  const { organizer, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('events');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setEvents(data);
    }
  };

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setCurrentPage('event-dashboard');
  };

  const handleBackToEvents = () => {
    setCurrentPage('events');
    setSelectedEvent(null);
  };

  const menuItems = [
    { id: 'events' as Page, icon: Calendar, label: 'Events', color: 'text-blue-400' },
    { id: 'lost-persons' as Page, icon: AlertTriangle, label: 'Lost Persons', color: 'text-amber-400' },
    { id: 'medical' as Page, icon: Activity, label: 'Medical', color: 'text-red-400' },
    { id: 'washrooms' as Page, icon: Droplets, label: 'Washrooms', color: 'text-cyan-400' },
    { id: 'emergency-exits' as Page, icon: Users, label: 'Emergency Exits', color: 'text-green-400' },
    { id: 'feedback' as Page, icon: MessageSquare, label: 'Feedback', color: 'text-purple-400' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
      <div className="flex h-screen">
        <aside className="w-64 bg-slate-900/50 backdrop-blur-lg border-r border-white/10">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-blue-500 p-2 rounded-lg">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">CMS Portal</h1>
                <p className="text-xs text-blue-200">Event Management</p>
              </div>
            </div>

            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    if (item.id !== 'event-dashboard') {
                      setSelectedEvent(null);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    currentPage === item.id
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${currentPage === item.id ? item.color : ''}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="absolute bottom-0 w-64 p-6 border-t border-white/10">
            <div className="mb-4 p-3 bg-white/5 rounded-lg">
              <p className="text-sm text-gray-400">Logged in as</p>
              <p className="text-white font-medium">{organizer?.name}</p>
              <p className="text-xs text-blue-300">{organizer?.organizer_id}</p>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-4 py-2 text-red-300 hover:bg-red-500/10 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          {currentPage === 'events' && (
            <EventsPage
              events={events}
              onEventSelect={handleEventSelect}
              onEventsUpdate={loadEvents}
            />
          )}

          {currentPage === 'event-dashboard' && selectedEvent && (
            <EventDashboard
              event={selectedEvent}
              onBack={handleBackToEvents}
            />
          )}

          {currentPage === 'lost-persons' && (
            <LostPersonsPage events={events} />
          )}

          {currentPage === 'medical' && (
            <MedicalPage events={events} />
          )}

          {currentPage === 'washrooms' && (
            <WashroomFacilitiesPage events={events} />
          )}

          {currentPage === 'emergency-exits' && (
            <EmergencyExitsPage events={events} />
          )}

          {currentPage === 'feedback' && (
            <FeedbackPage events={events} />
          )}
        </main>
      </div>
    </div>
  );
}
