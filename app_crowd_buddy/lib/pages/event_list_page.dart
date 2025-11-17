import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart'; // ✅ ADD THIS LINE
import '../models/event_model.dart';
import '../services/event_service.dart';
import 'crowd_dashboard.dart';

enum EventFilter {
  all,
  live,
  upcoming,
  completed,
}

class EventListPage extends StatefulWidget {
  static const route = '/events';

  const EventListPage({super.key});

  @override
  State<EventListPage> createState() => _EventListPageState();
}

class _EventListPageState extends State<EventListPage> {
  final EventService _eventService = EventService();
  List<Event> _events = [];
  List<Event> _filteredEvents = [];
  String _searchQuery = '';
  bool _isLoading = true;
  String? _errorMessage;
  EventFilter _selectedFilter = EventFilter.all;

  @override
  void initState() {
    super.initState();
    _loadEvents();
  }

  Future<void> _loadEvents() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      List<Event> events;
      switch (_selectedFilter) {
        case EventFilter.live:
          events = await _eventService.fetchLiveEvents();
          break;
        case EventFilter.upcoming:
          events = await _eventService.fetchEventsByStatus('upcoming');
          break;
        case EventFilter.completed:
          events = await _eventService.fetchEventsByStatus('completed');
          break;
        case EventFilter.all:
        default:
          events = await _eventService.fetchEvents();
          break;
      }

      setState(() {
        _events = events;
        _filteredEvents = events;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  void _filterEvents(String query) {
    setState(() {
      _searchQuery = query;
      if (query.isEmpty) {
        _filteredEvents = _events;
      } else {
        _filteredEvents = _events.where((event) {
          return event.name.toLowerCase().contains(query.toLowerCase()) ||
              event.location.toLowerCase().contains(query.toLowerCase()) ||
              event.description.toLowerCase().contains(query.toLowerCase());
        }).toList();
      }
    });
  }

  void _changeFilter(EventFilter filter) {
    setState(() {
      _selectedFilter = filter;
      _searchQuery = '';
    });
    _loadEvents();
  }

  Color _getTypeColor(String type) {
    switch (type) {
      case 'Tech':
        return Colors.blue;
      case 'Music':
        return Colors.purple;
      case 'Sports':
        return Colors.orange;
      default:
        return Colors.teal;
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'live':
        return Colors.red;
      case 'upcoming':
        return Colors.blue;
      case 'completed':
        return Colors.grey;
      default:
        return Colors.teal;
    }
  }

  String _getFilterLabel(EventFilter filter) {
    switch (filter) {
      case EventFilter.all:
        return 'All';
      case EventFilter.live:
        return 'Live';
      case EventFilter.upcoming:
        return 'Upcoming';
      case EventFilter.completed:
        return 'Completed';
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Gradient AppBar
          SliverAppBar(
            expandedHeight: 120,
            floating: false,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: const Text(
                'Discover Events',
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
                      Colors.teal.shade900,
                      Colors.teal.shade700,
                      Colors.cyan.shade800,
                    ]
                        : [
                      Colors.teal.shade400,
                      Colors.teal.shade600,
                      Colors.cyan.shade500,
                    ],
                  ),
                ),
              ),
            ),
          ),

