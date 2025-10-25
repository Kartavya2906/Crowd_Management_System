from fastapi import APIRouter, HTTPException, status
from typing import List
from datetime import datetime
import hashlib
import secrets

from models import UserCreate, UserResponse, UserLogin
from database import database

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Collections
users_collection = database["users"]

def hash_password(password: str) -> str:
    """Simple password hashing (use bcrypt in production)"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_user_id() -> str:
    """Generate unique user ID"""
    return f"USR{secrets.token_hex(6).upper()}"

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    """Register a new user"""
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user document
    user_dict = user.model_dump(exclude={"password"})
    user_dict["id"] = generate_user_id()
    user_dict["password_hash"] = hash_password(user.password)
    user_dict["created_at"] = datetime.utcnow()
    
    # Convert Location to dict if present
    if user_dict.get("location"):
        user_dict["location"] = dict(user_dict["location"])
    
    await users_collection.insert_one(user_dict)
    
    # Return user response without password
    return UserResponse(**{k: v for k, v in user_dict.items() if k != "password_hash"})

@router.post("/login")
async def login_user(credentials: UserLogin):
    """Login user and return user info"""
    user = await users_collection.find_one({"email": credentials.email})
    
    if not user or user.get("password_hash") != hash_password(credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Return user info without password
    user_response = {k: v for k, v in user.items() if k not in ["password_hash", "_id"]}
    return {
        "message": "Login successful",
        "user": UserResponse(**user_response)
    }

@router.get("/users", response_model=List[UserResponse])
async def get_all_users(role: str = None):
    """Get all users, optionally filtered by role"""
    query = {}
    if role:
        query["role"] = role
    
    users = await users_collection.find(query).to_list(1000)
    return [UserResponse(**{k: v for k, v in user.items() if k not in ["password_hash", "_id"]}) for user in users]

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    """Get user by ID"""
    user = await users_collection.find_one({"id": user_id})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(**{k: v for k, v in user.items() if k not in ["password_hash", "_id"]})
