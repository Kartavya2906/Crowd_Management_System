class ApiConstants {
  ApiConstants._();

  static const String baseUrl = 'https://wzwc22dw-8000.inc1.devtunnels.ms';

  // Endpoints
  static const String registerEndpoint = '/auth/register';
  static const String loginEndpoint = '/auth/login';

  static String getUrl(String endpoint) {
    return '$baseUrl$endpoint';
  }
}