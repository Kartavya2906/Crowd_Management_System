# 🚀 Quick Reference Card - Crowd Management System Backend

## ⚡ Start Server
```bash
cd backend
./start.sh
# OR
uvicorn main:app --reload
```

## 📚 Access Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health: http://localhost:8000/health

## 🔑 Common API Calls

### Users
```bash
# Register
POST /auth/register
{"name": "John", "email": "john@mail.com", "password": "pass123", "role": "organizer"}

# Login
POST /auth/login
{"email": "john@mail.com", "password": "pass123"}
```

### Events
```bash
# Create Event
POST /events/
{"name": "Festival", "start_time": "2025-11-15T18:00:00", "location": "Park", "capacity": 5000, "organizer_id": "USR123"}

# Get Events
GET /events/?status=live

# Update Status
PATCH /events/{id}/status?status=live
```

### Crowd Density
```bash
# Report Density
POST /crowd-density/
{"event_id": "EVT123", "area_name": "Main Stage", "person_count": 850, "radius_m": 50, "location": {"lat": 28.6139, "lon": 77.2090}}

# Get Areas Density
GET /crowd-density/event/{event_id}/areas
```

### Medical Emergencies
```bash
# Report Emergency
POST /medical-emergencies/
{"user_id": "USR123", "emergency_type": "heatstroke", "severity": "severe", "patient_name": "Jane", "patient_age": 45, "description": "Dizziness", "location": "Stage Front"}

# Update Status
PATCH /medical-emergencies/{id}/status?new_status=on_scene&responder_name=Dr.Smith&response_time=4
```

### Lost Persons
```bash
# Report Lost Person
POST /lost-persons/
{"reporter_id": "USR123", "reporter_name": "Sarah", "reporter_contact": "+1555012345", "person_name": "Emma", "age": 7, "gender": "female", "last_seen_location": "Entrance", "last_seen_time": "14:30"}

# Get Active Reports
GET /lost-persons/search/active?event_id=EVT123
```

### Feedback
```bash
# Submit Feedback
POST /feedback/
{"user_id": "USR123", "event_id": "EVT123", "rating": 5, "comments": "Great event!"}

# Get Stats
GET /feedback/event/{event_id}/stats
```

### Facilities
```bash
# Create Facility
POST /facilities/
{"type": "medical_center", "name": "First Aid 1", "location": {"lat": 28.6140, "lon": 77.2092}, "available": true}

# Find Nearby
GET /facilities/nearby/search?lat=28.6139&lon=77.2090&facility_type=medical_center&max_distance_km=1.0
```

### Alerts
```bash
# Create Alert
POST /alerts/
{"event_id": "EVT123", "title": "Warning", "message": "High density", "alert_type": "warning", "severity": "high"}

# Create Weather Alert
POST /alerts/weather
{"event_id": "EVT123", "temperature": 35.5, "humidity": 75, "condition": "Hot"}
```

## 📊 Status Values

### Event Status
`upcoming` → `live` → `completed`

### Emergency Status
`reported` → `responder_dispatched` → `on_scene` → `transported` → `resolved`

### Lost Person Status
`reported` → `searching` → `found` → `resolved`

### Density Levels
`Safe` (≤0.5/m²) | `Moderate` (≤2/m²) | `Risky` (≤4/m²) | `Overcrowded` (>4/m²)

### Priority Levels
`low` | `medium` | `high` | `critical`

### Severity Levels
`minor` | `moderate` | `severe` | `critical`

## 🔧 Environment Variables
```bash
MONGO_URL=mongodb://localhost:27017
DB_NAME=crowd_management_system
HOST=0.0.0.0
PORT=8000
```

## 📦 Collections
- users
- events
- crowd_density
- medical_emergencies
- lost_persons
- feedback
- facilities
- alerts
- weather_alerts

## 🆔 ID Prefixes
- USR - Users
- EVT - Events
- CD - Crowd Density
- MED - Medical Emergencies
- LP - Lost Persons
- FB - Feedback
- FAC - Facilities
- ALT - Alerts
- WA - Weather Alerts

## 🛠️ Troubleshooting

### Server won't start
```bash
# Check MongoDB
mongod --version
# Start MongoDB
mongod

# Check dependencies
pip list | grep fastapi
# Install dependencies
pip install -r requirements.txt

# Check port
lsof -i :8000
```

### Database connection error
```bash
# Verify MongoDB is running
ps aux | grep mongod

# Check .env file
cat .env

# Test connection
mongo
```

### Import errors
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Verify Python version
python --version  # Need 3.8+
```

## 📝 Useful Commands

```bash
# Verify setup
python verify_setup.py

# View logs
tail -f logs/api.log

# Check MongoDB collections
mongo
> use crowd_management_system
> show collections

# Clear collection
> db.events.deleteMany({})

# Count documents
> db.users.countDocuments()
```

## 🎯 Testing Checklist
- [ ] Create user
- [ ] Login user
- [ ] Create event
- [ ] Add crowd density
- [ ] Report emergency
- [ ] Report lost person
- [ ] Submit feedback
- [ ] Create facility
- [ ] Create alert
- [ ] Check statistics

## 📞 Quick Links
- Main Docs: README.md
- API Testing: API_TESTING.md
- Frontend Integration: FRONTEND_INTEGRATION.md
- Architecture: BACKEND_STRUCTURE.md
- Implementation Summary: IMPLEMENTATION_SUMMARY.md

## ⚡ Pro Tips
1. Use Swagger UI for interactive testing
2. Check response codes (200, 201, 400, 404)
3. Filter queries with URL parameters
4. Use unique IDs from responses
5. Check statistics endpoints for analytics
6. Monitor density levels for alerts
7. Assign priorities to emergencies
8. Track response times
9. Update statuses progressively
10. Use sentiment analysis for feedback insights

---
**Need help?** Check http://localhost:8000/docs when server is running!
