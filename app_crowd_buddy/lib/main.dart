import 'package:flutter/material.dart';
import 'pages/home_page.dart';
import 'pages/event_list_page.dart';
import 'pages/crowd_dashboard.dart';
import 'pages/lost_person_form.dart';
import 'pages/medical_help_page.dart';
import 'pages/emergency_exit_page.dart';
import 'pages/feedback_page.dart';
import 'pages/heatmap_page.dart';
import 'pages/alerts_page.dart';

void main() => runApp(const CrowdBuddyApp());

class CrowdBuddyApp extends StatelessWidget {
  const CrowdBuddyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CrowdBuddy',
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: Colors.teal,
        brightness: Brightness.light,
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: Colors.teal,
        brightness: Brightness.dark,
      ),
      home: const HomePage(),
      routes: {
        EventListPage.route: (_) => const EventListPage(),
        CrowdDashboard.route: (_) => const CrowdDashboard(),
        LostPersonForm.route: (_) => const LostPersonForm(),
        MedicalHelpPage.route: (_) => const MedicalHelpPage(),
        EmergencyExitPage.route: (_) => const EmergencyExitPage(),
        FeedbackPage.route: (_) => const FeedbackPage(),
        HeatmapPage.route: (_) => const HeatmapPage(),
        AlertsPage.route: (_) => const AlertsPage(),
      },
    );
  }
}
