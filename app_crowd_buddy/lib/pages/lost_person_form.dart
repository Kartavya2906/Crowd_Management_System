import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/lost_person_service.dart';

class LostPersonForm extends StatefulWidget {
  static const route = '/lost';

  // Accept optional parameters for pre-filling the form
  final String? userId;
  final String? eventId;
  final String? userName;
  final String? userPhone;

  const LostPersonForm({
    super.key,
    this.userId,
    this.eventId,
    this.userName,
    this.userPhone,
  });

  @override
  State<LostPersonForm> createState() => _LostPersonFormState();
}

class _LostPersonFormState extends State<LostPersonForm> {
  final _formKey = GlobalKey<FormState>();
  final _lostPersonService = LostPersonService();

  // Controllers
  final _reporterName = TextEditingController();
  final _contactNumber = TextEditingController();
  final _lostPersonName = TextEditingController();
  final _age = TextEditingController();
  final _description = TextEditingController();
  final _lastSeenLocation = TextEditingController();

  // Other state
  File? _imageFile;
  ImageProvider? _photo;
  String _selectedGender = 'Male';
  TimeOfDay? _selectedTime;
  bool _isSubmitting = false;

  // Store userId and eventId from SharedPreferences
  String? _userId;
  String? _eventId;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  // Load user data from widget parameters or SharedPreferences
  Future<void> _loadUserData() async {
    final prefs = await SharedPreferences.getInstance();

    setState(() {
      // Try to get from widget parameters first, then from SharedPreferences
      _userId = widget.userId ?? prefs.getString('user_id');
      _eventId = widget.eventId ?? prefs.getString('event_id');

      // Load reporter name
      if (widget.userName != null && widget.userName!.isNotEmpty) {
        _reporterName.text = widget.userName!;
      } else {
        _reporterName.text = prefs.getString('user_name') ?? '';
      }

      // Load reporter phone
      if (widget.userPhone != null && widget.userPhone!.isNotEmpty) {
        _contactNumber.text = widget.userPhone!;
      } else {
        _contactNumber.text = prefs.getString('user_phone') ?? '';
      }
    });

    // Debug print to verify data is loaded
    print('Loaded user data:');
    print('_userId: $_userId');
    print('_eventId: $_eventId');
    print('Reporter name: ${_reporterName.text}');
    print('Reporter phone: ${_contactNumber.text}');
  }

  Future<void> _pickImage(ImageSource source) async {
    final ImagePicker picker = ImagePicker();
    final XFile? pickedFile = await picker.pickImage(
      source: source,
      maxWidth: 1024,
      maxHeight: 1024,
      imageQuality: 85,
    );

    if (pickedFile != null) {
      setState(() {
        _imageFile = File(pickedFile.path);
        _photo = FileImage(_imageFile!);
      });
    }
  }

  void _showImageSourceDialog() {
    showModalBottomSheet(
      context: context,
      builder: (context) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Pick from Gallery'),
              onTap: () {
                _pickImage(ImageSource.gallery);
                Navigator.of(context).pop();
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_camera),
              title: const Text('Take a Photo'),
              onTap: () {
                _pickImage(ImageSource.camera);
                Navigator.of(context).pop();
              },
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _selectTime() async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
    );

    if (picked != null) {
      setState(() {
        _selectedTime = picked;
      });
    }
  }

  Future<void> _submitForm() async {
    if (_formKey.currentState!.validate()) {
      // if (_imageFile == null) {
      //   _showErrorSnackBar('Please upload a photo of the lost person.');
      //   return;
      // }

      if (_selectedTime == null) {
        _showErrorSnackBar('Please select the last seen time.');
        return;
      }

      // Check if userId and eventId are available from SharedPreferences
      if (_userId == null || _userId!.isEmpty) {
        _showErrorSnackBar('User ID is missing. Please log in again.');
        return;
      }

      if (_eventId == null || _eventId!.isEmpty) {
        _showErrorSnackBar('Event ID is missing. Please select an event.');
        return;
      }

      setState(() {
        _isSubmitting = true;
      });

      // Format time as HH:MM
      final formattedTime =
          '${_selectedTime!.hour.toString().padLeft(2, '0')}:${_selectedTime!.minute.toString().padLeft(2, '0')}';

      try {
        print('Submitting with userId: $_userId, eventId: $_eventId');

        final result = await _lostPersonService.submitLostPersonReport(
          reporterId: _userId!,
          reporterName: _reporterName.text.trim(),
          reporterPhone: _contactNumber.text.trim(),
          lostPersonName: _lostPersonName.text.trim(),
          age: int.parse(_age.text.trim()),
          gender: _selectedGender,
          description: _description.text.trim(),
          lastSeenLocation: _lastSeenLocation.text.trim(),
          lastSeenTime: formattedTime,
          eventId: _eventId!,
          photo: _imageFile,
        );

        if (!mounted) return;

        setState(() {
          _isSubmitting = false;
        });

        if (result['success'] == true) {
          // Show success dialog
          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (BuildContext context) {
              return AlertDialog(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                content: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.green.shade50,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.check_circle,
                        color: Colors.green.shade600,
                        size: 48,
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Report Submitted',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      result['message'] ??
                          'Your lost person report has been submitted successfully.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 14,
                      ),
                    ),
                    if (result['data'] != null && result['data']['id'] != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Text(
                          'Report ID: ${result['data']['id']}',
                          style: TextStyle(
                            color: Colors.grey.shade500,
                            fontSize: 12,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.of(context).pop(); // Close dialog
                          Navigator.of(context).pop(); // Close form
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.orange.shade600,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text(
                          'OK',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          );
        } else {
          // Show error message
          _showErrorSnackBar(result['message'] ??
              'Failed to submit report. Please try again.');
        }
      } catch (e) {
        print('Error in _submitForm: $e');
        if (!mounted) return;

        setState(() {
          _isSubmitting = false;
        });

        _showErrorSnackBar('An unexpected error occurred: ${e.toString()}');
      }
    }
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error, color: Colors.white),
            const SizedBox(width: 12),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        duration: const Duration(seconds: 4),
      ),
    );
  }

