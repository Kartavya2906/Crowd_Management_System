"""
Comprehensive API Test Suite for Crowd Management System
Tests all endpoints with pytest
"""

import pytest
from httpx import AsyncClient
from datetime import datetime, timedelta
from main import app
import asyncio


# Test Configuration
BASE_URL = "http://test"
TEST_EVENT_DATE = (datetime.now() + timedelta(days=30)).isoformat()
TEST_EVENT_END = (datetime.now() + timedelta(days=30, hours=5)).isoformat()


# Fixtures
@pytest.fixture
async def async_client():
    """Create async test client"""
    async with AsyncClient(app=app, base_url=BASE_URL) as client:
        yield client


@pytest.fixture
async def test_user(async_client):
    """Create a test user"""
    response = await async_client.post("/auth/register", json={
        "name": "Test User",
        "email": f"testuser_{datetime.now().timestamp()}@example.com",
        "phone": "+1234567890",
        "role": "public",
        "password": "testpass123"
    })
    assert response.status_code == 201
    return response.json()


@pytest.fixture
async def test_organizer(async_client):
    """Create a test organizer"""
    response = await async_client.post("/auth/register", json={
        "name": "Test Organizer",
        "email": f"organizer_{datetime.now().timestamp()}@example.com",
        "phone": "+1555123456",
        "role": "organizer",
        "password": "orgpass123",
        "location": {"lat": 28.6139, "lon": 77.2090}
    })
    assert response.status_code == 201
    return response.json()


@pytest.fixture
async def test_medical(async_client):
    """Create a test medical user"""
    response = await async_client.post("/auth/register", json={
        "name": "Dr. Test Medical",
        "email": f"medical_{datetime.now().timestamp()}@example.com",
        "role": "medical",
        "password": "medpass123"
    })
    assert response.status_code == 201
    return response.json()


@pytest.fixture
async def test_event(async_client, test_organizer):
    """Create a test event"""
    response = await async_client.post("/events/", json={
        "name": "Test Festival",
        "description": "Test event for pytest",
        "start_time": TEST_EVENT_DATE,
        "end_time": TEST_EVENT_END,
        "location": "Test Venue",
        "capacity": 5000,
        "organizer_id": test_organizer["id"],
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
    })
    assert response.status_code == 201
    return response.json()


# ============================================================================
# AUTHENTICATION TESTS
# ============================================================================

