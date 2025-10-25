"""
Pytest Configuration and Shared Fixtures
"""

import pytest
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session", autouse=True)
async def setup_test_database():
    """Setup and teardown test database"""
    # Connect to test database
    client = AsyncIOMotorClient(settings.mongo_url)
    db = client[settings.db_name]
    
    yield db
    
    # Cleanup: Drop test collections after all tests
    # Uncomment the following lines if you want to clean up after tests
    # for collection_name in await db.list_collection_names():
    #     await db[collection_name].drop()
    
    client.close()


@pytest.fixture(autouse=True)
async def reset_database_state(setup_test_database):
    """Reset database state before each test if needed"""
    # This runs before each test
    yield
    # Cleanup code can go here if needed
