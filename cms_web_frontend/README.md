# Crowd Management System - Organizer Portal

A comprehensive web application for event organizers to manage crowd safety, track lost persons, coordinate medical facilities, and monitor emergency exits during large-scale events.

## Features

### 1. Authentication
- Secure login system for event organizers
- Demo credentials: `admin123` / `password123`

### 2. Events Management
- Create and manage multiple events
- Track event details (location, date, attendees)
- View event status and statistics

### 3. Zone Management Dashboard
- Add zones with capacity limits
- Upload images for AI-based crowd density analysis
- Real-time crowd density classification:
  - **Low**: < 1 person/m²
  - **Moderate**: 1-2 persons/m²
  - **Crowded**: > 2 persons/m²

### 4. Lost Persons Tracking
- View reported lost person cases
- Track missing/found status
- Display reporter contact information
- Search and filter by event
- Statistics: Total cases, Missing, Found

### 5. Medical Facilities Management
- Add hospitals, clinics, and first-aid stations
- Store contact numbers and addresses
- Quick access to emergency medical contacts

### 6. Emergency Exits Management
- Add and track emergency exits
- Real-time status updates (Clear/Moderate/Crowded)
- Manual status updates based on CCTV monitoring

### 7. Feedback Analysis
- View user feedback from mobile app
- Category-based analysis (General, Safety, Navigation, Facilities, Emergency)
- Overall rating and safety rating metrics
- Rating distribution visualization
- Detailed feedback comments

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Build Tool**: Vite

## Setup Instructions

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Configure Supabase
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Update `.env` file with your Supabase credentials:
\`\`\`
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 3. Database Setup
The database schema includes the following tables:
- `organizers` - Event organizer accounts
- `events` - Event information
- `zones` - Event zones with crowd density data
- `lost_persons` - Lost person reports
- `medical_facilities` - Medical facility contacts
- `emergency_exits` - Emergency exit status
- `feedback` - User feedback data

The migration includes dummy data for testing.

### 4. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

### 5. Build for Production
\`\`\`bash
npm run build
\`\`\`

## Usage

### Login
1. Navigate to the login page
2. Enter credentials (demo: admin123 / password123)
3. Access the organizer dashboard

### Managing Events
1. Click "Add Event" to create a new event
2. Fill in event details (name, location, date, expected attendees)
3. Click on an event card to view its dashboard

### Adding Zones
1. Open an event dashboard
2. Click "Add Zone"
3. Enter zone name, capacity, and optional image URL
4. AI will automatically classify crowd density

### Monitoring Lost Persons
1. Navigate to "Lost Persons" page
2. Filter by event to view reports
3. Mark persons as found when located
4. View reporter contact information

### Managing Medical Facilities
1. Navigate to "Medical" page
2. Select an event
3. Add hospitals, clinics, or first-aid stations
4. Include contact numbers for emergency use

### Updating Emergency Exits
1. Navigate to "Emergency Exits" page
2. Select an event
3. Add exits with location details
4. Update status (Clear/Moderate/Crowded) based on CCTV monitoring

### Analyzing Feedback
1. Navigate to "Feedback" page
2. Select an event
3. View overall ratings and category breakdowns
4. Analyze rating distribution and comments

## Design Features

- Modern gradient-based UI with glassmorphism effects
- Dark theme optimized for professional use
- Responsive design for desktop and tablet devices
- Real-time status indicators with color coding
- Interactive charts and statistics
- Smooth transitions and hover effects

## Security

- Row Level Security (RLS) enabled on all tables
- Authentication required for all operations
- Secure password storage (in production, use proper hashing)

## Future Enhancements

- Real-time WebSocket updates for live data
- Integration with actual AI crowd density models
- Mobile app for attendees
- SMS/Push notifications for emergencies
- Weather API integration
- Google Maps integration for venue mapping
- Multi-language support
- Advanced analytics and reports export

## License

MIT License
