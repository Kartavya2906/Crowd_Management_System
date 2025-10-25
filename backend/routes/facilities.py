from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
import secrets

from models import Facility, FacilityCreate, Location
from database import database

router = APIRouter(prefix="/facilities", tags=["Facilities"])

# Collections
facilities_collection = database["facilities"]

def generate_facility_id() -> str:
    """Generate unique facility ID"""
    return f"FAC{secrets.token_hex(6).upper()}"

@router.post("/", response_model=Facility, status_code=status.HTTP_201_CREATED)
async def create_facility(facility: FacilityCreate):
    """Create a new facility"""
    facility_dict = facility.model_dump()
    facility_dict["id"] = generate_facility_id()
    
    # Convert Location to dict
    if facility_dict.get("location"):
        facility_dict["location"] = dict(facility_dict["location"])
    
    await facilities_collection.insert_one(facility_dict)
    
    return Facility(**{k: v for k, v in facility_dict.items() if k != "_id"})

@router.get("/", response_model=List[Facility])
async def get_facilities(
    event_id: Optional[str] = None,
    facility_type: Optional[str] = None,
    available: Optional[bool] = None
):
    """Get all facilities with optional filters"""
    query = {}
    if event_id:
        query["event_id"] = event_id
    if facility_type:
        query["type"] = facility_type
    if available is not None:
        query["available"] = available
    
    facilities = await facilities_collection.find(query).to_list(1000)
    return [Facility(**{k: v for k, v in facility.items() if k != "_id"}) for facility in facilities]

@router.get("/{facility_id}", response_model=Facility)
async def get_facility(facility_id: str):
    """Get facility by ID"""
    facility = await facilities_collection.find_one({"id": facility_id})
    
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Facility not found"
        )
    
    return Facility(**{k: v for k, v in facility.items() if k != "_id"})

@router.patch("/{facility_id}/availability")
async def update_facility_availability(facility_id: str, available: bool):
    """Update facility availability status"""
    facility = await facilities_collection.find_one({"id": facility_id})
    
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Facility not found"
        )
    
    await facilities_collection.update_one(
        {"id": facility_id},
        {"$set": {"available": available}}
    )
    
    return {"message": "Facility availability updated", "facility_id": facility_id, "available": available}

@router.put("/{facility_id}", response_model=Facility)
async def update_facility(facility_id: str, facility_update: FacilityCreate):
    """Update a facility"""
    facility = await facilities_collection.find_one({"id": facility_id})
    
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Facility not found"
        )
    
    update_dict = facility_update.model_dump()
    
    # Convert Location to dict
    if update_dict.get("location"):
        update_dict["location"] = dict(update_dict["location"])
    
    await facilities_collection.update_one(
        {"id": facility_id},
        {"$set": update_dict}
    )
    
    updated_facility = await facilities_collection.find_one({"id": facility_id})
    return Facility(**{k: v for k, v in updated_facility.items() if k != "_id"})

@router.delete("/{facility_id}")
async def delete_facility(facility_id: str):
    """Delete a facility"""
    result = await facilities_collection.delete_one({"id": facility_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Facility not found"
        )
    
    return {"message": "Facility deleted successfully", "facility_id": facility_id}

@router.get("/nearby/search")
async def find_nearby_facilities(
    lat: float,
    lon: float,
    facility_type: Optional[str] = None,
    max_distance_km: float = 5.0
):
    """Find facilities near a location (simplified version)"""
    query = {}
    if facility_type:
        query["type"] = facility_type
    
    # Get all facilities (in production, use geospatial queries)
    facilities = await facilities_collection.find(query).to_list(1000)
    
    # Simple distance calculation (can be improved with geospatial indexing)
    import math
    
    def haversine_distance(lat1, lon1, lat2, lon2):
        """Calculate distance between two points in km"""
        R = 6371  # Earth's radius in km
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        return R * c
    
    nearby_facilities = []
    for facility in facilities:
        if facility.get("location"):
            facility_lat = facility["location"]["lat"]
            facility_lon = facility["location"]["lon"]
            distance = haversine_distance(lat, lon, facility_lat, facility_lon)
            
            if distance <= max_distance_km:
                facility_data = {k: v for k, v in facility.items() if k != "_id"}
                facility_data["distance_km"] = round(distance, 2)
                nearby_facilities.append(facility_data)
    
    # Sort by distance
    nearby_facilities.sort(key=lambda x: x["distance_km"])
    
    return nearby_facilities
