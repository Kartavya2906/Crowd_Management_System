import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/crowd_density.dart';
import '../utils/constants.dart';

class CrowdDensityService {
  // Simple method to fetch all crowd density data
  Future<List<CrowdDensity>> fetchCrowdDensity() async {
    try {
      final response = await http.get(
        Uri.parse(ApiConstants.getUrl(ApiConstants.crowdDensityEndpoint)),
        headers: {
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> jsonData = json.decode(response.body);
        return jsonData.map((json) => CrowdDensity.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load crowd density data: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching crowd density: $e');
    }
  }

  // Get latest density for each unique area
  Future<Map<String, CrowdDensity>> fetchLatestDensityByArea() async {
    final allData = await fetchCrowdDensity();

    // Group by area name and keep only the latest entry
    final Map<String, CrowdDensity> latestByArea = {};

    for (var density in allData) {
      if (!latestByArea.containsKey(density.areaName) ||
          density.timestamp.isAfter(latestByArea[density.areaName]!.timestamp)) {
        latestByArea[density.areaName] = density;
      }
    }

    return latestByArea;
  }
}
