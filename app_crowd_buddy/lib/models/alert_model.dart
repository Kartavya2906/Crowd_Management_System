import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class Alert {
  final String id;
  final String eventId;
  final String title;
  final String message;
  final String alertType;
  final String severity;
  final bool isActive;
  final DateTime createdAt;

  Alert({
    required this.id,
    required this.eventId,
    required this.title,
    required this.message,
    required this.alertType,
    required this.severity,
    required this.isActive,
    required this.createdAt,
  });

  factory Alert.fromJson(Map<String, dynamic> json) {
    return Alert(
      id: json['id'] ?? '',
      eventId: json['event_id'] ?? '',
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      alertType: json['alert_type'] ?? '',
      severity: json['severity'] ?? '',
      isActive: json['is_active'] ?? false,
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'event_id': eventId,
      'title': title,
      'message': message,
      'alert_type': alertType,
      'severity': severity,
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
    };
  }

  // Helper to get icon based on alert type
  static IconData getIconForType(String type) {
    switch (type.toLowerCase()) {
      case 'emergency':
        return Icons.warning;
      case 'info':
        return Icons.info_outline;
      case 'warning':
        return Icons.error_outline;
      default:
        return Icons.notifications;
    }
  }
}
