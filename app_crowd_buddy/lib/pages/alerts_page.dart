import 'package:flutter/material.dart';

class AlertsPage extends StatelessWidget {
  static const route = '/alerts';
  const AlertsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final alerts = [
      {'title': 'Overcrowding near Gate A', 'time': '2 min ago'},
      {'title': 'Medical SOS reported', 'time': '10 min ago'},
      {'title': 'Weather alert: Heavy rain', 'time': '30 min ago'},
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Active Alerts')),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: alerts.length,
        separatorBuilder: (_, __) => const Divider(),
        itemBuilder: (_, i) => ListTile(
          leading: const Icon(Icons.warning_amber_outlined, color: Colors.red),
          title: Text(alerts[i]['title']!),
          subtitle: Text(alerts[i]['time']!),
          trailing: const Icon(Icons.chevron_right),
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Details: ${alerts[i]['title']}')),
            );
          },
        ),
      ),
    );
  }
}
