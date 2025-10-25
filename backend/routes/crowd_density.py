from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from datetime import datetime
import secrets
import math

from models import CrowdDensity, CrowdDensityCreate
from database import database

router = APIRouter(prefix="/crowd-density", tags=["Crowd Density"])

# Collections
crowd_density_collection = database["crowd_density"]

def generate_density_id() -> str:
    """Generate unique density record ID"""
    return f"CD{secrets.token_hex(6).upper()}"

def calculate_density(crowd: dict):
    """Calculate crowd density metrics"""
    crowd["area_m2"] = round(math.pi * (crowd["radius_m"] ** 2), 2)
    crowd["people_per_m2"] = round(crowd["person_count"] / crowd["area_m2"], 3) if crowd["area_m2"] > 0 else 0
    
    # Classify density level
    people_per_m2 = crowd["people_per_m2"]
    if people_per_m2 <= 0.5:
        crowd["density_level"] = "Safe"
    elif people_per_m2 <= 2:
        crowd["density_level"] = "Moderate"
    elif people_per_m2 <= 4:
        crowd["density_level"] = "Risky"
    else:
        crowd["density_level"] = "Overcrowded"
    
    return crowd

@router.post("/", response_model=CrowdDensity, status_code=status.HTTP_201_CREATED)
async def create_density_record(density: CrowdDensityCreate):
    """Create a new crowd density record"""
    density_dict = density.model_dump()
    density_dict["id"] = generate_density_id()
    density_dict["timestamp"] = datetime.utcnow()
    
    # Convert Location to dict
    if density_dict.get("location"):
        density_dict["location"] = dict(density_dict["location"])
    
    # Calculate density metrics
    density_dict = calculate_density(density_dict)
    
    await crowd_density_collection.insert_one(density_dict)
    
    return CrowdDensity(**{k: v for k, v in density_dict.items() if k != "_id"})

@router.get("/", response_model=List[CrowdDensity])
async def get_density_records(
    event_id: Optional[str] = None,
    area_name: Optional[str] = None,
    density_level: Optional[str] = None
):
    """Get crowd density records with optional filters"""
    query = {}
    if event_id:
        query["event_id"] = event_id
    if area_name:
        query["area_name"] = area_name
    if density_level:
        query["density_level"] = density_level
    
    records = await crowd_density_collection.find(query).sort("timestamp", -1).to_list(1000)
    return [CrowdDensity(**{k: v for k, v in record.items() if k != "_id"}) for record in records]

@router.get("/{density_id}", response_model=CrowdDensity)
async def get_density_record(density_id: str):
    """Get density record by ID"""
    record = await crowd_density_collection.find_one({"id": density_id})
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Density record not found"
        )
    
    return CrowdDensity(**{k: v for k, v in record.items() if k != "_id"})

@router.get("/event/{event_id}/latest", response_model=List[CrowdDensity])
async def get_latest_density_by_event(event_id: str, limit: int = 10):
    """Get latest density records for an event"""
    records = await crowd_density_collection.find(
        {"event_id": event_id}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    return [CrowdDensity(**{k: v for k, v in record.items() if k != "_id"}) for record in records]

@router.get("/event/{event_id}/areas")
async def get_event_areas_density(event_id: str):
    """Get current density for all areas in an event"""
    pipeline = [
        {"$match": {"event_id": event_id}},
        {"$sort": {"timestamp": -1}},
        {
            "$group": {
                "_id": "$area_name",
                "latest_record": {"$first": "$$ROOT"}
            }
        }
    ]
    
    results = await crowd_density_collection.aggregate(pipeline).to_list(100)
    
    areas_density = []
    for result in results:
        record = result["latest_record"]
        areas_density.append(CrowdDensity(**{k: v for k, v in record.items() if k != "_id"}))
    
    return areas_density
