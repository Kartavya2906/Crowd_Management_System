from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Literal, List
from datetime import datetime
import math

# ---------------------------------------------------
# 🌍 Location Schema
# ---------------------------------------------------
class Location(BaseModel):
    lat: float = Field(..., example=28.6139, description="Latitude in decimal degrees")
    lon: float = Field(..., example=77.2090, description="Longitude in decimal degrees")

    class Config:
        json_schema_extra = {
            "example": {
                "lat": 28.6139,
                "lon": 77.2090
            }
        }


# ---------------------------------------------------
# 👤 User Models
# ---------------------------------------------------
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: Literal["public", "organizer", "medical", "police"] = "public"
    location: Optional[Location] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ---------------------------------------------------
# 🎫 Event Models
# ---------------------------------------------------
class Area(BaseModel):
    name: str = Field(..., example="Main Entrance", description="Name of the area")
    location: Location = Field(..., description="Central point of the area")
    radius_m: float = Field(..., gt=0, example=10.0, description="Radius of the area in meters")

class EventBase(BaseModel):
    name: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    location: str
    capacity: int = Field(..., gt=0, description="Total event capacity")
    areas: List[Area] = Field(default_factory=list, description="Predefined areas for this event")

class EventCreate(EventBase):
    organizer_id: str

class Event(EventBase):
    id: str
    organizer_id: str
    status: Literal["upcoming", "live", "completed"] = "upcoming"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True


# ---------------------------------------------------
# 👥 Crowd Density Models
# ---------------------------------------------------
class CrowdDensityBase(BaseModel):
    event_id: str = Field(..., example="EVT123", description="Associated event ID")
    area_name: str = Field(..., example="Main Entrance", description="Area where density is measured")
    location: Location
    radius_m: float = Field(..., gt=0, example=10.0)
    person_count: int = Field(..., ge=0, example=150)

class CrowdDensityCreate(CrowdDensityBase):
    pass

class CrowdDensity(CrowdDensityBase):
    id: Optional[str] = None
    area_m2: Optional[float] = Field(None, example=314.0, description="Computed area in square meters (πr²)")
    people_per_m2: Optional[float] = Field(None, example=0.48, description="Crowd density (people per square meter)")
    density_level: Optional[Literal["Safe", "Moderate", "Risky", "Overcrowded"]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True

    def calculate_density(self):
        self.area_m2 = round(math.pi * (self.radius_m ** 2), 2)
        self.people_per_m2 = round(self.person_count / self.area_m2, 3)
        self.density_level = self.classify_density(self.people_per_m2)

    @staticmethod
    def classify_density(people_per_m2: float) -> str:
        if people_per_m2 <= 0.5:
            return "Safe"
        elif people_per_m2 <= 2:
            return "Moderate"
        elif people_per_m2 <= 4:
            return "Risky"
        else:
            return "Overcrowded"


# ---------------------------------------------------
# 🧒 Lost Person Models
# ---------------------------------------------------
class LostPersonBase(BaseModel):
    person_name: str
    age: int = Field(..., gt=0, le=150)
    gender: Literal["male", "female", "other"]
    description: Optional[str] = None
    last_seen_location: str
    last_seen_time: str
    photo_url: Optional[str] = None

class LostPersonCreate(LostPersonBase):
    reporter_id: str
    reporter_name: str
    reporter_contact: str
    event_id: Optional[str] = None

class LostPersonReport(LostPersonBase):
    id: str
    reporter_id: str
    reporter_name: str
    reporter_contact: str
    event_id: Optional[str] = None
    status: Literal["reported", "searching", "found", "resolved"] = "reported"
    priority: Literal["low", "medium", "high", "critical"] = "medium"
    reported_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True


# ---------------------------------------------------
# 🚑 Medical Emergency Models
# ---------------------------------------------------
class MedicalEmergencyBase(BaseModel):
    emergency_type: Literal["injury", "illness", "heatstroke", "cardiac", "other"]
    severity: Literal["minor", "moderate", "severe", "critical"]
    patient_name: str
    patient_age: int = Field(..., gt=0, le=150)
    description: str
    location: str

class MedicalEmergencyCreate(MedicalEmergencyBase):
    user_id: str
    event_id: Optional[str] = None

class MedicalEmergency(MedicalEmergencyBase):
    id: str
    user_id: str
    event_id: Optional[str] = None
    status: Literal["reported", "responder_dispatched", "on_scene", "transported", "resolved"] = "reported"
    responder_name: Optional[str] = None
    response_time: Optional[int] = None  # in minutes
    reported_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True


# ---------------------------------------------------
# 🏨 Facility Models
# ---------------------------------------------------
class FacilityBase(BaseModel):
    type: Literal["washroom", "hotel", "medical_center", "food_court", "emergency_exit"]
    name: str
    location: Location
    contact: Optional[str] = None
    available: bool = True

class FacilityCreate(FacilityBase):
    event_id: Optional[str] = None

class Facility(FacilityBase):
    id: str
    event_id: Optional[str] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------
# 🌦️ Weather Alert Models
# ---------------------------------------------------
class WeatherAlertBase(BaseModel):
    event_id: str
    temperature: float
    humidity: float
    condition: str
    wind_speed: Optional[float] = None
    description: Optional[str] = None

class WeatherAlertCreate(WeatherAlertBase):
    pass

class WeatherAlert(WeatherAlertBase):
    id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True

# ---------------------------------------------------
# 🚨 Alert Models
# ---------------------------------------------------
class AlertBase(BaseModel):
    event_id: str
    title: str
    message: str
    alert_type: Literal["warning", "emergency", "info", "weather"]
    severity: Literal["low", "medium", "high", "critical"]
    
class AlertCreate(AlertBase):
    pass

class Alert(AlertBase):
    id: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True


# ---------------------------------------------------
# 💬 Feedback Models
# ---------------------------------------------------
class FeedbackBase(BaseModel):
    event_id: str
    rating: int = Field(..., ge=1, le=5)
    comments: Optional[str] = None

class FeedbackCreate(FeedbackBase):
    user_id: str

class Feedback(FeedbackBase):
    id: str
    user_id: str
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    ai_sentiment: Optional[str] = None  # e.g., "positive" | "neutral" | "negative"

    class Config:
        from_attributes = True


# ---------------------------------------------------
# ✅ Example Usage
# ---------------------------------------------------
# if __name__ == "__main__":
#     main_entrance = Area(
#         name="Main Entrance",
#         location=Location(lat=28.6139, lon=77.2090),
#         radius_m=10
#     )

#     concert_event = Event(
#         name="Music Concert",
#         description="Annual music concert",
#         start_time=datetime(2025, 12, 1, 18, 0),
#         end_time=datetime(2025, 12, 1, 23, 0),
#         organizer_id="USR123",
#         areas=[main_entrance]
#     )

#     crowd = CrowdDensity(
#         event_id="EVT123",
#         area_name=main_entrance.name,
#         location=main_entrance.location,
#         radius_m=main_entrance.radius_m,
#         person_count=150
#     )
#     crowd.calculate_density()
#     print(crowd.json(indent=4))