class TestAuthentication:
    """Test authentication endpoints"""
    
    @pytest.mark.asyncio
    async def test_register_public_user(self, async_client):
        """Test registering a public user"""
        response = await async_client.post("/auth/register", json={
            "name": "John Doe",
            "email": f"john_{datetime.now().timestamp()}@example.com",
            "role": "public",
            "password": "securepass123"
        })
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["role"] == "public"
        assert data["name"] == "John Doe"
    
    @pytest.mark.asyncio
    async def test_register_organizer(self, async_client):
        """Test registering an organizer"""
        response = await async_client.post("/auth/register", json={
            "name": "Sarah Organizer",
            "email": f"sarah_{datetime.now().timestamp()}@example.com",
            "phone": "+1555999888",
            "role": "organizer",
            "password": "orgpass456",
            "location": {"lat": 28.6139, "lon": 77.2090}
        })
        assert response.status_code == 201
        data = response.json()
        assert data["role"] == "organizer"
        assert "location" in data
    
    @pytest.mark.asyncio
    async def test_register_duplicate_email(self, async_client, test_user):
        """Test registering with duplicate email"""
        response = await async_client.post("/auth/register", json={
            "name": "Duplicate User",
            "email": test_user["email"],
            "role": "public",
            "password": "pass123"
        })
        assert response.status_code == 400
    
    @pytest.mark.asyncio
    async def test_login_success(self, async_client, test_user):
        """Test successful login"""
        response = await async_client.post("/auth/login", json={
            "email": test_user["email"],
            "password": "testpass123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "user" in data
        assert data["user"]["id"] == test_user["id"]
    
    @pytest.mark.asyncio
    async def test_login_wrong_password(self, async_client, test_user):
        """Test login with wrong password"""
        response = await async_client.post("/auth/login", json={
            "email": test_user["email"],
            "password": "wrongpassword"
        })
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, async_client):
        """Test login with non-existent user"""
        response = await async_client.post("/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "anypass"
        })
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_get_all_users(self, async_client, test_user):
        """Test getting all users"""
        response = await async_client.get("/auth/users")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    @pytest.mark.asyncio
    async def test_get_users_by_role(self, async_client, test_organizer):
        """Test getting users by role"""
        response = await async_client.get("/auth/users?role=organizer")
        assert response.status_code == 200
        users = response.json()
        assert all(user["role"] == "organizer" for user in users)
    
    @pytest.mark.asyncio
    async def test_get_user_by_id(self, async_client, test_user):
        """Test getting user by ID"""
        response = await async_client.get(f"/auth/users/{test_user['id']}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_user["id"]


# ============================================================================
# EVENT TESTS
# ============================================================================

class TestEvents:
    """Test event endpoints"""
    
    @pytest.mark.asyncio
    async def test_create_event(self, async_client, test_organizer):
        """Test creating an event"""
        response = await async_client.post("/events/", json={
            "name": "Music Concert",
            "description": "Live music performance",
            "start_time": TEST_EVENT_DATE,
            "end_time": TEST_EVENT_END,
            "location": "Downtown Arena",
            "capacity": 3000,
            "organizer_id": test_organizer["id"],
            "areas": [
                {
                    "name": "VIP Section",
                    "location": {"lat": 28.6135, "lon": 77.2085},
                    "radius_m": 20
                }
            ]
        })
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["status"] == "upcoming"
        assert len(data["areas"]) == 1
    
    @pytest.mark.asyncio
    async def test_get_all_events(self, async_client, test_event):
        """Test getting all events"""
        response = await async_client.get("/events/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    @pytest.mark.asyncio
    async def test_get_event_by_id(self, async_client, test_event):
        """Test getting event by ID"""
        response = await async_client.get(f"/events/{test_event['id']}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_event["id"]
    
    @pytest.mark.asyncio
    async def test_get_events_by_status(self, async_client, test_event):
        """Test getting events by status"""
        response = await async_client.get("/events/?status=upcoming")
        assert response.status_code == 200
        events = response.json()
        assert all(event["status"] == "upcoming" for event in events)
    
    @pytest.mark.asyncio
    async def test_get_events_by_organizer(self, async_client, test_organizer, test_event):
        """Test getting events by organizer"""
        response = await async_client.get(f"/events/?organizer_id={test_organizer['id']}")
        assert response.status_code == 200
        events = response.json()
        assert all(event["organizer_id"] == test_organizer["id"] for event in events)
    
    @pytest.mark.asyncio
    async def test_update_event(self, async_client, test_event, test_organizer):
        """Test updating an event"""
        response = await async_client.put(f"/events/{test_event['id']}", json={
            "name": "Updated Festival Name",
            "description": "Updated description",
            "start_time": TEST_EVENT_DATE,
            "end_time": TEST_EVENT_END,
            "location": "Updated Venue",
            "capacity": 6000,
            "organizer_id": test_organizer["id"],
            "areas": []
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Festival Name"
        assert data["capacity"] == 6000
    
    @pytest.mark.asyncio
    async def test_update_event_status_to_live(self, async_client, test_event):
        """Test updating event status to live"""
        response = await async_client.patch(
            f"/events/{test_event['id']}/status?status=live"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "live"
    
    @pytest.mark.asyncio
    async def test_update_event_status_to_completed(self, async_client, test_event):
        """Test updating event status to completed"""
        # First set to live
        await async_client.patch(f"/events/{test_event['id']}/status?status=live")
        # Then set to completed
        response = await async_client.patch(
            f"/events/{test_event['id']}/status?status=completed"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "completed"
    
    @pytest.mark.asyncio
    async def test_delete_event(self, async_client, test_organizer):
        """Test deleting an event"""
        # Create a new event to delete
        create_response = await async_client.post("/events/", json={
            "name": "Event to Delete",
            "description": "Will be deleted",
            "start_time": TEST_EVENT_DATE,
            "end_time": TEST_EVENT_END,
            "location": "Test",
            "capacity": 100,
            "organizer_id": test_organizer["id"],
            "areas": []
        })
        event_id = create_response.json()["id"]
        
        # Delete it
        response = await async_client.delete(f"/events/{event_id}")
        assert response.status_code == 200
        
        # Verify it's deleted
        get_response = await async_client.get(f"/events/{event_id}")
        assert get_response.status_code == 404


# ============================================================================
# CROWD DENSITY TESTS
# ============================================================================

class TestCrowdDensity:
    """Test crowd density endpoints"""
    
    @pytest.mark.asyncio
    async def test_create_density_record(self, async_client, test_event):
        """Test creating a density record"""
        response = await async_client.post("/crowd-density/", json={
            "event_id": test_event["id"],
            "area_name": "Main Stage",
            "location": {"lat": 28.6139, "lon": 77.2090},
            "radius_m": 50,
            "person_count": 850
        })
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["person_count"] == 850
        assert "people_per_m2" in data
        assert "density_level" in data
    
    @pytest.mark.asyncio
    async def test_get_all_density_records(self, async_client):
        """Test getting all density records"""
        response = await async_client.get("/crowd-density/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    @pytest.mark.asyncio
    async def test_get_density_by_event(self, async_client, test_event):
        """Test getting density records by event"""
        # Create a density record first
        await async_client.post("/crowd-density/", json={
            "event_id": test_event["id"],
            "area_name": "Main Stage",
            "location": {"lat": 28.6139, "lon": 77.2090},
            "radius_m": 50,
            "person_count": 500
        })
        
        response = await async_client.get(f"/crowd-density/?event_id={test_event['id']}")
        assert response.status_code == 200
        records = response.json()
        assert len(records) > 0  # Check that we got results
        assert all(r["event_id"] == test_event["id"] for r in records)
    
    @pytest.mark.asyncio
    async def test_get_density_by_area(self, async_client, test_event):
        """Test getting density by area name"""
        await async_client.post("/crowd-density/", json={
            "event_id": test_event["id"],
            "area_name": "Food Court",
            "location": {"lat": 28.6145, "lon": 77.2095},
            "radius_m": 30,
            "person_count": 200
        })
        
        response = await async_client.get(
            f"/crowd-density/?event_id={test_event['id']}&area_name=Food Court"
        )
        assert response.status_code == 200
        records = response.json()
        assert all(r["area_name"] == "Food Court" for r in records)
    
    @pytest.mark.asyncio
    async def test_get_latest_density(self, async_client, test_event):
        """Test getting latest density for event"""
        # Create multiple records
        for i in range(3):
            await async_client.post("/crowd-density/", json={
                "event_id": test_event["id"],
                "area_name": "Main Stage",
                "location": {"lat": 28.6139, "lon": 77.2090},
                "radius_m": 50,
                "person_count": 500 + i * 100
            })
            await asyncio.sleep(0.1)
        
        response = await async_client.get(
            f"/crowd-density/event/{test_event['id']}/latest?limit=2"
        )
        assert response.status_code == 200
        records = response.json()
        assert len(records) <= 2
    
    @pytest.mark.asyncio
    async def test_get_current_density_all_areas(self, async_client, test_event):
        """Test getting current density for all areas"""
        response = await async_client.get(
            f"/crowd-density/event/{test_event['id']}/areas"
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)


# ============================================================================
# MEDICAL EMERGENCY TESTS
# ============================================================================

class TestMedicalEmergencies:
    """Test medical emergency endpoints"""
    
    @pytest.mark.asyncio
    async def test_report_emergency(self, async_client, test_user, test_event):
        """Test reporting a medical emergency"""
        response = await async_client.post("/medical-emergencies/", json={
            "user_id": test_user["id"],
            "event_id": test_event["id"],
            "emergency_type": "heatstroke",
            "severity": "severe",
            "patient_name": "John Patient",
            "patient_age": 45,
            "description": "Patient experiencing dizziness and nausea",
            "location": "Main Stage Area"
        })
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["status"] == "reported"
        assert data["severity"] == "severe"
    
    @pytest.mark.asyncio
    async def test_get_all_emergencies(self, async_client):
        """Test getting all emergencies"""
        response = await async_client.get("/medical-emergencies/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    @pytest.mark.asyncio
    async def test_get_emergencies_by_event(self, async_client, test_user, test_event):
        """Test getting emergencies by event"""
        await async_client.post("/medical-emergencies/", json={
            "user_id": test_user["id"],
            "event_id": test_event["id"],
            "emergency_type": "injury",
            "severity": "moderate",
            "patient_name": "Test Patient",
            "patient_age": 30,
            "description": "Ankle injury",
            "location": "Food Court"
        })
        
        response = await async_client.get(f"/medical-emergencies/?event_id={test_event['id']}")
        assert response.status_code == 200
        emergencies = response.json()
        assert len(emergencies) > 0  # Check that we got results
        assert all(e["event_id"] == test_event["id"] for e in emergencies)
    
    @pytest.mark.asyncio
    async def test_get_emergencies_by_severity(self, async_client):
        """Test getting emergencies by severity"""
        response = await async_client.get("/medical-emergencies/?severity=critical")
        assert response.status_code == 200
        emergencies = response.json()
        assert all(e["severity"] == "critical" for e in emergencies)
    
    @pytest.mark.asyncio
    async def test_update_emergency_status(self, async_client, test_user, test_event):
        """Test updating emergency status"""
        # Create emergency
        create_response = await async_client.post("/medical-emergencies/", json={
            "user_id": test_user["id"],
            "event_id": test_event["id"],
            "emergency_type": "cardiac",
            "severity": "critical",
            "patient_name": "Emergency Patient",
            "patient_age": 60,
            "description": "Chest pain",
            "location": "Parking Area"
        })
        emergency_id = create_response.json()["id"]
        
        # Update status to responder_dispatched
        response = await async_client.patch(
            f"/medical-emergencies/{emergency_id}/status?new_status=responder_dispatched&responder_name=Dr. Smith"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "responder_dispatched"
        assert data["responder_name"] == "Dr. Smith"
    
    @pytest.mark.asyncio
    async def test_get_emergency_statistics(self, async_client, test_event):
        """Test getting emergency statistics"""
        response = await async_client.get(
            f"/medical-emergencies/stats/event/{test_event['id']}"
        )
        assert response.status_code == 200
        stats = response.json()
        assert "total" in stats  # Check 'total' instead of 'total_emergencies'
        assert "by_status" in stats
        assert "by_severity" in stats


# ============================================================================
# LOST PERSON TESTS
# ============================================================================

class TestLostPersons:
    """Test lost person endpoints"""
    
    @pytest.mark.asyncio
    async def test_report_lost_child(self, async_client, test_user, test_event):
        """Test reporting a lost child"""
        response = await async_client.post("/lost-persons/", json={
            "reporter_id": test_user["id"],
            "reporter_name": "Parent Name",
            "reporter_contact": "+1555012345",
            "person_name": "Child Name",
            "age": 6,
            "gender": "female",
            "description": "Blue dress, brown hair",
            "last_seen_location": "Main Entrance",
            "last_seen_time": "14:30",
            "event_id": test_event["id"]
        })
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["priority"] == "critical"  # Child should be critical
        assert data["status"] == "reported"
    
    @pytest.mark.asyncio
    async def test_report_lost_elderly(self, async_client, test_user, test_event):
        """Test reporting a lost elderly person"""
        response = await async_client.post("/lost-persons/", json={
            "reporter_id": test_user["id"],
            "reporter_name": "Family Member",
            "reporter_contact": "+1555098765",
            "person_name": "Elderly Person",
            "age": 75,
            "gender": "male",
            "description": "Gray jacket, glasses",
            "last_seen_location": "Food Area",
            "last_seen_time": "15:00",
            "event_id": test_event["id"]
        })
        assert response.status_code == 201
        data = response.json()
        assert data["priority"] == "critical"  # Elderly should be critical
    
    @pytest.mark.asyncio
    async def test_get_all_lost_person_reports(self, async_client):
        """Test getting all lost person reports"""
        response = await async_client.get("/lost-persons/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    @pytest.mark.asyncio
    async def test_get_reports_by_event(self, async_client, test_user, test_event):
        """Test getting reports by event"""
        await async_client.post("/lost-persons/", json={
            "reporter_id": test_user["id"],
            "reporter_name": "Test Reporter",
            "reporter_contact": "+1555111222",
            "person_name": "Test Person",
            "age": 25,
            "gender": "male",
            "description": "Red shirt",
            "last_seen_location": "Stage",
            "last_seen_time": "16:00",
            "event_id": test_event["id"]
        })
        
        response = await async_client.get(f"/lost-persons/?event_id={test_event['id']}")
        assert response.status_code == 200
        reports = response.json()
        assert len(reports) > 0  # Check that we got results
        assert all(r["event_id"] == test_event["id"] for r in reports)
    
    @pytest.mark.asyncio
    async def test_update_report_status(self, async_client, test_user, test_event):
        """Test updating report status"""
        # Create report
        create_response = await async_client.post("/lost-persons/", json={
            "reporter_id": test_user["id"],
            "reporter_name": "Reporter",
            "reporter_contact": "+1555333444",
            "person_name": "Lost Person",
            "age": 30,
            "gender": "female",
            "description": "Green jacket",
            "last_seen_location": "Exit A",
            "last_seen_time": "17:00",
            "event_id": test_event["id"]
        })
        report_id = create_response.json()["id"]
        
        # Update to found
        response = await async_client.patch(
            f"/lost-persons/{report_id}/status?new_status=found"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "found"
    
    @pytest.mark.asyncio
    async def test_get_active_reports(self, async_client, test_event):
        """Test getting active reports"""
        response = await async_client.get(
            f"/lost-persons/search/active?event_id={test_event['id']}"
        )
        assert response.status_code == 200
        reports = response.json()
        assert all(r["status"] in ["reported", "searching"] for r in reports)
    
    @pytest.mark.asyncio
    async def test_get_lost_person_statistics(self, async_client, test_event):
        """Test getting statistics"""
        response = await async_client.get(
            f"/lost-persons/stats/event/{test_event['id']}"
        )
        assert response.status_code == 200
        stats = response.json()
        assert "total" in stats  # Check 'total' instead of 'total_reports'
        assert "by_status" in stats


# ============================================================================
# FEEDBACK TESTS
# ============================================================================

class TestFeedback:
    """Test feedback endpoints"""
    
    @pytest.mark.asyncio
    async def test_submit_positive_feedback(self, async_client, test_user, test_event):
        """Test submitting positive feedback"""
        response = await async_client.post("/feedback/", json={
            "user_id": test_user["id"],
            "event_id": test_event["id"],
            "rating": 5,
            "comments": "Excellent event! Great organization and amazing experience!"
        })
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["rating"] == 5
        assert data["ai_sentiment"] == "positive"  # Check ai_sentiment instead of sentiment
    
    @pytest.mark.asyncio
    async def test_submit_negative_feedback(self, async_client, test_user, test_event):
        """Test submitting negative feedback"""
        response = await async_client.post("/feedback/", json={
            "user_id": test_user["id"],
            "event_id": test_event["id"],
            "rating": 2,
            "comments": "Poor management, terrible experience, bad facilities"
        })
        assert response.status_code == 201
        data = response.json()
        assert data["rating"] == 2
        assert data["ai_sentiment"] == "negative"  # Check ai_sentiment instead of sentiment
    
    @pytest.mark.asyncio
    async def test_submit_rating_only(self, async_client, test_user, test_event):
        """Test submitting rating without comments"""
        response = await async_client.post("/feedback/", json={
            "user_id": test_user["id"],
            "event_id": test_event["id"],
            "rating": 4
        })
        assert response.status_code == 201
        data = response.json()
        assert data["rating"] == 4
    
    @pytest.mark.asyncio
    async def test_get_all_feedback(self, async_client):
        """Test getting all feedback"""
        response = await async_client.get("/feedback/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    @pytest.mark.asyncio
    async def test_get_feedback_by_event(self, async_client, test_user, test_event):
        """Test getting feedback by event"""
        await async_client.post("/feedback/", json={
            "user_id": test_user["id"],
            "event_id": test_event["id"],
            "rating": 3,
            "comments": "Average experience"
        })
        
        response = await async_client.get(f"/feedback/?event_id={test_event['id']}")
        assert response.status_code == 200
        feedbacks = response.json()
        assert len(feedbacks) > 0  # Check that we got results
        assert all(f["event_id"] == test_event["id"] for f in feedbacks)
    
    @pytest.mark.asyncio
    async def test_get_feedback_statistics(self, async_client, test_event):
        """Test getting feedback statistics"""
        response = await async_client.get(
            f"/feedback/event/{test_event['id']}/stats"
        )
        assert response.status_code == 200
        stats = response.json()
        assert "total_count" in stats
        assert "average_rating" in stats
        assert "rating_distribution" in stats
        assert "sentiment_distribution" in stats


# ============================================================================
# FACILITY TESTS
# ============================================================================

class TestFacilities:
    """Test facility endpoints"""
    
    @pytest.mark.asyncio
    async def test_create_medical_facility(self, async_client, test_event):
        """Test creating a medical facility"""
        response = await async_client.post("/facilities/", json={
            "type": "medical_center",
            "name": "First Aid Station 1",
            "location": {"lat": 28.6140, "lon": 77.2092},
            "contact": "+1555098765",
            "available": True,
            "event_id": test_event["id"]
        })
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["type"] == "medical_center"
        assert data["available"] is True
    
    @pytest.mark.asyncio
    async def test_create_washroom_facility(self, async_client, test_event):
        """Test creating a washroom facility"""
        response = await async_client.post("/facilities/", json={
            "type": "washroom",
            "name": "Restroom Block A",
            "location": {"lat": 28.6142, "lon": 77.2088},
            "available": True,
            "event_id": test_event["id"]
        })
        assert response.status_code == 201
        data = response.json()
        assert data["type"] == "washroom"
    
    @pytest.mark.asyncio
    async def test_get_all_facilities(self, async_client):
        """Test getting all facilities"""
        response = await async_client.get("/facilities/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    @pytest.mark.asyncio
    async def test_get_facilities_by_type(self, async_client, test_event):
        """Test getting facilities by type"""
        await async_client.post("/facilities/", json={
            "type": "food_court",
            "name": "Food Plaza",
            "location": {"lat": 28.6145, "lon": 77.2095},
            "available": True,
            "event_id": test_event["id"]
        })
        
        response = await async_client.get("/facilities/?facility_type=food_court")
        assert response.status_code == 200
        facilities = response.json()
        assert all(f["type"] == "food_court" for f in facilities)
    
    @pytest.mark.asyncio
    async def test_update_facility_availability(self, async_client, test_event):
        """Test updating facility availability"""
        # Create facility
        create_response = await async_client.post("/facilities/", json={
            "type": "emergency_exit",
            "name": "Exit North",
            "location": {"lat": 28.6150, "lon": 77.2100},
            "available": True,
            "event_id": test_event["id"]
        })
        facility_id = create_response.json()["id"]
        
        # Update availability
        response = await async_client.patch(
            f"/facilities/{facility_id}/availability?available=false"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["available"] is False
    
    @pytest.mark.asyncio
    async def test_find_nearby_facilities(self, async_client, test_event):
        """Test finding nearby facilities"""
        # Create a facility
        await async_client.post("/facilities/", json={
            "type": "medical_center",
            "name": "Nearby Medical",
            "location": {"lat": 28.6140, "lon": 77.2091},
            "available": True,
            "event_id": test_event["id"]
        })
        
        # Search nearby
        response = await async_client.get(
            "/facilities/nearby/search?lat=28.6139&lon=77.2090&facility_type=medical_center&max_distance_km=1.0"
        )
        assert response.status_code == 200
        facilities = response.json()
        assert isinstance(facilities, list)


# ============================================================================
# ALERT TESTS
# ============================================================================

class TestAlerts:
    """Test alert endpoints"""
    
    @pytest.mark.asyncio
    async def test_create_warning_alert(self, async_client, test_event):
        """Test creating a warning alert"""
        response = await async_client.post("/alerts/", json={
            "event_id": test_event["id"],
            "title": "Crowd Surge Warning",
            "message": "High density at Main Stage",
            "alert_type": "warning",
            "severity": "high"
        })
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["alert_type"] == "warning"
        assert data["is_active"] is True
    
    @pytest.mark.asyncio
    async def test_create_emergency_alert(self, async_client, test_event):
        """Test creating an emergency alert"""
        response = await async_client.post("/alerts/", json={
            "event_id": test_event["id"],
            "title": "Emergency Evacuation",
            "message": "Proceed to nearest exit",
            "alert_type": "emergency",
            "severity": "critical"
        })
        assert response.status_code == 201
        data = response.json()
        assert data["severity"] == "critical"
    
    @pytest.mark.asyncio
    async def test_get_all_alerts(self, async_client):
        """Test getting all alerts"""
        response = await async_client.get("/alerts/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    @pytest.mark.asyncio
    async def test_get_active_alerts(self, async_client, test_event):
        """Test getting active alerts"""
        await async_client.post("/alerts/", json={
            "event_id": test_event["id"],
            "title": "Info Alert",
            "message": "Performance starting soon",
            "alert_type": "info",
            "severity": "low"
        })
        
        response = await async_client.get("/alerts/?is_active=true")
        assert response.status_code == 200
        alerts = response.json()
        assert all(a["is_active"] is True for a in alerts)
    
    @pytest.mark.asyncio
    async def test_deactivate_alert(self, async_client, test_event):
        """Test deactivating an alert"""
        # Create alert
        create_response = await async_client.post("/alerts/", json={
            "event_id": test_event["id"],
            "title": "Test Alert",
            "message": "Test message",
            "alert_type": "info",
            "severity": "low"
        })
        alert_id = create_response.json()["id"]
        
        # Deactivate
        response = await async_client.patch(f"/alerts/{alert_id}/deactivate")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["alert_id"] == alert_id
    
    @pytest.mark.asyncio
    async def test_create_weather_alert(self, async_client, test_event):
        """Test creating a weather alert"""
        response = await async_client.post("/alerts/weather", json={
            "event_id": test_event["id"],
            "temperature": 35.5,
            "humidity": 75,
            "condition": "Hot and Humid",
            "wind_speed": 15.5,
            "description": "Stay hydrated"
        })
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["temperature"] == 35.5
    
    @pytest.mark.asyncio
    async def test_get_latest_weather_alert(self, async_client, test_event):
        """Test getting latest weather alert"""
        # Create weather alert
        await async_client.post("/alerts/weather", json={
            "event_id": test_event["id"],
            "temperature": 30.0,
            "humidity": 60,
            "condition": "Clear",
            "wind_speed": 10.0,
            "description": "Good weather"
        })
        
        response = await async_client.get(
            f"/alerts/weather/event/{test_event['id']}/latest"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["event_id"] == test_event["id"]  # Check event_id, not id


# ============================================================================
# SYSTEM TESTS
# ============================================================================

class TestSystem:
    """Test system endpoints"""
    
    @pytest.mark.asyncio
    async def test_root_endpoint(self, async_client):
        """Test root endpoint"""
        response = await async_client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Crowd Management System" in data["message"]
    
    @pytest.mark.asyncio
    async def test_health_check(self, async_client):
        """Test health check endpoint"""
        response = await async_client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


# ============================================================================
# RUN CONFIGURATION
# ============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
