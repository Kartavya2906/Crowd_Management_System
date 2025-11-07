import { useState } from 'react';
import { Heart, MapPin, Clock, User, Activity, AlertCircle, CheckCircle, X } from 'lucide-react';

// API Configuration - Update this to match your constants.ts
const BASE_URL = 'http://localhost:8000';

interface MedicalEmergency {
  id: string;
  emergencyType: 'injury' | 'illness' | 'heatstroke' | 'cardiac' | 'other';
  severity: 'minor' | 'moderate' | 'severe' | 'critical';
  patientName: string;
  patientAge: number;
  description: string;
  location: string;
  status: 'reported' | 'responder_dispatched' | 'on_scene' | 'transported' | 'resolved';
  responderName: string;
  responseTime?: number;
  reportedAt: string;
}

interface RegistrationData {
  name: string;
  email: string;
  phone: string;
  role: string;
  password: string;
}

export default function MedicalEmergencies() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEmergency, setSelectedEmergency] = useState<MedicalEmergency | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const [formData, setFormData] = useState<RegistrationData>({
    name: '',
    email: '',
    phone: '',
    role: 'medical',
    password: ''
  });

  const [emergencies] = useState<MedicalEmergency[]>([
    {
      id: '1',
      emergencyType: 'heatstroke',
      severity: 'severe',
      patientName: 'John Davis',
      patientAge: 45,
      description: 'Patient experiencing dizziness, nausea, and excessive sweating. Appears disoriented.',
      location: 'Stage Front - Section B',
      status: 'on_scene',
      responderName: 'Dr. Sarah Williams',
      responseTime: 4,
      reportedAt: '15:32',
    },
    {
      id: '2',
      emergencyType: 'injury',
      severity: 'moderate',
      patientName: 'Lisa Martinez',
      patientAge: 28,
      description: 'Ankle injury from fall. Patient unable to bear weight. Swelling observed.',
      location: 'Food Court Area',
      status: 'responder_dispatched',
      responderName: 'EMT James Brown',
      reportedAt: '15:45',
    },
    {
      id: '3',
      emergencyType: 'cardiac',
      severity: 'critical',
      patientName: 'Robert Anderson',
      patientAge: 67,
      description: 'Chest pain and shortness of breath. Patient has history of heart condition.',
      location: 'Parking Zone A',
      status: 'transported',
      responderName: 'Paramedic Team Alpha',
      responseTime: 3,
      reportedAt: '14:58',
    },
    {
      id: '4',
      emergencyType: 'illness',
      severity: 'minor',
      patientName: 'Emily Taylor',
      patientAge: 19,
      description: 'Feeling faint and nauseous. Patient reports not eating since morning.',
      location: 'Medical Bay',
      status: 'resolved',
      responderName: 'Nurse Jennifer Lee',
      responseTime: 2,
      reportedAt: '14:20',
    },
  ]);

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setRegistrationError('Please fill in all fields');
      return;
    }

    setIsRegistering(true);
    setRegistrationError(null);
    setRegistrationSuccess(false);

    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setRegistrationSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'medical',
        password: ''
      });

      setTimeout(() => {
        setShowRegisterModal(false);
        setRegistrationSuccess(false);
      }, 2000);

    } catch (error) {
      setRegistrationError(error instanceof Error ? error.message : 'An error occurred during registration');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const getEmergencyTypeIcon = (type: string) => {
    return <Heart className="w-5 h-5" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'severe':
        return 'bg-orange-600 text-white';
      case 'moderate':
        return 'bg-yellow-600 text-white';
      case 'minor':
        return 'bg-green-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'responder_dispatched':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'on_scene':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'transported':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const filteredEmergencies = emergencies.filter((emergency) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') {
      return ['reported', 'responder_dispatched', 'on_scene'].includes(emergency.status);
    }
    return emergency.status === statusFilter;
  });

  const statusCounts = {
    all: emergencies.length,
    active: emergencies.filter((e) => ['reported', 'responder_dispatched', 'on_scene'].includes(e.status)).length,
    resolved: emergencies.filter((e) => e.status === 'resolved' || e.status === 'transported').length,
  };

  const avgResponseTime = Math.round(
    emergencies.filter((e) => e.responseTime).reduce((sum, e) => sum + (e.responseTime || 0), 0) /
      emergencies.filter((e) => e.responseTime).length
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Medical Emergencies</h1>
            <p className="text-sm text-slate-600 mt-1">Track and manage medical incidents in real-time</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowRegisterModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Register Responder
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
              Report New Emergency
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Emergencies</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{statusCounts.all}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Cases</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{statusCounts.active}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Resolved Today</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{statusCounts.resolved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Response Time</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{avgResponseTime}<span className="text-lg">m</span></p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                statusFilter === status
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <span className="font-medium capitalize">{status}</span>
              <span className="ml-2 text-sm">({count})</span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="divide-y divide-slate-200">
            {filteredEmergencies.map((emergency) => (
              <div
                key={emergency.id}
                onClick={() => setSelectedEmergency(emergency)}
                className="p-6 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getSeverityColor(emergency.severity)}`}>
                      {getEmergencyTypeIcon(emergency.emergencyType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900 capitalize">
                          {emergency.emergencyType.replace('_', ' ')}
                        </h3>
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${getSeverityColor(emergency.severity)}`}>
                          {emergency.severity.toUpperCase()}
                        </span>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(emergency.status)}`}>
                          {getStatusLabel(emergency.status)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 mb-3">{emergency.description}</p>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <User className="w-4 h-4" />
                          <span>{emergency.patientName}, {emergency.patientAge}y</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4" />
                          <span>{emergency.location}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <Activity className="w-4 h-4" />
                          <span>Responder: {emergency.responderName}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <Clock className="w-4 h-4" />
                          <span>Reported: {emergency.reportedAt}</span>
                        </div>
                      </div>
                      {emergency.responseTime && (
                        <div className="mt-2 inline-flex items-center px-2.5 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">
                          Response time: {emergency.responseTime} minutes
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    {emergency.status !== 'resolved' && emergency.status !== 'transported' && (
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                        Update Status
                      </button>
                    )}
                    <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Registration Modal */}
        {showRegisterModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Register Medical Responder</h2>
                  <button
                    onClick={() => {
                      setShowRegisterModal(false);
                      setRegistrationError(null);
                      setRegistrationSuccess(false);
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {registrationSuccess && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-800">Registration successful!</span>
                  </div>
                )}

                {registrationError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-sm text-red-800">{registrationError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dr. Michael Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="dr.smith@hospital.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1555987654"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="medical">Medical Staff</option>
                    <option value="paramedic">Paramedic</option>
                    <option value="nurse">Nurse</option>
                    <option value="emt">EMT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter password"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowRegisterModal(false);
                      setRegistrationError(null);
                      setRegistrationSuccess(false);
                    }}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRegister}
                    disabled={isRegistering}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRegistering ? 'Registering...' : 'Register'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Details Modal */}
        {selectedEmergency && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-bold text-slate-900">Emergency Details</h2>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${getSeverityColor(selectedEmergency.severity)}`}>
                      {selectedEmergency.severity.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedEmergency(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-600 mb-2">Emergency Information</h3>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Type:</span>
                      <span className="text-sm font-medium text-slate-900 capitalize">{selectedEmergency.emergencyType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Status:</span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(selectedEmergency.status)}`}>
                        {getStatusLabel(selectedEmergency.status)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">Description:</span>
                      <p className="text-sm text-slate-900 mt-1">{selectedEmergency.description}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-600 mb-2">Patient Information</h3>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Name:</span>
                      <span className="text-sm font-medium text-slate-900">{selectedEmergency.patientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Age:</span>
                      <span className="text-sm font-medium text-slate-900">{selectedEmergency.patientAge} years</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-600 mb-2">Location & Response</h3>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Location:</span>
                      <span className="text-sm font-medium text-slate-900">{selectedEmergency.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Responder:</span>
                      <span className="text-sm font-medium text-slate-900">{selectedEmergency.responderName}</span>
                    </div>
                    {selectedEmergency.responseTime && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Response Time:</span>
                        <span className="text-sm font-medium text-slate-900">{selectedEmergency.responseTime} minutes</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Reported At:</span>
                      <span className="text-sm font-medium text-slate-900">{selectedEmergency.reportedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Update Status
                  </button>
                  <button className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium">
                    Add Notes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}