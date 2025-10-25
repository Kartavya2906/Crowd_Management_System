from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from datetime import datetime
import secrets

from models import Alert, AlertCreate, WeatherAlert, WeatherAlertCreate
from database import database

router = APIRouter(prefix="/alerts", tags=["Alerts"])

# Collections
alerts_collection = database["alerts"]
weather_alerts_collection = database["weather_alerts"]

def generate_alert_id() -> str:
    """Generate unique alert ID"""
    return f"ALT{secrets.token_hex(6).upper()}"

def generate_weather_alert_id() -> str:
    """Generate unique weather alert ID"""
    return f"WA{secrets.token_hex(6).upper()}"

# ==================== ALERTS ====================

@router.post("/", response_model=Alert, status_code=status.HTTP_201_CREATED)
async def create_alert(alert: AlertCreate):
    """Create a new alert"""
    alert_dict = alert.model_dump()
    alert_dict["id"] = generate_alert_id()
    alert_dict["is_active"] = True
    alert_dict["created_at"] = datetime.utcnow()
    
    await alerts_collection.insert_one(alert_dict)
    
    return Alert(**{k: v for k, v in alert_dict.items() if k != "_id"})

@router.get("/", response_model=List[Alert])
async def get_alerts(
    event_id: Optional[str] = None,
    alert_type: Optional[str] = None,
    severity: Optional[str] = None,
    is_active: Optional[bool] = None
):
    """Get all alerts with optional filters"""
    query = {}
    if event_id:
        query["event_id"] = event_id
    if alert_type:
        query["alert_type"] = alert_type
    if severity:
        query["severity"] = severity
    if is_active is not None:
        query["is_active"] = is_active
    
    alerts = await alerts_collection.find(query).sort("created_at", -1).to_list(1000)
    return [Alert(**{k: v for k, v in alert.items() if k != "_id"}) for alert in alerts]

@router.get("/{alert_id}", response_model=Alert)
async def get_alert(alert_id: str):
    """Get alert by ID"""
    alert = await alerts_collection.find_one({"id": alert_id})
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    return Alert(**{k: v for k, v in alert.items() if k != "_id"})

@router.patch("/{alert_id}/deactivate")
async def deactivate_alert(alert_id: str):
    """Deactivate an alert"""
    alert = await alerts_collection.find_one({"id": alert_id})
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    await alerts_collection.update_one(
        {"id": alert_id},
        {"$set": {"is_active": False}}
    )
    
    return {"message": "Alert deactivated", "alert_id": alert_id}

@router.delete("/{alert_id}")
async def delete_alert(alert_id: str):
    """Delete an alert"""
    result = await alerts_collection.delete_one({"id": alert_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    return {"message": "Alert deleted successfully", "alert_id": alert_id}

# ==================== WEATHER ALERTS ====================

@router.post("/weather", response_model=WeatherAlert, status_code=status.HTTP_201_CREATED)
async def create_weather_alert(weather_alert: WeatherAlertCreate):
    """Create a new weather alert"""
    alert_dict = weather_alert.model_dump()
    alert_dict["id"] = generate_weather_alert_id()
    alert_dict["timestamp"] = datetime.utcnow()
    
    await weather_alerts_collection.insert_one(alert_dict)
    
    return WeatherAlert(**{k: v for k, v in alert_dict.items() if k != "_id"})

@router.get("/weather", response_model=List[WeatherAlert])
async def get_weather_alerts(event_id: Optional[str] = None):
    """Get all weather alerts"""
    query = {}
    if event_id:
        query["event_id"] = event_id
    
    alerts = await weather_alerts_collection.find(query).sort("timestamp", -1).to_list(1000)
    return [WeatherAlert(**{k: v for k, v in alert.items() if k != "_id"}) for alert in alerts]

@router.get("/weather/{alert_id}", response_model=WeatherAlert)
async def get_weather_alert(alert_id: str):
    """Get weather alert by ID"""
    alert = await weather_alerts_collection.find_one({"id": alert_id})
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Weather alert not found"
        )
    
    return WeatherAlert(**{k: v for k, v in alert.items() if k != "_id"})

@router.get("/weather/event/{event_id}/latest", response_model=WeatherAlert)
async def get_latest_weather_alert(event_id: str):
    """Get latest weather alert for an event"""
    alert = await weather_alerts_collection.find_one(
        {"event_id": event_id},
        sort=[("timestamp", -1)]
    )
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No weather alerts found for this event"
        )
    
    return WeatherAlert(**{k: v for k, v in alert.items() if k != "_id"})
