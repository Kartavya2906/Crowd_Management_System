import 'package:flutter/material.dart';
import '../widgets/density_meter.dart';
import '../widgets/section.dart';
import 'medical_help_page.dart';
import 'emergency_exit_page.dart';
import 'feedback_page.dart';
import 'lost_person_form.dart';
import 'alerts_page.dart';
import 'live_map_page.dart';
import 'washrooms_page.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
// Add these imports
import '../services/crowd_density_service.dart';
import '../models/crowd_density.dart';

class CrowdDashboard extends StatefulWidget {
  static const route = '/dashboard';

  const CrowdDashboard({super.key});

  @override
  State<CrowdDashboard> createState() => _CrowdDashboardState();
}

class _CrowdDashboardState extends State<CrowdDashboard>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  int _selectedIndex = 0;

  // Replace mock data with real data
  final CrowdDensityService _crowdDensityService = CrowdDensityService();
  List<CrowdDensity> _densityData = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _animationController.forward();

    // Fetch crowd density data
    _fetchCrowdDensity();
  }

  Future<void> _fetchCrowdDensity() async {
    try {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });

      final latestData = await _crowdDensityService.fetchLatestDensityByArea();

      setState(() {
        _densityData = latestData.values.toList()
          ..sort((a, b) => b.peoplePerM2.compareTo(a.peoplePerM2));
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load crowd density data';
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  // Helper to get the status color based on API's density_level
  Color _getDensityColor(String densityLevel) {
    switch (densityLevel.toLowerCase()) {
      case 'safe':
        return Colors.green.shade600;
      case 'moderate':
        return Colors.orange.shade700;
      case 'risky':
      case 'overcrowded':
      case 'crowded':
        return Colors.red.shade600;
      default:
        return Colors.grey.shade600;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Gradient AppBar
          SliverAppBar(
            expandedHeight: 120,
            floating: false,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: const Text(
                'Event Dashboard',
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
                      Colors.teal.shade900,
                      Colors.teal.shade700,
                      Colors.cyan.shade800,
                    ]
                        : [
                      Colors.teal.shade400,
                      Colors.teal.shade600,
                      Colors.cyan.shade500,
                    ],
                  ),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: FadeTransition(
              opacity: _animationController,
              child: ListView(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                children: [
                  // Map View Section
                  Section(
                    title: 'Live Crowd Map',
                    icon: Icons.map_outlined,
                    onMorePressed: () =>
                        Navigator.pushNamed(context, LiveMapPage.route),
                    child: Container(
                      height: 220,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.teal.withOpacity(0.2),
                            blurRadius: 15,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Stack(
                          children: [
                            FlutterMap(
                              options: MapOptions(
                                initialCenter: LatLng(28.6139, 77.2090),
                                initialZoom: 13.0,
                                interactionOptions: const InteractionOptions(
                                  flags: InteractiveFlag.drag |
                                  InteractiveFlag.pinchZoom,
                                ),
                              ),
                              children: [
                                TileLayer(
                                  urlTemplate:
                                  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                                  userAgentPackageName:
                                  'com.example.crowd_buddy',
                                ),
                                // Show circles for each area on map
                                CircleLayer(
                                  circles: _densityData.map((density) {
                                    return CircleMarker(
                                      point: LatLng(
                                        density.location.lat,
                                        density.location.lon,
                                      ),
                                      radius: density.radiusM,
                                      useRadiusInMeter: true,
                                      color: _getDensityColor(density.densityLevel)
                                          .withOpacity(0.3),
                                      borderColor: _getDensityColor(density.densityLevel),
                                      borderStrokeWidth: 2,
                                    );
                                  }).toList(),
                                ),
                              ],
                            ),
                            GestureDetector(
                              onTap: () => Navigator.pushNamed(
                                  context, LiveMapPage.route),
                              child: Container(
                                color: Colors.transparent,
                                alignment: Alignment.bottomRight,
                                padding: const EdgeInsets.all(12),
                                child: Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: Colors.black.withOpacity(0.6),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.fullscreen,
                                          color: Colors.white, size: 20),
                                      SizedBox(width: 4),
                                      Text(
                                        'Expand',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  // Zone Density Status Section
                  Section(
                    title: 'Zone Density Status',
                    icon: Icons.analytics_outlined,
                    child: _isLoading
                        ? const Center(
                      child: Padding(
                        padding: EdgeInsets.all(20.0),
                        child: CircularProgressIndicator(),
                      ),
                    )
                        : _errorMessage != null
                        ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(20.0),
                        child: Column(
                          children: [
                            Text(
                              _errorMessage!,
                              style: TextStyle(
                                color: Colors.red.shade600,
                              ),
                            ),
                            const SizedBox(height: 10),
                            ElevatedButton(
                              onPressed: _fetchCrowdDensity,
                              child: const Text('Retry'),
                            ),
                          ],
                        ),
                      ),
                    )
                        : _densityData.isEmpty
                        ? const Center(
                      child: Padding(
                        padding: EdgeInsets.all(20.0),
                        child: Text('No crowd density data available'),
                      ),
                    )
                        : Column(
                      children: _densityData.map((density) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12.0),
                          child: _buildZoneCard(context, density),
                        );
                      }).toList(),
                    ),
                  ),

                  // Quick Actions Section
                  Section(
                    title: 'Quick Actions',
                    icon: Icons.bolt_rounded,
                    child: Row(
                      children: [
                        Expanded(
                          child: _buildActionButton(
                            context,
                            Icons.health_and_safety,
                            'Medical',
                            [Colors.red.shade400, Colors.red.shade600],
                                () => Navigator.pushNamed(
                                context, MedicalHelpPage.route),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _buildActionButton(
                            context,
                            Icons.exit_to_app,
                            'Exits',
                            [Colors.green.shade400, Colors.green.shade600],
                                () => Navigator.pushNamed(
                                context, EmergencyExitPage.route),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _buildActionButton(
                            context,
                            Icons.wc,
                            'Washrooms',
                            [Colors.blue.shade400, Colors.blue.shade600],
                                () => Navigator.pushNamed(
                                context, WashroomsPage.route),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: NavigationBar(
          selectedIndex: _selectedIndex,
          onDestinationSelected: (i) {
            setState(() {
              _selectedIndex = i;
            });
            if (i == 0) Navigator.pushNamed(context, FeedbackPage.route);
            if (i == 1) Navigator.pushNamed(context, LostPersonForm.route);
            if (i == 2) Navigator.pushNamed(context, AlertsPage.route);
          },
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.feedback_outlined),
              selectedIcon: Icon(Icons.feedback),
              label: 'Feedback',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_search_outlined),
              selectedIcon: Icon(Icons.person_search),
              label: 'Lost & Found',
            ),
            NavigationDestination(
              icon: Icon(Icons.notifications_outlined),
              selectedIcon: Icon(Icons.notifications),
              label: 'Alerts',
            ),
          ],
        ),
      ),
    );
  }

  // Widget for Individual Zone Cards - Uses API data
  Widget _buildZoneCard(BuildContext context, CrowdDensity density) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final densityColor = _getDensityColor(density.densityLevel);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: isDark ? Colors.black26 : Colors.grey.shade200,
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
        border: Border.all(
          color: isDark ? Colors.white10 : Colors.grey.shade100,
        ),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      density.areaName,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: theme.colorScheme.primary,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${density.personCount} people',
                      style: TextStyle(
                        color: theme.textTheme.bodySmall?.color,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: densityColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  density.densityLevel,
                  style: TextStyle(
                    color: densityColor,
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: (density.peoplePerM2 / 1.0).clamp(0.0, 1.0),
              backgroundColor: densityColor.withOpacity(0.1),
              valueColor: AlwaysStoppedAnimation(densityColor),
              minHeight: 8,
            ),
          ),
        ],
      ),
    );
  }

  // Action Button Widget
  Widget _buildActionButton(
      BuildContext context,
      IconData icon,
      String label,
      List<Color> colors,
      VoidCallback onPressed,
      ) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: colors,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: colors[0].withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onPressed,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, color: Colors.white, size: 28),
                const SizedBox(height: 8),
                Text(
                  label,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
