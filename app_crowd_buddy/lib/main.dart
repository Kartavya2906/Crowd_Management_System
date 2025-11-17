import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'pages/auth_wrapper.dart';
import 'pages/login_page.dart';
import 'pages/signup_page.dart';
import 'pages/forgot_password_page.dart';
import 'pages/home_page.dart';
import 'pages/event_list_page.dart';
import 'pages/crowd_dashboard.dart';
import 'pages/lost_person_form.dart';
import 'pages/medical_help_page.dart';
import 'pages/emergency_exit_page.dart';
import 'pages/feedback_page.dart';
import 'pages/live_map_page.dart';
import 'pages/alerts_page.dart';
import 'pages/washrooms_page.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(const CrowdBuddyApp());
}

class CrowdBuddyApp extends StatefulWidget {
  const CrowdBuddyApp({super.key});

  @override
  State<CrowdBuddyApp> createState() => CrowdBuddyAppState();
}

class CrowdBuddyAppState extends State<CrowdBuddyApp> {
  ThemeMode _themeMode = ThemeMode.light;

  void toggleTheme() {
    setState(() {
      _themeMode = _themeMode == ThemeMode.light
          ? ThemeMode.dark
          : ThemeMode.light;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CrowdBuddy',
      themeMode: _themeMode,
      theme: _buildLightTheme(),
      darkTheme: _buildDarkTheme(),
      home: AuthWrapper(onThemeToggle: toggleTheme),
      routes: {
        '/home': (_) => HomePage(onThemeToggle: toggleTheme),
        LoginPage.route: (_) => const LoginPage(),
        SignupPage.route: (_) => const SignupPage(),
        ForgotPasswordPage.route: (_) => const ForgotPasswordPage(),
        EventListPage.route: (_) => const EventListPage(),
        CrowdDashboard.route: (_) => const CrowdDashboard(),
        LostPersonForm.route: (_) => const LostPersonForm(),
        MedicalHelpPage.route: (context) => const MedicalHelpPage(),
        EmergencyExitPage.route: (_) => const EmergencyExitPage(),
        FeedbackPage.route: (_) => const FeedbackPage(),
        LiveMapPage.route: (_) => const LiveMapPage(),
        AlertsPage.route: (_) => const AlertsPage(),
        WashroomsPage.route: (_) => const WashroomsPage(),
      },
    );
  }

  ThemeData _buildLightTheme() {
    return ThemeData(
      useMaterial3: true,
      colorSchemeSeed: Colors.teal,
      brightness: Brightness.light,
      scaffoldBackgroundColor: Colors.grey[50],
      appBarTheme: const AppBarTheme(
        centerTitle: false,
        elevation: 0,
      ),
      cardTheme: CardTheme(
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        filled: true,
      ),
    );
  }

  ThemeData _buildDarkTheme() {
    return ThemeData(
      useMaterial3: true,
      colorSchemeSeed: Colors.teal,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: const Color(0xFF121212),
      appBarTheme: const AppBarTheme(
        centerTitle: false,
        elevation: 0,
      ),
      cardTheme: CardTheme(
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        filled: true,
      ),
    );
  }
}