          // Filter Chips
          SliverToBoxAdapter(
            child: Container(
              height: 60,
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                children: EventFilter.values.map((filter) {
                  final isSelected = _selectedFilter == filter;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      selected: isSelected,
                      label: Text(
                        _getFilterLabel(filter),
                        style: TextStyle(
                          color: isSelected ? Colors.white : null,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      backgroundColor: isDark
                          ? Colors.teal.shade900.withOpacity(0.3)
                          : Colors.teal.shade50,
                      selectedColor: Colors.teal,
                      checkmarkColor: Colors.white,
                      onSelected: (selected) {
                        if (selected) {
                          _changeFilter(filter);
                        }
                      },
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          // Search Bar
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  gradient: LinearGradient(
                    colors: isDark
                        ? [
                      Colors.teal.shade900.withOpacity(0.3),
                      Colors.cyan.shade900.withOpacity(0.3),
                    ]
                        : [
                      Colors.teal.shade50,
                      Colors.cyan.shade50,
                    ],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.teal.withOpacity(0.2),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: TextField(
                  onChanged: _filterEvents,
                  controller: TextEditingController(text: _searchQuery),
                  decoration: InputDecoration(
                    hintText: 'Search events...',
                    prefixIcon: const Icon(Icons.search, color: Colors.teal),
                    suffixIcon: _searchQuery.isNotEmpty
                        ? IconButton(
                      icon: const Icon(Icons.clear),
                      onPressed: () {
                        _filterEvents('');
                      },
                    )
                        : null,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide.none,
                    ),
                    filled: true,
                    fillColor: Colors.transparent,
                  ),
                ),
              ),
            ),
          ),

          // Loading Indicator
          if (_isLoading)
            const SliverFillRemaining(
              child: Center(
                child: CircularProgressIndicator(
                  color: Colors.teal,
                ),
              ),
            ),

          // Error State
          if (_errorMessage != null && !_isLoading)
            SliverFillRemaining(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.error_outline,
                      size: 64,
                      color: theme.colorScheme.error,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Failed to load events',
                      style: theme.textTheme.titleMedium?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.6),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 32),
                      child: Text(
                        _errorMessage!,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurface.withOpacity(0.4),
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: _loadEvents,
                      icon: const Icon(Icons.refresh),
                      label: const Text('Retry'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.teal,
                        foregroundColor: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ),

          // Events List
          if (!_isLoading && _errorMessage == null)
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                      (context, index) {
                    final event = _filteredEvents[index];
                    final eventType = event.getEventType();

                    return TweenAnimationBuilder(
                      duration: Duration(milliseconds: 300 + (index * 50)),
                      tween: Tween<double>(begin: 0.0, end: 1.0),
                      builder: (context, value, child) {
                        return Transform.translate(
                          offset: Offset(0, 20 * (1 - value)),
                          child: Opacity(
                            opacity: value,
                            child: child,
                          ),
                        );
                      },
                      child: Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(20),
                            gradient: LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: isDark
                                  ? [
                                Colors.teal.shade800.withOpacity(0.3),
                                Colors.cyan.shade900.withOpacity(0.2),
                              ]
                                  : [
                                Colors.teal.shade50,
                                Colors.cyan.shade50,
                              ],
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.teal.withOpacity(0.15),
                                blurRadius: 12,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: Material(
                            color: Colors.transparent,
                            child: InkWell(
                              borderRadius: BorderRadius.circular(20),
                              // ✅ ONLY THIS SECTION IS MODIFIED
                              onTap: () async {
                                try {
                                  // Save event_id to SharedPreferences
                                  final prefs = await SharedPreferences.getInstance();
                                  await prefs.setString('current_event_id', event.id); // for medical page
                                  await prefs.setString('current_event_name', event.name);
                                  await prefs.setString('event_id', event.id); // for lost person page
                                  // Navigate to dashboard
                                  if (context.mounted) {
                                    Navigator.pushNamed(
                                      context,
                                      CrowdDashboard.route,
                                    );
                                  }
                                } catch (e) {
                                  // Show error if saving fails
                                  if (context.mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text('Error: $e')),
                                    );
                                  }
                                }
                              },
                              // ✅ END OF MODIFIED SECTION
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Row(
                                  children: [
                                    // Event Icon/Avatar
                                    Stack(
                                      children: [
                                        Container(
                                          width: 70,
                                          height: 70,
                                          decoration: BoxDecoration(
                                            gradient: LinearGradient(
                                              colors: [
                                                _getTypeColor(eventType),
                                                _getTypeColor(eventType).withOpacity(0.7),
                                              ],
                                            ),
                                            borderRadius: BorderRadius.circular(16),
                                            boxShadow: [
                                              BoxShadow(
                                                color: _getTypeColor(eventType).withOpacity(0.4),
                                                blurRadius: 8,
                                                offset: const Offset(0, 4),
                                              ),
                                            ],
                                          ),
                                          child: const Icon(
                                            Icons.event,
                                            color: Colors.white,
                                            size: 32,
                                          ),
                                        ),
                                        // Live Indicator
                                        if (event.status.toLowerCase() == 'live')
                                          Positioned(
                                            top: 0,
                                            right: 0,
                                            child: Container(
                                              padding: const EdgeInsets.all(4),
                                              decoration: BoxDecoration(
                                                color: Colors.red,
                                                shape: BoxShape.circle,
                                                boxShadow: [
                                                  BoxShadow(
                                                    color: Colors.red.withOpacity(0.6),
                                                    blurRadius: 8,
                                                    spreadRadius: 2,
                                                  ),
                                                ],
                                              ),
                                              child: const Icon(
                                                Icons.circle,
                                                color: Colors.white,
                                                size: 8,
                                              ),
                                            ),
                                          ),
                                      ],
                                    ),
                                    const SizedBox(width: 16),

                                    // Event Details
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              Expanded(
                                                child: Text(
                                                  event.name,
                                                  style: theme.textTheme.titleMedium?.copyWith(
                                                    fontWeight: FontWeight.bold,
                                                    letterSpacing: 0.3,
                                                  ),
                                                ),
                                              ),
                                              Container(
                                                padding: const EdgeInsets.symmetric(
                                                  horizontal: 8,
                                                  vertical: 4,
                                                ),
                                                decoration: BoxDecoration(
                                                  color: _getTypeColor(eventType).withOpacity(0.2),
                                                  borderRadius: BorderRadius.circular(8),
                                                ),
                                                child: Text(
                                                  eventType,
                                                  style: TextStyle(
                                                    fontSize: 11,
                                                    fontWeight: FontWeight.bold,
                                                    color: _getTypeColor(eventType),
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 4),

                                          // Status Badge
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 8,
                                              vertical: 2,
                                            ),
                                            decoration: BoxDecoration(
                                              color: _getStatusColor(event.status).withOpacity(0.2),
                                              borderRadius: BorderRadius.circular(6),
                                            ),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                if (event.status.toLowerCase() == 'live')
                                                  Container(
                                                    width: 6,
                                                    height: 6,
                                                    margin: const EdgeInsets.only(right: 4),
                                                    decoration: const BoxDecoration(
                                                      color: Colors.red,
                                                      shape: BoxShape.circle,
                                                    ),
                                                  ),
                                                Text(
                                                  event.status.toUpperCase(),
                                                  style: TextStyle(
                                                    fontSize: 10,
                                                    fontWeight: FontWeight.bold,
                                                    color: _getStatusColor(event.status),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                          const SizedBox(height: 8),

                                          Row(
                                            children: [
                                              Icon(
                                                Icons.location_on,
                                                size: 14,
                                                color: theme.colorScheme.onSurface.withOpacity(0.6),
                                              ),
                                              const SizedBox(width: 4),
                                              Text(
                                                event.location,
                                                style: theme.textTheme.bodySmall?.copyWith(
                                                  color: theme.colorScheme.onSurface.withOpacity(0.6),
                                                ),
                                              ),
                                              const SizedBox(width: 12),
                                              Icon(
                                                Icons.calendar_today,
                                                size: 14,
                                                color: theme.colorScheme.onSurface.withOpacity(0.6),
                                              ),
                                              const SizedBox(width: 4),
                                              Expanded(
                                                child: Text(
                                                  event.getFormattedDate(),
                                                  style: theme.textTheme.bodySmall?.copyWith(
                                                    color: theme.colorScheme.onSurface.withOpacity(0.6),
                                                  ),
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 8),

                                          Row(
                                            children: [
                                              const Icon(
                                                Icons.people,
                                                size: 14,
                                                color: Colors.teal,
                                              ),
                                              const SizedBox(width: 4),
                                              Text(
                                                '${event.attendeesCount}/${event.capacity} attendees',
                                                style: theme.textTheme.bodySmall?.copyWith(
                                                  color: Colors.teal,
                                                  fontWeight: FontWeight.w600,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),

                                    // Join Button
                                    Container(
                                      padding: const EdgeInsets.all(12),
                                      decoration: BoxDecoration(
                                        gradient: LinearGradient(
                                          colors: [
                                            Colors.teal.shade400,
                                            Colors.cyan.shade500,
                                          ],
                                        ),
                                        borderRadius: BorderRadius.circular(12),
                                        boxShadow: [
                                          BoxShadow(
                                            color: Colors.teal.withOpacity(0.4),
                                            blurRadius: 8,
                                            offset: const Offset(0, 4),
                                          ),
                                        ],
                                      ),
                                      child: const Icon(
                                        Icons.arrow_forward,
                                        color: Colors.white,
                                        size: 20,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                  childCount: _filteredEvents.length,
                ),
              ),
            ),

          // Empty State
          if (_filteredEvents.isEmpty && !_isLoading && _errorMessage == null)
            SliverFillRemaining(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.search_off,
                      size: 64,
                      color: theme.colorScheme.onSurface.withOpacity(0.3),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'No events found',
                      style: theme.textTheme.titleMedium?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.6),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Try changing your filter or search query',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.4),
                      ),
                    ),
                  ],
                ),
              ),
            ),

          // Bottom Padding
          const SliverToBoxAdapter(
            child: SizedBox(height: 16),
          ),
        ],
      ),

      // Floating Refresh Button
      floatingActionButton: FloatingActionButton(
        onPressed: _loadEvents,
        backgroundColor: Colors.teal,
        child: const Icon(Icons.refresh),
      ),
    );
  }
}
