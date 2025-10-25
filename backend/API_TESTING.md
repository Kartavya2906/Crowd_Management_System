# API Testing Guide

This guide provides example API calls for testing the Crowd Management System backend.

## Base URL
```
http://localhost:8000
```

## Authentication & Users

### 1. Register a New User
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "organizer",
    "password": "securepassword123"
  }'
```

### 2. Login
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### 3. Get All Users
```bash
curl -X GET "http://localhost:8000/auth/users"
```

## Events

### 1. Create Event
```bash
curl -X POST "http://localhost:8000/events/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Summer Music Festival",
    "description": "Annual outdoor music festival",
    "start_time": "2025-11-15T18:00:00",
    "end_time": "2025-11-15T23:00:00",
    "location": "Central Park",
    "capacity": 5000,
    "organizer_id": "USR123ABC",
    "areas": [
      {
        "name": "Main Stage",
        "location": {"lat": 28.6139, "lon": 77.2090},
        "radius_m": 50
      },
      {
        "name": "Food Court",
        "location": {"lat": 28.6145, "lon": 77.2095},
        "radius_m": 30
      }
    ]
  }'
```

### 2. Get All Events
```bash
curl -X GET "http://localhost:8000/events/"
```

### 3. Get Event by ID
```bash
curl -X GET "http://localhost:8000/events/EVT123ABC"
```

### 4. Update Event Status
```bash
curl -X PATCH "http://localhost:8000/events/EVT123ABC/status?status=live"
```

## Crowd Density

### 1. Create Density Record
```bash
curl -X POST "http://localhost:8000/crowd-density/" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "EVT123ABC",
    "area_name": "Main Stage",
    "location": {"lat": 28.6139, "lon": 77.2090},
    "radius_m": 50,
    "person_count": 850
  }'
```

### 2. Get Density Records by Event
```bash
curl -X GET "http://localhost:8000/crowd-density/?event_id=EVT123ABC"
```

### 3. Get Latest Density for Event
```bash
curl -X GET "http://localhost:8000/crowd-density/event/EVT123ABC/latest?limit=10"
```

### 4. Get Current Density for All Areas
```bash
curl -X GET "http://localhost:8000/crowd-density/event/EVT123ABC/areas"
```

## Medical Emergencies

### 1. Report Medical Emergency
```bash
curl -X POST "http://localhost:8000/medical-emergencies/" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "USR456DEF",
    "event_id": "EVT123ABC",
    "emergency_type": "heatstroke",
    "severity": "severe",
    "patient_name": "Jane Smith",
    "patient_age": 45,
    "description": "Patient experiencing dizziness and excessive sweating",
    "location": "Stage Front - Section B"
  }'
```

### 2. Get All Emergencies
```bash
curl -X GET "http://localhost:8000/medical-emergencies/"
```

### 3. Filter by Status
```bash
curl -X GET "http://localhost:8000/medical-emergencies/?status=reported&severity=critical"
```

### 4. Update Emergency Status
```bash
curl -X PATCH "http://localhost:8000/medical-emergencies/MED789GHI/status?new_status=on_scene&responder_name=Dr.%20Sarah%20Williams&response_time=4"
```

### 5. Get Emergency Statistics
```bash
curl -X GET "http://localhost:8000/medical-emergencies/stats/event/EVT123ABC"
```

## Lost Persons

### 1. Report Lost Person
```bash
curl -X POST "http://localhost:8000/lost-persons/" \
  -H "Content-Type: application/json" \
  -d '{
    "reporter_id": "USR456DEF",
    "reporter_name": "Sarah Johnson",
    "reporter_contact": "+1555012345",
    "person_name": "Emma Johnson",
    "age": 7,
    "gender": "female",
    "description": "White t-shirt, blue jeans, brown hair in pigtails",
    "last_seen_location": "Main Entrance",
    "last_seen_time": "14:30",
    "event_id": "EVT123ABC"
  }'
```

### 2. Get All Reports
```bash
curl -X GET "http://localhost:8000/lost-persons/"
```

### 3. Get Active Reports
```bash
curl -X GET "http://localhost:8000/lost-persons/search/active?event_id=EVT123ABC"
```

### 4. Update Report Status
```bash
curl -X PATCH "http://localhost:8000/lost-persons/LP123ABC/status?new_status=found"
```

### 5. Get Statistics
```bash
curl -X GET "http://localhost:8000/lost-persons/stats/event/EVT123ABC"
```

## Feedback

### 1. Submit Feedback
```bash
curl -X POST "http://localhost:8000/feedback/" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "USR456DEF",
    "event_id": "EVT123ABC",
    "rating": 5,
    "comments": "Great event! Well organized and safety measures were excellent."
  }'
```

### 2. Get Event Feedback
```bash
curl -X GET "http://localhost:8000/feedback/?event_id=EVT123ABC"
```

### 3. Get Feedback Statistics
```bash
curl -X GET "http://localhost:8000/feedback/event/EVT123ABC/stats"
```

### 4. Get Recent Feedback
```bash
curl -X GET "http://localhost:8000/feedback/event/EVT123ABC/recent?limit=10"
```

## Facilities

### 1. Create Facility
```bash
curl -X POST "http://localhost:8000/facilities/" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "medical_center",
    "name": "First Aid Station 1",
    "location": {"lat": 28.6140, "lon": 77.2092},
    "contact": "+1555098765",
    "available": true,
    "event_id": "EVT123ABC"
  }'
```

### 2. Get All Facilities
```bash
curl -X GET "http://localhost:8000/facilities/?event_id=EVT123ABC"
```

### 3. Find Nearby Facilities
```bash
curl -X GET "http://localhost:8000/facilities/nearby/search?lat=28.6139&lon=77.2090&facility_type=medical_center&max_distance_km=1.0"
```

### 4. Update Availability
```bash
curl -X PATCH "http://localhost:8000/facilities/FAC123ABC/availability?available=false"
```

## Alerts

### 1. Create Alert
```bash
curl -X POST "http://localhost:8000/alerts/" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "EVT123ABC",
    "title": "Crowd Surge Warning",
    "message": "High density detected at Main Stage. Please move to alternate areas.",
    "alert_type": "warning",
    "severity": "high"
  }'
```

### 2. Get Active Alerts
```bash
curl -X GET "http://localhost:8000/alerts/?event_id=EVT123ABC&is_active=true"
```

### 3. Create Weather Alert
```bash
curl -X POST "http://localhost:8000/alerts/weather" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "EVT123ABC",
    "temperature": 35.5,
    "humidity": 75,
    "condition": "Hot and Humid",
    "wind_speed": 15.5,
    "description": "High heat index. Stay hydrated."
  }'
```

### 4. Get Latest Weather Alert
```bash
curl -X GET "http://localhost:8000/alerts/weather/event/EVT123ABC/latest"
```

### 5. Deactivate Alert
```bash
curl -X PATCH "http://localhost:8000/alerts/ALT123ABC/deactivate"
```

## Health Check

### Check API Health
```bash
curl -X GET "http://localhost:8000/health"
```

## Using Swagger UI

For interactive API testing, visit:
```
http://localhost:8000/docs
```

This provides a web interface to test all endpoints with automatic request/response formatting.

## Response Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

## Notes

1. Replace placeholder IDs (USR123ABC, EVT123ABC, etc.) with actual IDs from your database
2. All timestamps should be in ISO 8601 format
3. Coordinates (lat, lon) should be valid decimal degrees
4. Status updates must use valid status values as defined in models
5. Use URL encoding for query parameters with special characters
