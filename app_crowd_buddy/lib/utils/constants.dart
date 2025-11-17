class ApiConstants {
  ApiConstants._();

  static const String baseUrl = 'https://wzwc22dw-8000.inc1.devtunnels.ms';

  // Endpoints
  static const String registerEndpoint = '/auth/register';
  static const String loginEndpoint = '/auth/login';
  static const String eventsEndpoint = '/events/';
  static const String crowdDensityEndpoint = '/crowd-density/';
  static const String medicalFacilitiesEndpoint = '/medical-facilities/';
  static const String lostPersonsEndpoint = '/lost-persons/';
  static const String feedbackEndpoint = '/feedback/';
  static const String alertsEndpoint = '/alerts/';  // ✅ ADD THIS LINE

  static String getUrl(String endpoint) {
    return '$baseUrl$endpoint';
  }
}
