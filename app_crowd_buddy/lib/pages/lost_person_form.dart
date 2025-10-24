import 'package:flutter/material.dart';

class LostPersonForm extends StatefulWidget {
  static const route = '/lost';
  const LostPersonForm({super.key});

  @override
  State<LostPersonForm> createState() => _LostPersonFormState();
}

class _LostPersonFormState extends State<LostPersonForm> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _age = TextEditingController();
  final _desc = TextEditingController();
  ImageProvider? _photo;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Lost Person Report')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 36,
                  backgroundImage: _photo,
                  child: _photo == null ? const Icon(Icons.person) : null,
                ),
                const SizedBox(width: 12),
                OutlinedButton.icon(
                  onPressed: () async {
                    // TODO: integrate image_picker
                    setState(() {
                      _photo = const AssetImage('');
                    });
                  },
                  icon: const Icon(Icons.photo_camera_outlined),
                  label: const Text('Upload Photo'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _name,
              decoration: const InputDecoration(labelText: 'Name'),
              validator: _req,
            ),
            const SizedBox(height: 8),
            TextFormField(
              controller: _age,
              decoration: const InputDecoration(labelText: 'Age'),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 8),
            TextFormField(
              controller: _desc,
              decoration: const InputDecoration(labelText: 'Clothes/Description'),
              maxLines: 3,
            ),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: () {
                if (_formKey.currentState!.validate()) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Report sent to admin')),
                  );
                }
              },
              icon: const Icon(Icons.send),
              label: const Text('Submit'),
            )
          ],
        ),
      ),
    );
  }

  String? _req(String? v) => (v == null || v.trim().isEmpty) ? 'Required' : null;
}
