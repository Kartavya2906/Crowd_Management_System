from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routes import auth, events, crowd_density, medical_emergencies, lost_person, feedback, facilities, alerts
from database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting Crowd Management System API...")
    await init_db()
    yield
    # Shutdown
    print("👋 Shutting down Crowd Management System API...")

app = FastAPI(
    title="Crowd Management System API",
    description="Comprehensive API for managing crowds, events, emergencies, and facilities",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(auth.router)
app.include_router(events.router)
app.include_router(crowd_density.router)
app.include_router(medical_emergencies.router)
app.include_router(lost_person.router)
app.include_router(feedback.router)
app.include_router(facilities.router)
app.include_router(alerts.router)

@app.get("/", tags=["Root"])
def home():
    return {
        "message": "Welcome to Crowd Management System API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "Crowd Management System API"
    }
