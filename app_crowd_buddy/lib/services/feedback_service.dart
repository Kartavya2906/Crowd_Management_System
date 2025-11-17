import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/constants.dart';

class FeedbackService {
  // Submit feedback (handles all 3 cases: rating only, positive, negative)
  Future<Map<String, dynamic>> submitFeedback({
    required String userId,
    required String eventId,
    required int rating,
    String? comments, // Optional - can be null for rating-only feedback
  }) async {
    try {
      final url = Uri.parse('${ApiConstants.baseUrl}/feedback/');
      print('🌐 Feedback API URL: $url');

      final Map<String, dynamic> requestBody = {
        'user_id': userId,
        'event_id': eventId,
        'rating': rating,
      };

      // Only add comments if provided (not null or empty)
      if (comments != null && comments.isNotEmpty) {
        requestBody['comments'] = comments;
      }

      print('📋 Feedback Request Body: $requestBody');

      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode(requestBody),
      );

      print('📥 Response Status Code: ${response.statusCode}');
      print('📥 Response Body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        final responseData = json.decode(response.body);

        return {
          'success': true,
          'data': responseData,
          'message': 'Feedback submitted successfully',
        };
      } else {
        print('❌ Error: Status ${response.statusCode}');
        print('❌ Error Body: ${response.body}');

        return {
          'success': false,
          'message': 'Failed to submit feedback: ${response.body}',
        };
      }
    } catch (e) {
      print('❌ Exception occurred: $e');
      return {
        'success': false,
        'message': 'Error: $e',
      };
    }
  }
}
