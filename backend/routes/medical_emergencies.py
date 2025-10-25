from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from datetime import datetime
import secrets

from models import MedicalEmergency, MedicalEmergencyCreate
from database import database

router = APIRouter(prefix="/medical-emergencies", tags=["Medical Emergencies"])

# Collections
medical_collection = database["medical_emergencies"]

def generate_emergency_id() -> str:
    """Generate unique emergency ID"""
    return f"MED{secrets.token_hex(6).upper()}"

@router.post("/", response_model=MedicalEmergency, status_code=status.HTTP_201_CREATED)
async def create_emergency(emergency: MedicalEmergencyCreate):
    """Report a new medical emergency"""
    emergency_dict = emergency.model_dump()
    emergency_dict["id"] = generate_emergency_id()
    emergency_dict["status"] = "reported"
    emergency_dict["reported_at"] = datetime.utcnow()
    
    await medical_collection.insert_one(emergency_dict)
    
    return MedicalEmergency(**{k: v for k, v in emergency_dict.items() if k != "_id"})

@router.get("/", response_model=List[MedicalEmergency])
async def get_emergencies(
    event_id: Optional[str] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    emergency_type: Optional[str] = None
):
    """Get all medical emergencies with optional filters"""
    query = {}
    if event_id:
        query["event_id"] = event_id
    if status:
        query["status"] = status
    if severity:
        query["severity"] = severity
    if emergency_type:
        query["emergency_type"] = emergency_type
    
    emergencies = await medical_collection.find(query).sort("reported_at", -1).to_list(1000)
    return [MedicalEmergency(**{k: v for k, v in emergency.items() if k != "_id"}) for emergency in emergencies]

@router.get("/{emergency_id}", response_model=MedicalEmergency)
async def get_emergency(emergency_id: str):
    """Get emergency by ID"""
    emergency = await medical_collection.find_one({"id": emergency_id})
    
    if not emergency:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emergency not found"
        )
    
    return MedicalEmergency(**{k: v for k, v in emergency.items() if k != "_id"})

@router.patch("/{emergency_id}/status")
async def update_emergency_status(
    emergency_id: str,
    new_status: str,
    responder_name: Optional[str] = None,
    response_time: Optional[int] = None
):
    """Update emergency status"""
    valid_statuses = ["reported", "responder_dispatched", "on_scene", "transported", "resolved"]
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    emergency = await medical_collection.find_one({"id": emergency_id})
    if not emergency:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emergency not found"
        )
    
    update_data = {"status": new_status}
    if responder_name:
        update_data["responder_name"] = responder_name
    if response_time is not None:
        update_data["response_time"] = response_time
    
    await medical_collection.update_one(
        {"id": emergency_id},
        {"$set": update_data}
    )
    
    updated_emergency = await medical_collection.find_one({"id": emergency_id})
    return MedicalEmergency(**{k: v for k, v in updated_emergency.items() if k != "_id"})

@router.get("/stats/event/{event_id}")
async def get_emergency_stats(event_id: str):
    """Get emergency statistics for an event"""
    pipeline = [
        {"$match": {"event_id": event_id}},
        {
            "$group": {
                "_id": None,
                "total": {"$sum": 1},
                "by_severity": {
                    "$push": "$severity"
                },
                "by_status": {
                    "$push": "$status"
                },
                "by_type": {
                    "$push": "$emergency_type"
                }
            }
        }
    ]
    
    result = await medical_collection.aggregate(pipeline).to_list(1)
    
    if not result:
        return {
            "total": 0,
            "by_severity": {},
            "by_status": {},
            "by_type": {}
        }
    
    data = result[0]
    
    return {
        "total": data["total"],
        "by_severity": {
            "critical": data["by_severity"].count("critical"),
            "severe": data["by_severity"].count("severe"),
            "moderate": data["by_severity"].count("moderate"),
            "minor": data["by_severity"].count("minor")
        },
        "by_status": {
            "reported": data["by_status"].count("reported"),
            "responder_dispatched": data["by_status"].count("responder_dispatched"),
            "on_scene": data["by_status"].count("on_scene"),
            "transported": data["by_status"].count("transported"),
            "resolved": data["by_status"].count("resolved")
        },
        "by_type": {
            "injury": data["by_type"].count("injury"),
            "illness": data["by_type"].count("illness"),
            "heatstroke": data["by_type"].count("heatstroke"),
            "cardiac": data["by_type"].count("cardiac"),
            "other": data["by_type"].count("other")
        }
    }
