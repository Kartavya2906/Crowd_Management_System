from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "crowd_management_system")

# Initialize MongoDB client
client = AsyncIOMotorClient(MONGO_URL)
database = client[DB_NAME]

# Create indexes for better performance
async def create_indexes():
    """Create database indexes"""
    # Users collection
    await database["users"].create_index("email", unique=True)
    await database["users"].create_index("id", unique=True)
    
    # Events collection
    await database["events"].create_index("id", unique=True)
    await database["events"].create_index("organizer_id")
    await database["events"].create_index("status")
    
    # Crowd density collection
    await database["crowd_density"].create_index("id", unique=True)
    await database["crowd_density"].create_index("event_id")
    await database["crowd_density"].create_index("timestamp")
    
    # Medical emergencies collection
    await database["medical_emergencies"].create_index("id", unique=True)
    await database["medical_emergencies"].create_index("event_id")
    await database["medical_emergencies"].create_index("status")
    
    # Lost persons collection
    await database["lost_persons"].create_index("id", unique=True)
    await database["lost_persons"].create_index("event_id")
    await database["lost_persons"].create_index("status")
    
    # Feedback collection
    await database["feedback"].create_index("id", unique=True)
    await database["feedback"].create_index("event_id")
    await database["feedback"].create_index("user_id")
    
    # Facilities collection
    await database["facilities"].create_index("id", unique=True)
    await database["facilities"].create_index("event_id")
    await database["facilities"].create_index("type")
    
    # Alerts collection
    await database["alerts"].create_index("id", unique=True)
    await database["alerts"].create_index("event_id")
    await database["alerts"].create_index("is_active")
    
    # Weather alerts collection
    await database["weather_alerts"].create_index("id", unique=True)
    await database["weather_alerts"].create_index("event_id")

# Call this function on startup
async def init_db():
    """Initialize database and create indexes"""
    try:
        await create_indexes()
        print("✅ Database indexes created successfully")
    except Exception as e:
        print(f"⚠️  Error creating indexes: {e}")

