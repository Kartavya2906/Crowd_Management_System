class ApiConstants {
  ApiConstants._();

  static const String baseUrl = 'https://crowd-management-system-lx1h.onrender.com';

  // Endpoints
  static const String registerEndpoint = '/auth/register';
  static const String loginEndpoint = '/auth/login';
  static const String eventsEndpoint = '/events/';
  static const String crowdDensityEndpoint = '/crowd-density/';
  static const String medicalFacilitiesEndpoint = '/medical-facilities/';
  static const String lostPersonsEndpoint = '/lost-persons/';
  static const String feedbackEndpoint = '/feedback/';
  static const String alertsEndpoint = '/alerts/';  // ✅ ADD THIS LINE
  static const String washroomFacilitiesEndpoint = '/washroom-facilities/';
  static const String zonesEndpoint = '/zones/';
  static const String emergencyExitsEndpoint = '/emergency-exits/';

  static String getUrl(String endpoint) {
    return '$baseUrl$endpoint';
  }
}
