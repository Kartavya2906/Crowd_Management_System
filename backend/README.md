# Crowd Management System - Backend API

A comprehensive FastAPI backend for managing crowds, events, emergencies, and facilities at large gatherings.

## Features

### 🎫 Event Management
- Create, update, and manage events
- Define event areas and zones
- Track event status (upcoming, live, completed)

### 👥 Crowd Density Monitoring
- Real-time crowd density tracking
- Automatic density level classification (Safe, Moderate, Risky, Overcrowded)
- Area-wise crowd analysis
- Density calculations per square meter

### 🚑 Medical Emergency Management
- Report and track medical emergencies
- Severity classification (minor, moderate, severe, critical)
- Emergency type tracking (injury, illness, heatstroke, cardiac, other)
- Responder assignment and response time tracking
- Status updates (reported, dispatched, on scene, transported, resolved)

### 🧒 Lost Person Reports
- Report missing persons
- Priority-based tracking (critical for children/elderly)
- Status management (reported, searching, found, resolved)
- Contact information for reporters

### 💬 Feedback System
- Event feedback collection
- Rating system (1-5 stars)
- AI-powered sentiment analysis
- Feedback statistics and analytics

### 🏨 Facility Management
- Manage facilities (washrooms, hotels, medical centers, food courts, emergency exits)
- Availability tracking
- Location-based facility search
- Nearby facility finder

### 🚨 Alert System
- Create and manage event alerts
- Alert types (warning, emergency, info, weather)
- Severity levels (low, medium, high, critical)
- Weather alerts with real-time conditions

### 👤 User Authentication
- User registration and login
- Role-based access (public, organizer, medical, police)
- User profile management

## Tech Stack

- **FastAPI** - Modern, fast web framework
- **MongoDB** - NoSQL database via Motor (async driver)
- **Pydantic** - Data validation
- **Python 3.8+** - Programming language

## Installation

### Prerequisites
- Python 3.8 or higher
- MongoDB 4.0 or higher

### Setup

1. **Clone the repository**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` file:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=crowd_management_system
HOST=0.0.0.0
PORT=8000
```

5. **Start MongoDB**
```bash
# Make sure MongoDB is running
mongod
```

6. **Run the application**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs
- Alternative Docs: http://localhost:8000/redoc

## API Endpoints

### Authentication & Users
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/users` - Get all users
- `GET /auth/users/{user_id}` - Get user by ID

### Events
- `POST /events/` - Create event
- `GET /events/` - Get all events
- `GET /events/{event_id}` - Get event by ID
- `PUT /events/{event_id}` - Update event
- `PATCH /events/{event_id}/status` - Update event status
- `DELETE /events/{event_id}` - Delete event

### Crowd Density
- `POST /crowd-density/` - Create density record
- `GET /crowd-density/` - Get all density records
- `GET /crowd-density/{density_id}` - Get density by ID
- `GET /crowd-density/event/{event_id}/latest` - Get latest density for event
- `GET /crowd-density/event/{event_id}/areas` - Get current density for all areas

### Medical Emergencies
- `POST /medical-emergencies/` - Report emergency
- `GET /medical-emergencies/` - Get all emergencies
- `GET /medical-emergencies/{emergency_id}` - Get emergency by ID
- `PATCH /medical-emergencies/{emergency_id}/status` - Update status
- `GET /medical-emergencies/stats/event/{event_id}` - Get emergency statistics

### Lost Persons
- `POST /lost-persons/` - Report lost person
- `GET /lost-persons/` - Get all reports
- `GET /lost-persons/{report_id}` - Get report by ID
- `PATCH /lost-persons/{report_id}/status` - Update status
- `GET /lost-persons/search/active` - Get active reports
- `GET /lost-persons/stats/event/{event_id}` - Get statistics

### Feedback
- `POST /feedback/` - Submit feedback
- `GET /feedback/` - Get all feedback
- `GET /feedback/{feedback_id}` - Get feedback by ID
- `GET /feedback/event/{event_id}/stats` - Get feedback statistics
- `GET /feedback/event/{event_id}/recent` - Get recent feedback

### Facilities
- `POST /facilities/` - Create facility
- `GET /facilities/` - Get all facilities
- `GET /facilities/{facility_id}` - Get facility by ID
- `PATCH /facilities/{facility_id}/availability` - Update availability
- `PUT /facilities/{facility_id}` - Update facility
- `DELETE /facilities/{facility_id}` - Delete facility
- `GET /facilities/nearby/search` - Find nearby facilities

### Alerts
- `POST /alerts/` - Create alert
- `GET /alerts/` - Get all alerts
- `GET /alerts/{alert_id}` - Get alert by ID
- `PATCH /alerts/{alert_id}/deactivate` - Deactivate alert
- `DELETE /alerts/{alert_id}` - Delete alert
- `POST /alerts/weather` - Create weather alert
- `GET /alerts/weather` - Get weather alerts
- `GET /alerts/weather/{alert_id}` - Get weather alert by ID
- `GET /alerts/weather/event/{event_id}/latest` - Get latest weather alert

## Database Collections

- **users** - User accounts and authentication
- **events** - Event information and areas
- **crowd_density** - Crowd density measurements
- **medical_emergencies** - Medical emergency reports
- **lost_persons** - Lost person reports
- **feedback** - User feedback and ratings
- **facilities** - Facility information
- **alerts** - Alert notifications
- **weather_alerts** - Weather condition alerts

## Data Models

All models use Pydantic for validation and include:
- Automatic ID generation
- Timestamp tracking
- Status management
- Comprehensive validation rules

See `models.py` for detailed schema definitions.

## Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
black .
```

### Linting
```bash
flake8 .
```

## Production Deployment

1. Set secure environment variables
2. Use production MongoDB instance
3. Configure proper CORS origins
4. Use HTTPS/SSL
5. Implement rate limiting
6. Add authentication tokens (JWT)
7. Enable logging and monitoring

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## License

MIT License

## Support

For issues and questions, please create an issue in the repository.
