from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from datetime import datetime
import secrets

from models import Feedback, FeedbackCreate
from database import database

router = APIRouter(prefix="/feedback", tags=["Feedback"])

# Collections
feedback_collection = database["feedback"]

def generate_feedback_id() -> str:
    """Generate unique feedback ID"""
    return f"FB{secrets.token_hex(6).upper()}"

def analyze_sentiment(comments: Optional[str]) -> str:
    """Simple sentiment analysis (can be enhanced with AI/ML)"""
    if not comments:
        return "neutral"
    
    comments_lower = comments.lower()
    
    # Simple keyword-based sentiment analysis
    positive_keywords = ["great", "excellent", "amazing", "wonderful", "good", "love", "best", "awesome"]
    negative_keywords = ["bad", "poor", "terrible", "worst", "hate", "awful", "horrible", "disappointing"]
    
    positive_count = sum(1 for word in positive_keywords if word in comments_lower)
    negative_count = sum(1 for word in negative_keywords if word in comments_lower)
    
    if positive_count > negative_count:
        return "positive"
    elif negative_count > positive_count:
        return "negative"
    else:
        return "neutral"

@router.post("/", response_model=Feedback, status_code=status.HTTP_201_CREATED)
async def create_feedback(feedback: FeedbackCreate):
    """Submit feedback for an event"""
    feedback_dict = feedback.model_dump()
    feedback_dict["id"] = generate_feedback_id()
    feedback_dict["submitted_at"] = datetime.utcnow()
    
    # Perform sentiment analysis
    feedback_dict["ai_sentiment"] = analyze_sentiment(feedback_dict.get("comments"))
    
    await feedback_collection.insert_one(feedback_dict)
    
    return Feedback(**{k: v for k, v in feedback_dict.items() if k != "_id"})

@router.get("/", response_model=List[Feedback])
async def get_all_feedback(
    event_id: Optional[str] = None,
    user_id: Optional[str] = None,
    min_rating: Optional[int] = None,
    sentiment: Optional[str] = None
):
    """Get all feedback with optional filters"""
    query = {}
    if event_id:
        query["event_id"] = event_id
    if user_id:
        query["user_id"] = user_id
    if min_rating:
        query["rating"] = {"$gte": min_rating}
    if sentiment:
        query["ai_sentiment"] = sentiment
    
    feedbacks = await feedback_collection.find(query).sort("submitted_at", -1).to_list(1000)
    return [Feedback(**{k: v for k, v in feedback.items() if k != "_id"}) for feedback in feedbacks]

@router.get("/{feedback_id}", response_model=Feedback)
async def get_feedback(feedback_id: str):
    """Get feedback by ID"""
    feedback = await feedback_collection.find_one({"id": feedback_id})
    
    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback not found"
        )
    
    return Feedback(**{k: v for k, v in feedback.items() if k != "_id"})

@router.get("/event/{event_id}/stats")
async def get_feedback_stats(event_id: str):
    """Get feedback statistics for an event"""
    pipeline = [
        {"$match": {"event_id": event_id}},
        {
            "$group": {
                "_id": None,
                "total_count": {"$sum": 1},
                "average_rating": {"$avg": "$rating"},
                "ratings": {"$push": "$rating"},
                "sentiments": {"$push": "$ai_sentiment"}
            }
        }
    ]
    
    result = await feedback_collection.aggregate(pipeline).to_list(1)
    
    if not result:
        return {
            "total_count": 0,
            "average_rating": 0,
            "rating_distribution": {},
            "sentiment_distribution": {}
        }
    
    data = result[0]
    
    return {
        "total_count": data["total_count"],
        "average_rating": round(data["average_rating"], 2),
        "rating_distribution": {
            "5_star": data["ratings"].count(5),
            "4_star": data["ratings"].count(4),
            "3_star": data["ratings"].count(3),
            "2_star": data["ratings"].count(2),
            "1_star": data["ratings"].count(1)
        },
        "sentiment_distribution": {
            "positive": data["sentiments"].count("positive"),
            "neutral": data["sentiments"].count("neutral"),
            "negative": data["sentiments"].count("negative")
        }
    }

@router.get("/event/{event_id}/recent", response_model=List[Feedback])
async def get_recent_feedback(event_id: str, limit: int = 10):
    """Get recent feedback for an event"""
    feedbacks = await feedback_collection.find(
        {"event_id": event_id}
    ).sort("submitted_at", -1).limit(limit).to_list(limit)
    
    return [Feedback(**{k: v for k, v in feedback.items() if k != "_id"}) for feedback in feedbacks]
