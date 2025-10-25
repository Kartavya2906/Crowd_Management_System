from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from datetime import datetime
import secrets

from models import Event, EventCreate, Area
from database import database

router = APIRouter(prefix="/events", tags=["Events"])

# Collections
events_collection = database["events"]

def generate_event_id() -> str:
    """Generate unique event ID"""
    return f"EVT{secrets.token_hex(6).upper()}"

@router.post("/", response_model=Event, status_code=status.HTTP_201_CREATED)
async def create_event(event: EventCreate):
    """Create a new event"""
    event_dict = event.model_dump()
    event_dict["id"] = generate_event_id()
    event_dict["status"] = "upcoming"
    event_dict["created_at"] = datetime.utcnow()
    
    # Convert Areas to dict
    if event_dict.get("areas"):
        event_dict["areas"] = [
            {
                "name": area.name,
                "location": dict(area.location),
                "radius_m": area.radius_m
            } if isinstance(area, Area) else area
            for area in event_dict["areas"]
        ]
    
    await events_collection.insert_one(event_dict)
    
    return Event(**{k: v for k, v in event_dict.items() if k != "_id"})

@router.get("/", response_model=List[Event])
async def get_events(
    status: Optional[str] = None,
    organizer_id: Optional[str] = None
):
    """Get all events with optional filters"""
    query = {}
    if status:
        query["status"] = status
    if organizer_id:
        query["organizer_id"] = organizer_id
    
    events = await events_collection.find(query).to_list(1000)
    return [Event(**{k: v for k, v in event.items() if k != "_id"}) for event in events]

@router.get("/{event_id}", response_model=Event)
async def get_event(event_id: str):
    """Get event by ID"""
    event = await events_collection.find_one({"id": event_id})
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    return Event(**{k: v for k, v in event.items() if k != "_id"})

@router.put("/{event_id}", response_model=Event)
async def update_event(event_id: str, event_update: EventCreate):
    """Update an event"""
    event = await events_collection.find_one({"id": event_id})
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    update_dict = event_update.model_dump(exclude_unset=True)
    
    # Convert Areas to dict
    if update_dict.get("areas"):
        update_dict["areas"] = [
            {
                "name": area.name,
                "location": dict(area.location),
                "radius_m": area.radius_m
            } if isinstance(area, Area) else area
            for area in update_dict["areas"]
        ]
    
    await events_collection.update_one(
        {"id": event_id},
        {"$set": update_dict}
    )
    
    updated_event = await events_collection.find_one({"id": event_id})
    return Event(**{k: v for k, v in updated_event.items() if k != "_id"})

@router.patch("/{event_id}/status")
async def update_event_status(event_id: str, status: str):
    """Update event status"""
    if status not in ["upcoming", "live", "completed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Must be: upcoming, live, or completed"
        )
    
    event = await events_collection.find_one({"id": event_id})
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    await events_collection.update_one(
        {"id": event_id},
        {"$set": {"status": status}}
    )
    
    return {"message": "Event status updated", "event_id": event_id, "status": status}

@router.delete("/{event_id}")
async def delete_event(event_id: str):
    """Delete an event"""
    result = await events_collection.delete_one({"id": event_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    return {"message": "Event deleted successfully", "event_id": event_id}
