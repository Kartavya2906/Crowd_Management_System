import 'package:flutter/material.dart';
import '../pages/crowd_dashboard.dart';
import '../pages/alerts_page.dart';
import '../pages/lost_person_form.dart';
import '../pages/medical_help_page.dart';

class QuickTilesRow extends StatelessWidget {
  const QuickTilesRow({super.key});

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.6,
      children: [
        _QuickTile(
          icon: Icons.map_outlined,
          title: 'Crowd Dashboard',
          onTap: () => Navigator.pushNamed(context, CrowdDashboard.route),
        ),
        _QuickTile(
          icon: Icons.report_gmailerrorred_outlined,
          title: 'Active Alerts',
          onTap: () => Navigator.pushNamed(context, AlertsPage.route),
        ),
        _QuickTile(
          icon: Icons.person_search_outlined,
          title: 'Lost Person',
          onTap: () => Navigator.pushNamed(context, LostPersonForm.route),
        ),
        _QuickTile(
          icon: Icons.health_and_safety_outlined,
          title: 'Medical Help',
          onTap: () => Navigator.pushNamed(context, MedicalHelpPage.route),
        ),
      ],
    );
  }
}

class _QuickTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;
  const _QuickTile(
      {required this.icon, required this.title, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Card(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Icon(icon, size: 28),
              const SizedBox(width: 12),
              Expanded(
                child: Text(title,
                    style: const TextStyle(fontWeight: FontWeight.w600)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
