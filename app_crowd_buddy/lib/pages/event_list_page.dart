import 'package:flutter/material.dart';
import 'crowd_dashboard.dart';

class EventListPage extends StatelessWidget {
  static const route = '/events';
  const EventListPage({super.key});

  @override
  Widget build(BuildContext context) {
    final events = List.generate(8, (i) => 'TechFest ${2025 + i}');
    return Scaffold(
      appBar: AppBar(title: const Text('Select Event')),
      body: ListView.separated(
        itemCount: events.length,
        separatorBuilder: (_, __) => const Divider(height: 0),
        itemBuilder: (_, i) => ListTile(
          leading: const CircleAvatar(child: Icon(Icons.event)),
          title: Text(events[i]),
          subtitle: const Text('Location • Date • Organizer'),
          trailing: FilledButton(
            onPressed: () => Navigator.pushNamed(context, CrowdDashboard.route),
            child: const Text('Join'),
          ),
        ),
      ),
    );
  }
}
