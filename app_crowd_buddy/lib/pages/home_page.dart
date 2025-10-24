import 'package:flutter/material.dart';
import '../widgets/banner_carousel.dart';
import '../widgets/quick_tiles.dart';
import 'event_list_page.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('CrowdBuddy'),

      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const BannerCarousel(),
          const SizedBox(height: 16),
          TextField(
            decoration: InputDecoration(
              hintText: 'Search or find event',
              prefixIcon: const Icon(Icons.search),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
            ),
            onSubmitted: (_) => Navigator.pushNamed(context, EventListPage.route),
          ),
          const SizedBox(height: 16),
          FilledButton.icon(
            onPressed: () => Navigator.pushNamed(context, EventListPage.route),
            icon: const Icon(Icons.event_available_outlined),
            label: const Text('Join Event'),
          ),

          const SizedBox(height: 24),
          const QuickTilesRow(),
        ],
      ),
    );
  }
}
