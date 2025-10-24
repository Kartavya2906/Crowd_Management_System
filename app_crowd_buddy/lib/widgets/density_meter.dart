import 'package:flutter/material.dart';

class DensityMeter extends StatelessWidget {
  final double level; // value between 0..1
  const DensityMeter({super.key, required this.level});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: LinearProgressIndicator(value: level, minHeight: 14),
        ),
        const SizedBox(height: 6),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Low'),
            Text('${(level * 100).toStringAsFixed(0)}%'),
            const Text('High'),
          ],
        )
      ],
    );
  }
}
