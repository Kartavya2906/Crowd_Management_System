from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from datetime import datetime
import secrets

from models import LostPersonReport, LostPersonCreate
from database import database

router = APIRouter(prefix="/lost-persons", tags=["Lost Persons"])

# Collections
lost_persons_collection = database["lost_persons"]

def generate_report_id() -> str:
    """Generate unique report ID"""
    return f"LP{secrets.token_hex(6).upper()}"

def calculate_priority(age: int, time_missing_hours: float = 0) -> str:
    """Calculate priority based on age and time missing"""
    # Children and elderly get higher priority
    if age <= 12 or age >= 65:
        return "critical"
    elif time_missing_hours > 2:
        return "high"
    elif time_missing_hours > 1:
        return "medium"
    else:
        return "medium"

@router.post("/", response_model=LostPersonReport, status_code=status.HTTP_201_CREATED)
async def create_lost_person_report(report: LostPersonCreate):
    """Report a lost person"""
    report_dict = report.model_dump()
    report_dict["id"] = generate_report_id()
    report_dict["status"] = "reported"
    report_dict["reported_at"] = datetime.utcnow()
    
    # Calculate priority
    report_dict["priority"] = calculate_priority(report_dict["age"])
    
    await lost_persons_collection.insert_one(report_dict)
    
    return LostPersonReport(**{k: v for k, v in report_dict.items() if k != "_id"})

@router.get("/", response_model=List[LostPersonReport])
async def get_lost_person_reports(
    event_id: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None
):
    """Get all lost person reports with optional filters"""
    query = {}
    if event_id:
        query["event_id"] = event_id
    if status:
        query["status"] = status
    if priority:
        query["priority"] = priority
    
    reports = await lost_persons_collection.find(query).sort("reported_at", -1).to_list(1000)
    return [LostPersonReport(**{k: v for k, v in report.items() if k != "_id"}) for report in reports]

@router.get("/{report_id}", response_model=LostPersonReport)
async def get_lost_person_report(report_id: str):
    """Get lost person report by ID"""
    report = await lost_persons_collection.find_one({"id": report_id})
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lost person report not found"
        )
    
    return LostPersonReport(**{k: v for k, v in report.items() if k != "_id"})

@router.patch("/{report_id}/status")
async def update_report_status(report_id: str, new_status: str):
    """Update lost person report status"""
    valid_statuses = ["reported", "searching", "found", "resolved"]
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    report = await lost_persons_collection.find_one({"id": report_id})
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lost person report not found"
        )
    
    await lost_persons_collection.update_one(
        {"id": report_id},
        {"$set": {"status": new_status}}
    )
    
    updated_report = await lost_persons_collection.find_one({"id": report_id})
    return LostPersonReport(**{k: v for k, v in updated_report.items() if k != "_id"})

@router.get("/search/active")
async def get_active_reports(event_id: Optional[str] = None):
    """Get all active (not found/resolved) lost person reports"""
    query = {"status": {"$in": ["reported", "searching"]}}
    if event_id:
        query["event_id"] = event_id
    
    reports = await lost_persons_collection.find(query).sort("priority", -1).to_list(1000)
    return [LostPersonReport(**{k: v for k, v in report.items() if k != "_id"}) for report in reports]

@router.get("/stats/event/{event_id}")
async def get_lost_person_stats(event_id: str):
    """Get statistics for lost person reports for an event"""
    pipeline = [
        {"$match": {"event_id": event_id}},
        {
            "$group": {
                "_id": None,
                "total": {"$sum": 1},
                "statuses": {"$push": "$status"},
                "priorities": {"$push": "$priority"}
            }
        }
    ]
    
    result = await lost_persons_collection.aggregate(pipeline).to_list(1)
    
    if not result:
        return {
            "total": 0,
            "by_status": {},
            "by_priority": {}
        }
    
    data = result[0]
    
    return {
        "total": data["total"],
        "by_status": {
            "reported": data["statuses"].count("reported"),
            "searching": data["statuses"].count("searching"),
            "found": data["statuses"].count("found"),
            "resolved": data["statuses"].count("resolved")
        },
        "by_priority": {
            "critical": data["priorities"].count("critical"),
            "high": data["priorities"].count("high"),
            "medium": data["priorities"].count("medium"),
            "low": data["priorities"].count("low")
        }
    }
