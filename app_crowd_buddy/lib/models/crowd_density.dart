class CrowdDensity {
  final String eventId;
  final String areaName;
  final Location location;
  final double radiusM;
  final int personCount;
  final String id;
  final double areaM2;
  final double peoplePerM2;
  final String densityLevel;
  final DateTime timestamp;

  CrowdDensity({
    required this.eventId,
    required this.areaName,
    required this.location,
    required this.radiusM,
    required this.personCount,
    required this.id,
    required this.areaM2,
    required this.peoplePerM2,
    required this.densityLevel,
    required this.timestamp,
  });

  factory CrowdDensity.fromJson(Map<String, dynamic> json) {
    return CrowdDensity(
      eventId: json['event_id'] as String,
      areaName: json['area_name'] as String,
      location: Location.fromJson(json['location'] as Map<String, dynamic>),
      radiusM: (json['radius_m'] as num).toDouble(),
      personCount: json['person_count'] as int,
      id: json['id'] as String,
      areaM2: (json['area_m2'] as num).toDouble(),
      peoplePerM2: (json['people_per_m2'] as num).toDouble(),
      densityLevel: json['density_level'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }

  // Convert density level to a normalized value (0.0 to 1.0) for UI display
  double get normalizedDensity {
    switch (densityLevel.toLowerCase()) {
      case 'safe':
        return peoplePerM2 / 0.5; // Assume safe is 0-0.5 people/m²
      case 'moderate':
        return 0.5 + (peoplePerM2 - 0.5) / 0.3; // 0.5-0.8 people/m²
      case 'crowded':
        return 0.8 + (peoplePerM2 - 0.8) / 0.2; // 0.8-1.0+ people/m²
      default:
        return peoplePerM2.clamp(0.0, 1.0);
    }
  }
}

class Location {
  final double lat;
  final double lon;

  Location({
    required this.lat,
    required this.lon,
  });

  factory Location.fromJson(Map<String, dynamic> json) {
    return Location(
      lat: (json['lat'] as num).toDouble(),
      lon: (json['lon'] as num).toDouble(),
    );
  }
}
