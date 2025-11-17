import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/event_model.dart';
import '../utils/constants.dart';

class EventService {
  static const String eventsEndpoint = '/events/';

  // Fetch all events
  Future<List<Event>> fetchEvents() async {
    try {
      final url = Uri.parse(ApiConstants.getUrl(eventsEndpoint));
      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final dynamic jsonData = json.decode(response.body);

        // Handle both single object and array responses
        if (jsonData is List) {
          return jsonData
              .map((json) => Event.fromJson(json as Map<String, dynamic>))
              .toList();
        } else if (jsonData is Map<String, dynamic>) {
          return [Event.fromJson(jsonData)];
        } else {
          throw Exception('Unexpected response format');
        }
      } else {
        throw Exception('Failed to load events: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching events: $e');
    }
  }

  // Fetch live events only
  Future<List<Event>> fetchLiveEvents() async {
    try {
      final url = Uri.parse(ApiConstants.getUrl('$eventsEndpoint?status=live'));
      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final dynamic jsonData = json.decode(response.body);

        // Handle both single object and array responses
        if (jsonData is List) {
          return jsonData
              .map((json) => Event.fromJson(json as Map<String, dynamic>))
              .toList();
        } else if (jsonData is Map<String, dynamic>) {
          return [Event.fromJson(jsonData)];
        } else {
          throw Exception('Unexpected response format');
        }
      } else {
        throw Exception('Failed to load live events: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching live events: $e');
    }
  }

  // Fetch events by organizer ID
  Future<List<Event>> fetchEventsByOrganizer(String organizerId) async {
    try {
      final url = Uri.parse(
          ApiConstants.getUrl('$eventsEndpoint?organizer_id=$organizerId'));
      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final dynamic jsonData = json.decode(response.body);

        // Handle both single object and array responses
        if (jsonData is List) {
          return jsonData
              .map((json) => Event.fromJson(json as Map<String, dynamic>))
              .toList();
        } else if (jsonData is Map<String, dynamic>) {
          return [Event.fromJson(jsonData)];
        } else {
          throw Exception('Unexpected response format');
        }
      } else {
        throw Exception(
            'Failed to load organizer events: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching organizer events: $e');
    }
  }

  // Fetch event by ID
  Future<Event> fetchEventById(String eventId) async {
    try {
      final url = Uri.parse(ApiConstants.getUrl('$eventsEndpoint$eventId'));
      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final dynamic jsonData = json.decode(response.body);

        // Handle both single object and array responses
        if (jsonData is List && jsonData.isNotEmpty) {
          return Event.fromJson(jsonData[0] as Map<String, dynamic>);
        } else if (jsonData is Map<String, dynamic>) {
          return Event.fromJson(jsonData);
        } else {
          throw Exception('Event not found');
        }
      } else {
        throw Exception('Failed to load event: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching event: $e');
    }
  }

  // Fetch events by status (generic method)
  Future<List<Event>> fetchEventsByStatus(String status) async {
    try {
      final url = Uri.parse(ApiConstants.getUrl('$eventsEndpoint?status=$status'));
      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final dynamic jsonData = json.decode(response.body);

        // Handle both single object and array responses
        if (jsonData is List) {
          return jsonData
              .map((json) => Event.fromJson(json as Map<String, dynamic>))
              .toList();
        } else if (jsonData is Map<String, dynamic>) {
          return [Event.fromJson(jsonData)];
        } else {
          throw Exception('Unexpected response format');
        }
      } else {
        throw Exception('Failed to load events by status: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching events by status: $e');
    }
  }
}
