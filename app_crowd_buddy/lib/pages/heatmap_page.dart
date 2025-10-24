import 'package:flutter/material.dart';

class HeatmapPage extends StatelessWidget {
  static const route = '/heatmap';
  const HeatmapPage({super.key});

  @override
  Widget build(BuildContext context) {
    // Dummy density grid (3x3 for demo)
    final density = [
      [0.1, 0.3, 0.6],
      [0.4, 0.8, 0.5],
      [0.2, 0.7, 0.9],
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Crowd Heatmap & Weather')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Heatmap',
              style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 12),
          AspectRatio(
            aspectRatio: 1,
            child: GridView.builder(
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3, crossAxisSpacing: 4, mainAxisSpacing: 4),
              itemCount: 9,
              itemBuilder: (_, i) {
                final row = i ~/ 3;
                final col = i % 3;
                final val = density[row][col];
                return Container(
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: Color.lerp(Colors.green, Colors.red, val),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text('${(val * 100).toStringAsFixed(0)}%',
                      style: const TextStyle(
                          color: Colors.white, fontWeight: FontWeight.bold)),
                );
              },
            ),
          ),
          const SizedBox(height: 24),
          Text('Weather',
              style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 12),
          Card(
            shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: ListTile(
              leading: const Icon(Icons.cloud_outlined, size: 32),
              title: const Text('Partly Cloudy'),
              subtitle: const Text('28°C • Humidity 62%'),
              trailing: IconButton(
                icon: const Icon(Icons.refresh),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Weather data refreshed')),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}
