import 'package:flutter/material.dart';
import '../widgets/density_meter.dart';
import '../widgets/section.dart';
import 'medical_help_page.dart';
import 'emergency_exit_page.dart';
import 'feedback_page.dart';
import 'lost_person_form.dart';
import 'alerts_page.dart';
import 'heatmap_page.dart';

class CrowdDashboard extends StatelessWidget {
  static const route = '/dashboard';
  const CrowdDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Crowd Dashboard')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Section(
            title: 'Map View (Real-time Crowd Density)',
            child: Container(
              height: 220,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
              ),
              child: const Text('Map Placeholder\n(overlay heatmap here)'),
            ),
          ),
          Section(
            title: 'Quick Actions',
            child: Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                ActionChip(
                  avatar: const Icon(Icons.local_hospital_outlined),
                  label: const Text('Nearest Hospitals'),
                  onPressed: () {},
                ),
                ActionChip(
                  avatar: const Icon(Icons.wc_outlined),
                  label: const Text('Washrooms/Exits/Hotels'),
                  onPressed: () {},
                ),
                ActionChip(
                  avatar: const Icon(Icons.cloud_outlined),
                  label: const Text('Weather'),
                  onPressed: () => Navigator.pushNamed(context, HeatmapPage.route),
                ),
                ActionChip(
                  avatar: const Icon(Icons.auto_graph_outlined),
                  label: const Text('Crowd Prediction'),
                  onPressed: () {},
                ),
              ],
            ),
          ),
          Section(
            title: 'Density Meter',
            child: const DensityMeter(level: 0.62),
          ),
          Section(
            title: 'Emergency',
            child: Row(
              children: [
                Expanded(
                  child: FilledButton.icon(
                    onPressed: () => Navigator.pushNamed(context, MedicalHelpPage.route),
                    icon: const Icon(Icons.health_and_safety),
                    label: const Text('Medical Help'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => Navigator.pushNamed(context, EmergencyExitPage.route),
                    icon: const Icon(Icons.exit_to_app),
                    label: const Text('Safe Exit'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        destinations: const [
          NavigationDestination(icon: Icon(Icons.feedback_outlined), label: 'Feedback'),
          NavigationDestination(icon: Icon(Icons.person_search_outlined), label: 'Lost'),
          NavigationDestination(icon: Icon(Icons.notifications_active_outlined), label: 'Alerts'),
        ],
        onDestinationSelected: (i) {
          if (i == 0) Navigator.pushNamed(context, FeedbackPage.route);
          if (i == 1) Navigator.pushNamed(context, LostPersonForm.route);
          if (i == 2) Navigator.pushNamed(context, AlertsPage.route);
        },
        selectedIndex: 2,
      ),
    );
  }
}
