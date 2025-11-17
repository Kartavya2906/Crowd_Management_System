import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/constants.dart';

class MedicalHelpPage extends StatefulWidget {
  static const route = '/medical';

  const MedicalHelpPage({super.key});

  @override
  State<MedicalHelpPage> createState() => _MedicalHelpPageState();
}

class _MedicalHelpPageState extends State<MedicalHelpPage> {
  List<MedicalFacility> _facilities = [];
  bool _isLoading = true;
  String? _errorMessage;
  String? eventId;

  @override
  void initState() {
    super.initState();
    _loadEventIdAndFetchData();
  }

  Future<void> _loadEventIdAndFetchData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      eventId = prefs.getString('current_event_id');

      if (eventId != null && eventId!.isNotEmpty) {
        await _fetchMedicalData();
      } else {
        setState(() {
          _errorMessage = 'No event selected. Please select an event first.';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error loading event: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _fetchMedicalData() async {
    try {
      final url = '${ApiConstants.baseUrl}/medical-facilities/?event_id=$eventId';
      final response = await http.get(Uri.parse(url));

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);

        setState(() {
          // Only get first-aid and clinic facilities
          _facilities = data
              .where((item) => item['facility_type'] == 'first-aid' ||
              item['facility_type'] == 'clinic')
              .map((item) => MedicalFacility.fromJson(item))
              .toList();

          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = 'Failed to load medical facilities (Status: ${response.statusCode})';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error: $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 120,
            floating: false,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: const Text(
                'Medical Help',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.0,
                ),
              ),
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: isDark
                        ? [
                      Colors.red.shade900,
                      Colors.red.shade700,
                      Colors.pink.shade800,
                    ]
                        : [
                      Colors.red.shade400,
                      Colors.red.shade600,
                      Colors.pink.shade500,
                    ],
                  ),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: _isLoading
                ? const Center(
              child: Padding(
                padding: EdgeInsets.all(32.0),
                child: CircularProgressIndicator(),
              ),
            )
                : _errorMessage != null
                ? Center(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.error_outline,
                      color: Colors.red,
                      size: 48,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _errorMessage!,
                      style: const TextStyle(color: Colors.red),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            )
                : Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Nearby Medical Facilities',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  if (_facilities.isEmpty)
                    const Text('No medical facilities available')
                  else
                    ..._facilities.map((facility) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _buildFacilityCard(
                        context,
                        facility: facility,
                        isDark: isDark,
                      ),
                    )),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFacilityCard(
      BuildContext context, {
        required MedicalFacility facility,
        required bool isDark,
      }) {
    final theme = Theme.of(context);
    final color = facility.facilityType == 'first-aid' ? Colors.blue : Colors.purple;
    final icon = facility.facilityType == 'first-aid'
        ? Icons.local_hospital
        : Icons.medical_services;

    String mapUrl = Uri.encodeFull(
        'https://www.google.com/maps/search/?api=1&query=${facility.address}');

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        gradient: LinearGradient(
          colors: isDark
              ? [
            color.withOpacity(0.2),
            color.withOpacity(0.1),
          ]
              : [
            color.withOpacity(0.1),
            color.withOpacity(0.05),
          ],
        ),
        border: Border.all(
          color: color.withOpacity(0.3),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withOpacity(0.2),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  facility.facilityName,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  facility.address,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurface.withOpacity(0.6),
                  ),
                ),
                const SizedBox(height: 4),
                GestureDetector(
                  onTap: () async {
                    final uri = Uri.parse('tel:${facility.contactNumber}');
                    if (await canLaunchUrl(uri)) {
                      await launchUrl(uri);
                    }
                  },
                  child: Text(
                    facility.contactNumber,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: color,
                      fontWeight: FontWeight.bold,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: Icon(Icons.directions, color: color),
            onPressed: () async {
              final uri = Uri.parse(mapUrl);
              if (await canLaunchUrl(uri)) {
                await launchUrl(uri, mode: LaunchMode.externalApplication);
              }
            },
          ),
        ],
      ),
    );
  }
}

class MedicalFacility {
  final String eventId;
  final String facilityName;
  final String facilityType;
  final String contactNumber;
  final String address;
  final String id;
  final String createdAt;

  MedicalFacility({
    required this.eventId,
    required this.facilityName,
    required this.facilityType,
    required this.contactNumber,
    required this.address,
    required this.id,
    required this.createdAt,
  });

  factory MedicalFacility.fromJson(Map<String, dynamic> json) {
    return MedicalFacility(
      eventId: json['event_id'] ?? '',
      facilityName: json['facility_name'] ?? '',
      facilityType: json['facility_type'] ?? '',
      contactNumber: json['contact_number'] ?? '',
      address: json['address'] ?? '',
      id: json['id'] ?? '',
      createdAt: json['created_at'] ?? '',
    );
  }
}