  String? _req(String? v) =>
      (v == null || v.trim().isEmpty) ? 'This field is required' : null;

  String? _validateAge(String? v) {
    if (v == null || v.trim().isEmpty) {
      return 'Age is required';
    }

    final age = int.tryParse(v.trim());
    if (age == null || age <= 0 || age > 150) {
      return 'Please enter a valid age';
    }

    return null;
  }

  @override
  void dispose() {
    _reporterName.dispose();
    _contactNumber.dispose();
    _lostPersonName.dispose();
    _age.dispose();
    _description.dispose();
    _lastSeenLocation.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // App Bar
          SliverAppBar(
            expandedHeight: 120,
            floating: false,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: const Text(
                'Lost Person Report',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.0,
                ),
              ),
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: isDark
                        ? [
                      Colors.orange.shade900,
                      Colors.orange.shade700,
                      Colors.deepOrange.shade800,
                    ]
                        : [
                      Colors.orange.shade400,
                      Colors.orange.shade600,
                      Colors.deepOrange.shade500,
                    ],
                  ),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Form(
              key: _formKey,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Photo Upload Section
                    Center(
                      child: Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: isDark
                                ? [
                              Colors.orange.shade900.withOpacity(0.3),
                              Colors.deepOrange.shade900.withOpacity(0.2),
                            ]
                                : [
                              Colors.orange.shade50,
                              Colors.deepOrange.shade50,
                            ],
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.orange.withOpacity(0.2),
                              blurRadius: 15,
                              offset: const Offset(0, 6),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            Stack(
                              children: [
                                Container(
                                  width: 120,
                                  height: 120,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    gradient: LinearGradient(
                                      colors: [
                                        Colors.orange.shade300,
                                        Colors.deepOrange.shade400,
                                      ],
                                    ),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.orange.withOpacity(0.4),
                                        blurRadius: 15,
                                        offset: const Offset(0, 6),
                                      ),
                                    ],
                                  ),
                                  child: CircleAvatar(
                                    radius: 60,
                                    backgroundImage: _photo,
                                    backgroundColor: Colors.transparent,
                                    child: _photo == null
                                        ? const Icon(Icons.person,
                                        size: 60, color: Colors.white)
                                        : null,
                                  ),
                                ),
                                Positioned(
                                  right: 0,
                                  bottom: 0,
                                  child: Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        colors: [
                                          Colors.orange.shade600,
                                          Colors.deepOrange.shade600,
                                        ],
                                      ),
                                      shape: BoxShape.circle,
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.orange.withOpacity(0.5),
                                          blurRadius: 8,
                                          offset: const Offset(0, 2),
                                        ),
                                      ],
                                    ),
                                    child: const Icon(
                                      Icons.camera_alt,
                                      color: Colors.white,
                                      size: 20,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            OutlinedButton.icon(
                              onPressed: _showImageSourceDialog,
                              icon: const Icon(Icons.photo_camera_outlined),
                              label: const Text('Upload Photo'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.orange,
                                side: const BorderSide(color: Colors.orange),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Reporter Information
                    _buildSectionHeader('Reporter Information', isDark),
                    const SizedBox(height: 16),
                    _buildTextField(
                      controller: _reporterName,
                      label: 'Your Name (Reporter)',
                      icon: Icons.person_outline,
                      validator: _req,
                      isDark: isDark,
                    ),
                    const SizedBox(height: 16),
                    _buildTextField(
                      controller: _contactNumber,
                      label: 'Contact Number',
                      icon: Icons.phone_outlined,
                      validator: _req,
                      keyboardType: TextInputType.phone,
                      isDark: isDark,
                    ),
                    const SizedBox(height: 24),

                    // Lost Person Details
                    _buildSectionHeader('Lost Person Details', isDark),
                    const SizedBox(height: 16),
                    _buildTextField(
                      controller: _lostPersonName,
                      label: 'Lost Person Name',
                      icon: Icons.person_outline,
                      validator: _req,
                      isDark: isDark,
                    ),
                    const SizedBox(height: 16),

                    // Age and Gender Row
                    Row(
                      children: [
                        Expanded(
                          child: _buildTextField(
                            controller: _age,
                            label: 'Age',
                            icon: Icons.cake_outlined,
                            validator: _validateAge,
                            keyboardType: TextInputType.number,
                            isDark: isDark,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Container(
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(12),
                              gradient: LinearGradient(
                                colors: isDark
                                    ? [
                                  Colors.orange.shade900.withOpacity(0.2),
                                  Colors.deepOrange.shade900
                                      .withOpacity(0.1),
                                ]
                                    : [
                                  Colors.orange.shade50,
                                  Colors.deepOrange.shade50,
                                ],
                              ),
                            ),
                            child: DropdownButtonFormField<String>(
                              value: _selectedGender,
                              decoration: InputDecoration(
                                labelText: 'Gender',
                                prefixIcon: const Icon(Icons.wc,
                                    color: Colors.orange),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: BorderSide.none,
                                ),
                                filled: true,
                                fillColor: Colors.transparent,
                              ),
                              items: ['Male', 'Female', 'Other']
                                  .map((String value) {
                                return DropdownMenuItem<String>(
                                  value: value,
                                  child: Text(value),
                                );
                              }).toList(),
                              onChanged: (String? newValue) {
                                setState(() {
                                  _selectedGender = newValue!;
                                });
                              },
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    _buildTextField(
                      controller: _description,
                      label: 'Clothing/Physical Description',
                      icon: Icons.description_outlined,
                      validator: _req,
                      maxLines: 4,
                      isDark: isDark,
                    ),
                    const SizedBox(height: 24),

                    // Last Seen Details
                    _buildSectionHeader('Last Seen Details', isDark),
                    const SizedBox(height: 16),
                    _buildTextField(
                      controller: _lastSeenLocation,
                      label: 'Last Seen Location',
                      icon: Icons.location_on_outlined,
                      validator: _req,
                      isDark: isDark,
                    ),
                    const SizedBox(height: 16),

                    // Time Picker
                    Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        gradient: LinearGradient(
                          colors: isDark
                              ? [
                            Colors.orange.shade900.withOpacity(0.2),
                            Colors.deepOrange.shade900.withOpacity(0.1),
                          ]
                              : [
                            Colors.orange.shade50,
                            Colors.deepOrange.shade50,
                          ],
                        ),
                      ),
                      child: InkWell(
                        onTap: _selectTime,
                        borderRadius: BorderRadius.circular(12),
                        child: InputDecorator(
                          decoration: InputDecoration(
                            labelText: 'Last Seen Time',
                            prefixIcon: const Icon(Icons.access_time,
                                color: Colors.orange),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide.none,
                            ),
                            filled: true,
                            fillColor: Colors.transparent,
                          ),
                          child: Text(
                            _selectedTime != null
                                ? _selectedTime!.format(context)
                                : 'Select time',
                            style: TextStyle(
                              color: _selectedTime != null
                                  ? theme.textTheme.bodyLarge?.color
                                  : theme.hintColor,
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Warning
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isDark
                            ? Colors.orange.shade900.withOpacity(0.2)
                            : Colors.orange.shade50,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: Colors.orange.shade200,
                          width: 1,
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.info_outline,
                              color: Colors.orange.shade700, size: 20),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'This report will be immediately sent to event security and staff.',
                              style: TextStyle(
                                color: isDark
                                    ? Colors.orange.shade300
                                    : Colors.orange.shade700,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Submit Button
                    Container(
                      width: double.infinity,
                      height: 56,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        gradient: LinearGradient(
                          colors: [
                            Colors.orange.shade600,
                            Colors.deepOrange.shade600,
                          ],
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.orange.withOpacity(0.4),
                            blurRadius: 15,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Material(
                        color: Colors.transparent,
                        child: InkWell(
                          borderRadius: BorderRadius.circular(16),
                          onTap: _isSubmitting ? null : _submitForm,
                          child: _isSubmitting
                              ? const Center(
                            child: SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            ),
                          )
                              : const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.send, color: Colors.white),
                              SizedBox(width: 12),
                              Text(
                                'Submit Report',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, bool isDark) {
    return Container(
      padding: const EdgeInsets.only(left: 4, bottom: 4),
      decoration: BoxDecoration(
        border: Border(
          left: BorderSide(
            color: Colors.orange.shade600,
            width: 4,
          ),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.only(left: 8),
        child: Text(
          title,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.orange.shade300 : Colors.orange.shade900,
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    required bool isDark,
    String? Function(String?)? validator,
    TextInputType? keyboardType,
    int maxLines = 1,
  }) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        gradient: LinearGradient(
          colors: isDark
              ? [
            Colors.orange.shade900.withOpacity(0.2),
            Colors.deepOrange.shade900.withOpacity(0.1),
          ]
              : [
            Colors.orange.shade50,
            Colors.deepOrange.shade50,
          ],
        ),
      ),
      child: TextFormField(
        controller: controller,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon, color: Colors.orange),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          filled: true,
          fillColor: Colors.transparent,
        ),
        validator: validator,
        keyboardType: keyboardType,
        maxLines: maxLines,
      ),
    );
  }
}
