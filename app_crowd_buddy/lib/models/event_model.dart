class Event {
  final String id;
  final String name;
  final String description;
  final String startTime;
  final String endTime;
  final String location;
  final int capacity;
  final int attendeesCount;
  final List<Area> areas;
  final String? date;
  final String organizerId;
  final String status;
  final String createdAt;

  Event({
    required this.id,
    required this.name,
    required this.description,
    required this.startTime,
    required this.endTime,
    required this.location,
    required this.capacity,
    required this.attendeesCount,
    required this.areas,
    this.date,
    required this.organizerId,
    required this.status,
    required this.createdAt,
  });

  factory Event.fromJson(Map<String, dynamic> json) {
    return Event(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      startTime: json['start_time'] as String,
      endTime: json['end_time'] as String,
      location: json['location'] as String,
      capacity: json['capacity'] as int,
      attendeesCount: json['attendees_count'] as int,
      areas: (json['areas'] as List<dynamic>)
          .map((area) => Area.fromJson(area as Map<String, dynamic>))
          .toList(),
      date: json['date'] as String?,
      organizerId: json['organizer_id'] as String,
      status: json['status'] as String,
      createdAt: json['created_at'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'start_time': startTime,
      'end_time': endTime,
      'location': location,
      'capacity': capacity,
      'attendees_count': attendeesCount,
      'areas': areas.map((area) => area.toJson()).toList(),
      'date': date,
      'organizer_id': organizerId,
      'status': status,
      'created_at': createdAt,
    };
  }

  String getFormattedDate() {
    try {
      final dateTime = DateTime.parse(startTime);
      final months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return '${months[dateTime.month - 1]} ${dateTime.day}, ${dateTime.year}';
    } catch (e) {
      return 'Date N/A';
    }
  }

  String getEventType() {
    // Extract type from description or name
    final lowerName = name.toLowerCase();
    final lowerDesc = description.toLowerCase();

    if (lowerName.contains('music') || lowerDesc.contains('music') ||
        lowerName.contains('concert') || lowerDesc.contains('concert')) {
      return 'Music';
    } else if (lowerName.contains('tech') || lowerDesc.contains('tech') ||
        lowerName.contains('conference') || lowerDesc.contains('conference')) {
      return 'Tech';
    } else if (lowerName.contains('sport') || lowerDesc.contains('sport')) {
      return 'Sports';
    }
    return 'General';
  }
}

class Area {
  final String name;
  final Location location;
  final double radiusM;

  Area({
    required this.name,
    required this.location,
    required this.radiusM,
  });

  factory Area.fromJson(Map<String, dynamic> json) {
    return Area(
      name: json['name'] as String,
      location: Location.fromJson(json['location'] as Map<String, dynamic>),
      radiusM: (json['radius_m'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'location': location.toJson(),
      'radius_m': radiusM,
    };
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

  Map<String, dynamic> toJson() {
    return {
      'lat': lat,
      'lon': lon,
    };
  }
}
