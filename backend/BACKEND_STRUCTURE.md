# Crowd Management System Backend - Complete Structure

## 📁 Project Structure

```
backend/
├── main.py                      # Main FastAPI application
├── models.py                    # Pydantic models for data validation
├── database.py                  # MongoDB connection and indexes
├── config.py                    # Configuration settings
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── start.sh                     # Startup script
├── README.md                    # Comprehensive documentation
├── API_TESTING.md              # API testing examples
├── FRONTEND_INTEGRATION.md     # Frontend integration guide
│
└── routes/                      # API route handlers
    ├── auth.py                  # Authentication & user management
    ├── events.py                # Event management
    ├── crowd_density.py         # Crowd density monitoring
    ├── medical_emergencies.py   # Medical emergency handling
    ├── lost_person.py           # Lost person reports
    ├── feedback.py              # Feedback management
    ├── facilities.py            # Facility management
    └── alerts.py                # Alert & weather systems
```

## 🎯 Key Features Implemented

### 1. **Authentication & User Management** (`routes/auth.py`)
- User registration with role-based access
- User login with password hashing
- User retrieval by ID and role filtering
- Roles: public, organizer, medical, police

### 2. **Event Management** (`routes/events.py`)
- Create events with multiple areas/zones
- Update event details
- Change event status (upcoming → live → completed)
- Filter events by organizer and status
- Delete events

### 3. **Crowd Density Monitoring** (`routes/crowd_density.py`)
- Real-time crowd counting per area
- Automatic density calculation (people per m²)
- Density classification: Safe, Moderate, Risky, Overcrowded
- Latest density tracking for each area
- Historical density records

### 4. **Medical Emergency System** (`routes/medical_emergencies.py`)
- Report emergencies with severity levels
- Emergency types: injury, illness, heatstroke, cardiac, other
- Status tracking: reported → dispatched → on scene → transported → resolved
- Responder assignment
- Response time tracking
- Emergency statistics and analytics

### 5. **Lost Person Reports** (`routes/lost_person.py`)
- Report missing persons with detailed information
- Priority calculation (children & elderly = critical)
- Status updates: reported → searching → found → resolved
- Active case filtering
- Reporter contact information
- Statistics by event

### 6. **Feedback System** (`routes/feedback.py`)
- Star ratings (1-5)
- Text comments
- AI sentiment analysis (positive/neutral/negative)
- Feedback statistics and analytics
- Rating distribution
- Recent feedback retrieval

### 7. **Facility Management** (`routes/facilities.py`)
- Manage facilities: washrooms, medical centers, food courts, emergency exits
- Availability tracking
- Location-based search
- Nearby facility finder (with distance calculation)
- Update facility details

### 8. **Alert System** (`routes/alerts.py`)
- Create custom alerts (warning, emergency, info, weather)
- Severity levels: low, medium, high, critical
- Active/inactive status
- Weather alerts with temperature, humidity, wind
- Latest weather conditions per event

## 🗄️ Database Collections

All collections use MongoDB with proper indexing for performance:

1. **users** - User accounts and authentication
2. **events** - Event information with areas
3. **crowd_density** - Crowd measurements and calculations
4. **medical_emergencies** - Emergency reports and responses
5. **lost_persons** - Missing person reports
6. **feedback** - User feedback and ratings
7. **facilities** - Facility locations and availability
8. **alerts** - Alert notifications
9. **weather_alerts** - Weather condition updates

## 🔧 Technical Implementation

### Data Validation
- All models use Pydantic for automatic validation
- Type checking for all fields
- Custom validators for business logic
- Comprehensive error messages

### Database Design
- Automatic index creation on startup
- Unique constraints on IDs and emails
- Compound indexes for common queries
- Optimized for read-heavy workloads

### API Design
- RESTful endpoints
- Proper HTTP status codes
- Comprehensive error handling
- Async/await for non-blocking operations
- CORS enabled for frontend integration

### ID Generation
- Unique prefixed IDs for each entity type:
  - USR (Users)
  - EVT (Events)
  - CD (Crowd Density)
  - MED (Medical Emergencies)
  - LP (Lost Persons)
  - FB (Feedback)
  - FAC (Facilities)
  - ALT (Alerts)
  - WA (Weather Alerts)

## 📊 Data Flow

```
Frontend Request
    ↓
FastAPI Router
    ↓
Pydantic Validation
    ↓
Business Logic
    ↓
MongoDB (via Motor)
    ↓
Response Model
    ↓
JSON Response
```

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB**
   ```bash
   mongod
   ```

4. **Run Application**
   ```bash
   ./start.sh
   # OR
   uvicorn main:app --reload
   ```

5. **Access API Documentation**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## 🔐 Security Features

- Password hashing (SHA-256, upgrade to bcrypt for production)
- Email validation
- Input sanitization via Pydantic
- CORS configuration
- Environment variable management
- Unique ID generation

## 📈 Analytics & Statistics

Each module provides statistics endpoints:
- Medical emergencies: by severity, status, type
- Lost persons: by status, priority
- Feedback: average ratings, sentiment distribution
- Crowd density: real-time area analysis

## 🌐 CORS Configuration

Currently set to allow all origins for development. Update in production:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📝 API Response Format

All responses follow consistent patterns:

**Success (Single Item)**
```json
{
  "id": "EVT123ABC",
  "name": "Summer Festival",
  ...
}
```

**Success (List)**
```json
[
  { "id": "EVT123ABC", ... },
  { "id": "EVT456DEF", ... }
]
```

**Error**
```json
{
  "detail": "Error message description"
}
```

## 🔄 Status Workflows

### Event Status
upcoming → live → completed

### Medical Emergency Status
reported → responder_dispatched → on_scene → transported → resolved

### Lost Person Status
reported → searching → found → resolved

## 🎨 Frontend Integration

The backend is designed to work seamlessly with:
- React/TypeScript frontend
- Real-time updates via polling (WebSocket ready)
- RESTful API consumption
- Type-safe TypeScript interfaces

See `FRONTEND_INTEGRATION.md` for detailed integration guide.

## 📚 Documentation Files

1. **README.md** - Complete backend documentation
2. **API_TESTING.md** - cURL examples for all endpoints
3. **FRONTEND_INTEGRATION.md** - TypeScript/React integration guide
4. **.env.example** - Environment configuration template

## 🧪 Testing

Example API calls are provided in `API_TESTING.md`. Use:
- cURL commands
- Swagger UI (/docs)
- Postman/Insomnia
- Frontend application

## 🚧 Future Enhancements

1. JWT authentication tokens
2. WebSocket for real-time updates
3. Rate limiting
4. Caching layer (Redis)
5. File upload for lost person photos
6. Email notifications
7. SMS alerts
8. Advanced analytics dashboard
9. Machine learning for crowd prediction
10. Geospatial queries optimization

## 📞 Support

For issues or questions:
1. Check API documentation at /docs
2. Review example API calls in API_TESTING.md
3. Verify environment configuration
4. Check MongoDB connection
5. Review logs for errors

---

**Built with FastAPI, MongoDB, and ❤️ for efficient crowd management**
