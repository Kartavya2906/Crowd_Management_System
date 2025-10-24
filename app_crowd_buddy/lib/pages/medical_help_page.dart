import 'package:flutter/material.dart';

class MedicalHelpPage extends StatelessWidget {
  static const route = '/medical';
  const MedicalHelpPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Medical Help')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Request help → sends GPS to nearest help point'),
            const SizedBox(height: 16),
            Card(
              child: ListTile(
                leading: const Icon(Icons.my_location_outlined),
                title: const Text('Current Location'),
                subtitle: const Text('Lat • Lng (mocked)'),
                trailing: OutlinedButton(
                  onPressed: () {}, // TODO: use geolocator
                  child: const Text('Refresh'),
                ),
              ),
            ),
            const Spacer(),
            FilledButton.icon(
              onPressed: () {
                // TODO: send to backend
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('SOS sent to admin & nearest help point')),
                );
              },
              icon: const Icon(Icons.emergency_share),
              label: const Text('Send SOS'),
            ),
          ],
        ),
      ),
    );
  }
}
