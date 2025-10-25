# Crowd Management System - API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Events](#events)
5. [Crowd Density](#crowd-density)
6. [Medical Emergencies](#medical-emergencies)
7. [Lost Persons](#lost-persons)
8. [Feedback](#feedback)
9. [Facilities](#facilities)
10. [Alerts](#alerts)
11. [System](#system)

---

## Overview

The Crowd Management System API provides endpoints for managing events, monitoring crowd density, handling emergencies, tracking lost persons, managing facilities, and sending alerts. This RESTful API supports multiple user roles: public, organizer, medical, and police.

## Base URL

```
http://127.0.0.1:8000
```

---

## Authentication

### Register User

**Endpoint:** `POST /auth/register`

**Description:** Register a new user with specified role.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "role": "public|organizer|medical|police",
  "password": "string",
  "location": {
    "lat": 0.0,
    "lon": 0.0
  }
}
```

**Note:** Location field is optional and primarily used for organizer role.

**Example - Public User:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "role": "public",
  "password": "securepass123"
}
```

**Example - Organizer:**
```json
{
  "name": "Sarah Johnson",
  "email": "sarah.johnson@eventmanager.com",
  "phone": "+1555123456",
  "role": "organizer",
  "password": "organizer2024",
  "location": {
    "lat": 28.6139,
    "lon": 77.2090
  }
}
```

### Login User

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

### Get All Users

**Endpoint:** `GET /auth/users`

**Query Parameters:**
- `role` (optional): Filter by user role

### Get User by ID

**Endpoint:** `GET /auth/users/{user_id}`

**Path Parameters:**
- `user_id`: User identifier

---

## Events

### Create Event

**Endpoint:** `POST /events/`

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "start_time": "ISO 8601 datetime",
  "end_time": "ISO 8601 datetime",
  "location": "string",
  "capacity": 0,
  "organizer_id": "string",
  "areas": [
    {
      "name": "string",
      "location": {
        "lat": 0.0,
        "lon": 0.0
      },
      "radius_m": 0
    }
  ]
}
```

**Example:**
```json
{
  "name": "Summer Music Festival",
  "description": "Annual outdoor music festival",
  "start_time": "2025-11-15T18:00:00",
  "end_time": "2025-11-15T23:00:00",
  "location": "Central Park",
  "capacity": 5000,
  "organizer_id": "org123",
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
}
```

### Get All Events

**Endpoint:** `GET /events/`

**Query Parameters:**
- `status` (optional): Filter by event status (scheduled, live, completed, cancelled)
- `organizer_id` (optional): Filter by organizer

### Get Event by ID

**Endpoint:** `GET /events/{event_id}`

### Update Event

**Endpoint:** `PUT /events/{event_id}`

**Request Body:** Same as Create Event

### Update Event Status

**Endpoint:** `PATCH /events/{event_id}/status`

**Query Parameters:**
- `status`: New status (live, completed, cancelled)

**Example:**
```
PATCH /events/evt123/status?status=live
```

### Delete Event

**Endpoint:** `DELETE /events/{event_id}`

---

## Crowd Density

### Create Density Record

**Endpoint:** `POST /crowd-density/`

**Request Body:**
```json
{
  "event_id": "string",
  "area_name": "string",
  "location": {
    "lat": 0.0,
    "lon": 0.0
  },
  "radius_m": 0,
  "person_count": 0
}
```

**Example:**
```json
{
  "event_id": "evt123",
  "area_name": "Main Stage",
  "location": {"lat": 28.6139, "lon": 77.2090},
  "radius_m": 50,
  "person_count": 850
}
```

**Note:** Density level is automatically calculated based on person count and area.

### Get All Density Records

**Endpoint:** `GET /crowd-density/`

**Query Parameters:**
- `event_id` (optional): Filter by event
- `area_name` (optional): Filter by area name
- `density_level` (optional): Filter by level (Safe, Moderate, Risky, Dangerous)

### Get Density Record by ID

**Endpoint:** `GET /crowd-density/{density_id}`

### Get Latest Density for Event

**Endpoint:** `GET /crowd-density/event/{event_id}/latest`

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 10)

### Get Current Density for All Areas

**Endpoint:** `GET /crowd-density/event/{event_id}/areas`

**Description:** Returns the most recent density record for each area in the event.

---

## Medical Emergencies

### Report Emergency

**Endpoint:** `POST /medical-emergencies/`

**Request Body:**
```json
{
  "user_id": "string",
  "event_id": "string",
  "emergency_type": "heatstroke|injury|cardiac|other",
  "severity": "minor|moderate|severe|critical",
  "patient_name": "string",
  "patient_age": 0,
  "description": "string",
  "location": "string"
}
```

**Example:**
```json
{
  "user_id": "usr123",
  "event_id": "evt123",
  "emergency_type": "heatstroke",
  "severity": "severe",
  "patient_name": "John Davis",
  "patient_age": 45,
  "description": "Patient experiencing dizziness, nausea, and excessive sweating",
  "location": "Stage Front - Section B"
}
```

### Get All Emergencies

**Endpoint:** `GET /medical-emergencies/`

**Query Parameters:**
- `event_id` (optional): Filter by event
- `status` (optional): Filter by status (reported, responder_dispatched, on_scene, resolved)
- `severity` (optional): Filter by severity

### Get Emergency by ID

**Endpoint:** `GET /medical-emergencies/{emergency_id}`

### Update Emergency Status

**Endpoint:** `PATCH /medical-emergencies/{emergency_id}/status`

**Query Parameters:**
- `new_status`: New status value
- `responder_name` (optional): Name of responding medical personnel
- `response_time` (optional): Response time in minutes

**Examples:**
```
PATCH /medical-emergencies/em123/status?new_status=responder_dispatched&responder_name=Dr. Sarah Williams

PATCH /medical-emergencies/em123/status?new_status=on_scene&response_time=4

PATCH /medical-emergencies/em123/status?new_status=resolved
```

### Get Emergency Statistics

**Endpoint:** `GET /medical-emergencies/stats/event/{event_id}`

**Description:** Returns statistics including total emergencies, count by severity, count by status, and average response time.

---

## Lost Persons

### Report Lost Person

**Endpoint:** `POST /lost-persons/`

**Request Body:**
```json
{
  "reporter_id": "string",
  "reporter_name": "string",
  "reporter_contact": "string",
  "person_name": "string",
  "age": 0,
  "gender": "male|female|other",
  "description": "string",
  "last_seen_location": "string",
  "last_seen_time": "string",
  "event_id": "string"
}
```

**Example:**
```json
{
  "reporter_id": "usr123",
  "reporter_name": "Sarah Johnson",
  "reporter_contact": "+1555012345",
  "person_name": "Emma Johnson",
  "age": 7,
  "gender": "female",
  "description": "White t-shirt with blue jeans, brown hair in pigtails",
  "last_seen_location": "Main Entrance",
  "last_seen_time": "14:30",
  "event_id": "evt123"
}
```

**Note:** Priority is automatically assigned based on age (critical for children under 12 and elderly over 65).

### Get All Lost Person Reports

**Endpoint:** `GET /lost-persons/`

**Query Parameters:**
- `event_id` (optional): Filter by event
- `status` (optional): Filter by status (reported, searching, found)
- `priority` (optional): Filter by priority (critical, high, medium)

### Get Report by ID

**Endpoint:** `GET /lost-persons/{report_id}`

### Update Report Status

**Endpoint:** `PATCH /lost-persons/{report_id}/status`

**Query Parameters:**
- `new_status`: New status (searching, found)

### Get Active Reports

**Endpoint:** `GET /lost-persons/search/active`

**Query Parameters:**
- `event_id` (optional): Filter by event

**Description:** Returns all reports with status "reported" or "searching".

### Get Statistics

**Endpoint:** `GET /lost-persons/stats/event/{event_id}`

**Description:** Returns total reports, count by status, and count by priority.

---

## Feedback

### Submit Feedback

**Endpoint:** `POST /feedback/`

**Request Body:**
```json
{
  "user_id": "string",
  "event_id": "string",
  "rating": 1-5,
  "comments": "string (optional)"
}
```

**Example:**
```json
{
  "user_id": "usr123",
  "event_id": "evt123",
  "rating": 5,
  "comments": "Great event! Well organized and safety measures were excellent"
}
```

**Note:** Sentiment is automatically analyzed from comments (positive, neutral, negative).

### Get All Feedback

**Endpoint:** `GET /feedback/`

**Query Parameters:**
- `event_id` (optional): Filter by event
- `user_id` (optional): Filter by user
- `min_rating` (optional): Filter by minimum rating (1-5)
- `sentiment` (optional): Filter by sentiment (positive, neutral, negative)

### Get Feedback by ID

**Endpoint:** `GET /feedback/{feedback_id}`

### Get Feedback Statistics

**Endpoint:** `GET /feedback/event/{event_id}/stats`

**Description:** Returns total feedback count, average rating, and sentiment distribution.

### Get Recent Feedback

**Endpoint:** `GET /feedback/event/{event_id}/recent`

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 10)

---

## Facilities

### Create Facility

**Endpoint:** `POST /facilities/`

**Request Body:**
```json
{
  "type": "medical_center|washroom|food_court|emergency_exit|parking",
  "name": "string",
  "location": {
    "lat": 0.0,
    "lon": 0.0
  },
  "contact": "string (optional)",
  "available": true,
  "event_id": "string"
}
```

**Example:**
```json
{
  "type": "medical_center",
  "name": "First Aid Station 1",
  "location": {"lat": 28.6140, "lon": 77.2092},
  "contact": "+1555098765",
  "available": true,
  "event_id": "evt123"
}
```

### Get All Facilities

**Endpoint:** `GET /facilities/`

**Query Parameters:**
- `event_id` (optional): Filter by event
- `facility_type` (optional): Filter by type
- `available` (optional): Filter by availability (true/false)

### Get Facility by ID

**Endpoint:** `GET /facilities/{facility_id}`

### Update Facility

**Endpoint:** `PUT /facilities/{facility_id}`

**Request Body:** Same as Create Facility

### Update Facility Availability

**Endpoint:** `PATCH /facilities/{facility_id}/availability`

**Query Parameters:**
- `available`: Availability status (true/false)

**Example:**
```
PATCH /facilities/fac123/availability?available=false
```

### Delete Facility

**Endpoint:** `DELETE /facilities/{facility_id}`

### Find Nearby Facilities

**Endpoint:** `GET /facilities/nearby/search`

**Query Parameters:**
- `lat`: Latitude
- `lon`: Longitude
- `facility_type` (optional): Filter by type
- `max_distance_km` (optional): Maximum distance in kilometers (default: 5.0)

**Example:**
```
GET /facilities/nearby/search?lat=28.6139&lon=77.2090&facility_type=medical_center&max_distance_km=1.0
```

---

## Alerts

### Create Alert

**Endpoint:** `POST /alerts/`

**Request Body:**
```json
{
  "event_id": "string",
  "title": "string",
  "message": "string",
  "alert_type": "info|warning|emergency",
  "severity": "low|medium|high|critical"
}
```

**Example:**
```json
{
  "event_id": "evt123",
  "title": "Crowd Surge Warning",
  "message": "High density detected at Main Stage. Please move to alternate areas.",
  "alert_type": "warning",
  "severity": "high"
}
```

### Get All Alerts

**Endpoint:** `GET /alerts/`

**Query Parameters:**
- `event_id` (optional): Filter by event
- `is_active` (optional): Filter by active status (true/false)
- `alert_type` (optional): Filter by type
- `severity` (optional): Filter by severity

### Get Alert by ID

**Endpoint:** `GET /alerts/{alert_id}`

### Deactivate Alert

**Endpoint:** `PATCH /alerts/{alert_id}/deactivate`

### Delete Alert

**Endpoint:** `DELETE /alerts/{alert_id}`

### Create Weather Alert

**Endpoint:** `POST /alerts/weather`

**Request Body:**
```json
{
  "event_id": "string",
  "temperature": 0.0,
  "humidity": 0.0,
  "condition": "string",
  "wind_speed": 0.0,
  "description": "string"
}
```

**Example:**
```json
{
  "event_id": "evt123",
  "temperature": 35.5,
  "humidity": 75,
  "condition": "Hot and Humid",
  "wind_speed": 15.5,
  "description": "High heat index. Stay hydrated and seek shade."
}
```

### Get All Weather Alerts

**Endpoint:** `GET /alerts/weather`

**Query Parameters:**
- `event_id` (optional): Filter by event

### Get Weather Alert by ID

**Endpoint:** `GET /alerts/weather/{weather_alert_id}`

### Get Latest Weather Alert

**Endpoint:** `GET /alerts/weather/event/{event_id}/latest`

---

## System

### Health Check

**Endpoint:** `GET /health`

**Description:** Returns API health status.

### Root

**Endpoint:** `GET /`

**Description:** Returns API welcome message and basic information.

---

## Response Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Data Types

### User Roles
- `public` - General attendees
- `organizer` - Event organizers
- `medical` - Medical personnel
- `police` - Police/Security personnel

### Event Status
- `scheduled` - Event is scheduled
- `live` - Event is currently ongoing
- `completed` - Event has ended
- `cancelled` - Event was cancelled

### Density Levels
- `Safe` - Low crowd density
- `Moderate` - Medium crowd density
- `Risky` - High crowd density
- `Dangerous` - Critical crowd density

### Emergency Severity
- `minor` - Minor medical issue
- `moderate` - Moderate medical issue
- `severe` - Severe medical issue
- `critical` - Life-threatening emergency

### Emergency Status
- `reported` - Emergency reported
- `responder_dispatched` - Medical personnel dispatched
- `on_scene` - Medical personnel on scene
- `resolved` - Emergency resolved

### Lost Person Priority
- `critical` - Children under 12 or elderly over 65
- `high` - Persons with medical conditions
- `medium` - Other cases

### Feedback Sentiment
- `positive` - Positive feedback (rating 4-5)
- `neutral` - Neutral feedback (rating 3)
- `negative` - Negative feedback (rating 1-2)

---

## Notes

- All datetime values should be in ISO 8601 format
- Coordinates are in decimal degrees format (latitude, longitude)
- Phone numbers should include country code
- All distances are in meters unless specified otherwise
- Replace placeholder values (e.g., `{{event_id}}`) with actual IDs when making requests