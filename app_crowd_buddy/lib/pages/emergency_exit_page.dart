import 'package:flutter/material.dart';

class EmergencyExitPage extends StatelessWidget {
  static const route = '/exit';
  const EmergencyExitPage({super.key});

  @override
  Widget build(BuildContext context) {
    final exits = [
      'Gate A – North Side',
      'Gate B – Near Parking',
      'Gate C – South Exit',
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Safe Exits')),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: exits.length,
        separatorBuilder: (_, __) => const Divider(),
        itemBuilder: (_, i) => ListTile(
          leading: const Icon(Icons.exit_to_app), // <-- FIXED
          title: Text(exits[i]),
          subtitle: const Text('Follow signage'),
          trailing: const Icon(Icons.arrow_forward_ios, size: 16),
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Navigating to ${exits[i]}...')),
            );
          },
        ),
      ),
    );
  }
}
