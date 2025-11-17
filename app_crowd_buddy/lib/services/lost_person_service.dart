import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../utils/constants.dart';

class LostPersonService {
  // Submit lost person report
  Future<Map<String, dynamic>> submitLostPersonReport({
    required String reporterId,
    required String reporterName,
    required String reporterPhone,
    required String lostPersonName,
    required int age,
    required String gender,
    required String description,
    required String lastSeenLocation,
    required String lastSeenTime,
    required String eventId,
    File? photo,
  }) async {
    try {
      final url = Uri.parse('${ApiConstants.baseUrl}/lost-persons/');

      var request = http.MultipartRequest('POST', url);

      // Add text fields
      request.fields['reporter_id'] = reporterId;
      request.fields['reporter_name'] = reporterName;
      request.fields['reporter_phone'] = reporterPhone;
      request.fields['name'] = lostPersonName;
      request.fields['age'] = age.toString();
      request.fields['gender'] = gender.toLowerCase();
      request.fields['description'] = description;
      request.fields['last_seen_location'] = lastSeenLocation;
      request.fields['last_seen_time'] = lastSeenTime;
      request.fields['event_id'] = eventId;

      // Add photo if provided
      if (photo != null) {
        final photoFile = await http.MultipartFile.fromPath(
          'photo',
          photo.path,
        );
        request.files.add(photoFile);
      }

      // Send request
      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      print('Response Status: ${response.statusCode}');
      print('Response Body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'data': data,
          'message': 'Lost person report submitted successfully',
        };
      } else {
        // Try to parse error message
        String errorMessage = 'Failed to submit report';
        try {
          final errorData = json.decode(response.body);
          errorMessage = errorData['detail'] ?? errorData['message'] ?? errorMessage;
        } catch (e) {
          errorMessage = response.body;
        }

        return {
          'success': false,
          'message': errorMessage,
        };
      }
    } on SocketException {
      return {
        'success': false,
        'message': 'No internet connection. Please check your network.',
      };
    } on http.ClientException {
      return {
        'success': false,
        'message': 'Network error. Please try again.',
      };
    } catch (e) {
      print('Error submitting lost person report: $e');
      return {
        'success': false,
        'message': 'An unexpected error occurred: ${e.toString()}',
      };
    }
  }

  // Get all lost persons for an event (optional - for future use)
  Future<Map<String, dynamic>> getLostPersons(String eventId) async {
    try {
      final url = Uri.parse('${ApiConstants.baseUrl}/lost-persons/?event_id=$eventId');

      final response = await http.get(url);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'data': data,
        };
      } else {
        return {
          'success': false,
          'message': 'Failed to fetch lost persons',
        };
      }
    } catch (e) {
      print('Error fetching lost persons: $e');
      return {
        'success': false,
        'message': 'An error occurred: ${e.toString()}',
      };
    }
  }

  // Get single lost person details (optional - for future use)
  Future<Map<String, dynamic>> getLostPersonDetails(String lostPersonId) async {
    try {
      final url = Uri.parse('${ApiConstants.baseUrl}/lost-persons/$lostPersonId');

      final response = await http.get(url);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'data': data,
        };
      } else {
        return {
          'success': false,
          'message': 'Failed to fetch lost person details',
        };
      }
    } catch (e) {
      print('Error fetching lost person details: $e');
      return {
        'success': false,
        'message': 'An error occurred: ${e.toString()}',
      };
    }
  }
}