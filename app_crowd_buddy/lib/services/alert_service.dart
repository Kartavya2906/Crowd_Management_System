import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/alert_model.dart';
import '../utils/constants.dart';

class AlertService {
  // Fetch all alerts
  Future<List<Alert>> fetchAlerts() async {
    try {
      final url = Uri.parse('${ApiConstants.baseUrl}/alerts/');
      print('🌐 Fetching Alerts from: $url');

      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
        },
      );

      print('📥 Response Status Code: ${response.statusCode}');
      print('📥 Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final List<dynamic> jsonData = json.decode(response.body);
        final alerts = jsonData.map((json) => Alert.fromJson(json)).toList();

        print('✅ Successfully fetched ${alerts.length} alerts');
        return alerts;
      } else {
        print('❌ Error: Status ${response.statusCode}');
        throw Exception('Failed to load alerts: ${response.body}');
      }
    } catch (e) {
      print('❌ Exception occurred: $e');
      throw Exception('Error fetching alerts: $e');
    }
  }

  // Fetch alerts for specific event
  Future<List<Alert>> fetchAlertsForEvent(String eventId) async {
    try {
      final url = Uri.parse('${ApiConstants.baseUrl}/alerts/?event_id=$eventId');
      print('🌐 Fetching Alerts for Event: $url');

      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
        },
      );

      print('📥 Response Status Code: ${response.statusCode}');

      if (response.statusCode == 200) {
        final List<dynamic> jsonData = json.decode(response.body);
        final alerts = jsonData.map((json) => Alert.fromJson(json)).toList();

        print('✅ Successfully fetched ${alerts.length} alerts for event $eventId');
        return alerts;
      } else {
        print('❌ Error: Status ${response.statusCode}');
        throw Exception('Failed to load alerts: ${response.body}');
      }
    } catch (e) {
      print('❌ Exception occurred: $e');
      throw Exception('Error fetching alerts: $e');
    }
  }
}
