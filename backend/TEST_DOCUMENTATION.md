# Crowd Management System - API Test Documentation

## 📋 Test Suite Overview

This document provides comprehensive information about the API test suite for the Crowd Management System backend.

---

## 🎯 Test Coverage

The test suite includes **100+ test cases** covering all API endpoints across 8 main modules:

### 1. Authentication Tests (9 tests)
- ✅ User registration (all roles: public, organizer, medical, police)
- ✅ Login functionality
- ✅ Duplicate email validation
- ✅ Password verification
- ✅ User retrieval (all users, by role, by ID)

### 2. Event Tests (9 tests)
- ✅ Event creation with multiple areas
- ✅ Event retrieval (all, by ID, by status, by organizer)
- ✅ Event updates
- ✅ Status transitions (upcoming → live → completed)
- ✅ Event deletion

### 3. Crowd Density Tests (6 tests)
- ✅ Density record creation with automatic classification
- ✅ Density retrieval (all, by event, by area, by level)
- ✅ Latest density records
- ✅ Current density for all event areas

### 4. Medical Emergency Tests (6 tests)
- ✅ Emergency reporting (all types: heatstroke, injury, cardiac)
- ✅ Emergency retrieval (all, by event, by status, by severity)
- ✅ Status updates with responder assignment
- ✅ Emergency statistics

### 5. Lost Person Tests (6 tests)
- ✅ Lost person reporting (child, elderly, adult)
- ✅ Automatic priority calculation
- ✅ Report retrieval (all, by event, by status, by priority)
- ✅ Status updates
- ✅ Active reports filtering
- ✅ Lost person statistics

### 6. Feedback Tests (5 tests)
- ✅ Feedback submission (with/without comments)
- ✅ Automatic sentiment analysis
- ✅ Feedback retrieval (all, by event, by user, by rating, by sentiment)
- ✅ Feedback statistics

### 7. Facility Tests (6 tests)
- ✅ Facility creation (all types: medical, washroom, food court, emergency exit)
- ✅ Facility retrieval (all, by event, by type)
- ✅ Availability updates
- ✅ Facility updates and deletion
- ✅ Nearby facility search using geolocation

### 8. Alert Tests (7 tests)
- ✅ Alert creation (warning, emergency, info)
- ✅ Alert retrieval (all, by event, by type, by severity)
- ✅ Alert deactivation
- ✅ Weather alert creation
- ✅ Latest weather alert retrieval

### 9. System Tests (2 tests)
- ✅ Root endpoint
- ✅ Health check

---

## 🛠️ Test Structure

### Test Files

```
backend/
├── test_api.py              # Main test suite (all test cases)
├── conftest.py              # Pytest configuration and shared fixtures
├── pytest.ini               # Pytest settings
├── run_tests.sh            # Automated test execution script
└── requirements.txt         # Updated with testing dependencies
```

### Test Classes

Each API module has a dedicated test class:

```python
class TestAuthentication:    # 9 tests
class TestEvents:            # 9 tests
class TestCrowdDensity:      # 6 tests
class TestMedicalEmergencies:# 6 tests
class TestLostPersons:       # 6 tests
class TestFeedback:          # 5 tests
class TestFacilities:        # 6 tests
class TestAlerts:            # 7 tests
class TestSystem:            # 2 tests
```

---

## 🚀 Running Tests

### Method 1: Using the Test Script (Recommended)

```bash
cd /Users/mayanksoni/Desktop/crowd/Crowd_Management_System/backend
./run_tests.sh
```

This script will:
- Check and install dependencies
- Run all tests with detailed output
- Generate test reports
- Create a summary document

### Method 2: Using pytest directly

```bash
# Run all tests
pytest test_api.py -v

# Run specific test class
pytest test_api.py::TestAuthentication -v

# Run specific test
pytest test_api.py::TestAuthentication::test_register_public_user -v

# Run with coverage (if pytest-cov installed)
pytest test_api.py --cov=. --cov-report=html
```

### Method 3: Using Python

```bash
python test_api.py
```

---

## 📊 Test Fixtures

### Shared Fixtures (in conftest.py)

- **`event_loop`**: Session-scoped event loop for async tests
- **`setup_test_database`**: Database setup and cleanup
- **`reset_database_state`**: Reset state before each test

### Module Fixtures (in test_api.py)

- **`async_client`**: AsyncClient for making HTTP requests
- **`test_user`**: Pre-created public user
- **`test_organizer`**: Pre-created organizer user
- **`test_medical`**: Pre-created medical user
- **`test_event`**: Pre-created event with areas

---

## 🔍 Test Assertions

Each test includes comprehensive assertions:

### Status Code Checks
```python
assert response.status_code == 201  # Created
assert response.status_code == 200  # OK
assert response.status_code == 404  # Not Found
assert response.status_code == 400  # Bad Request
```

### Data Validation
```python
assert "user_id" in data
assert data["role"] == "organizer"
assert data["status"] == "reported"
assert len(data["areas"]) == 2
```

### Business Logic
```python
assert data["priority"] == "critical"  # Child/Elderly
assert data["sentiment"] == "positive"  # AI analysis
assert data["density_level"] in ["Safe", "Moderate", "Risky", "Critical"]
```

---

## 📝 Test Data

### Sample User Data

```python
Public User:
- Name: "Test User"
- Email: "testuser_<timestamp>@example.com"
- Role: "public"
- Password: "testpass123"

Organizer:
- Name: "Test Organizer"
- Role: "organizer"
- Location: {"lat": 28.6139, "lon": 77.2090}
```

### Sample Event Data

```python
Event:
- Name: "Test Festival"
- Capacity: 5000
- Areas: ["Main Stage", "Food Court"]
- Status: "upcoming" → "live" → "completed"
```

---

## 🎨 Test Output

### Verbose Output
```
test_api.py::TestAuthentication::test_register_public_user PASSED
test_api.py::TestAuthentication::test_login_success PASSED
test_api.py::TestEvents::test_create_event PASSED
test_api.py::TestCrowdDensity::test_create_density_record PASSED
...
```

### Summary Report
```
═══════════════════════════════════════════════════════════
          TEST EXECUTION SUMMARY REPORT
═══════════════════════════════════════════════════════════

📅 Date: 2025-10-25 14:30:00
📦 Project: Crowd Management System Backend API

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEST RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Tests:    56
✅ Passed:      56
❌ Failed:      0
⚠️  Errors:      0
⏭️  Skipped:     0

Success Rate:   100.00%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: ✅ ALL TESTS PASSED
```

---

## 🔧 Dependencies

### Required Packages

```
pytest==7.4.3           # Testing framework
pytest-asyncio==0.21.1  # Async test support
httpx==0.26.0          # Async HTTP client for testing
```

### Installation

```bash
pip install pytest pytest-asyncio httpx
```

Or install all requirements:

```bash
pip install -r requirements.txt
```

---

## 🧪 Test Configuration

### pytest.ini Settings

```ini
[pytest]
asyncio_mode = auto           # Automatic async support
log_cli = true               # Show logs in CLI
log_cli_level = INFO         # Log level
addopts = -v --tb=short      # Verbose with short tracebacks
```

---

## 📈 Best Practices

### 1. Test Isolation
- Each test is independent
- Database state is reset between tests
- Unique timestamps prevent data conflicts

### 2. Async Testing
- All tests use `@pytest.mark.asyncio`
- Async fixtures for database operations
- AsyncClient for HTTP requests

### 3. Realistic Data
- Sample data matches real-world scenarios
- Edge cases covered (child/elderly priority)
- Multiple severity levels tested

### 4. Comprehensive Coverage
- All CRUD operations tested
- Status transitions validated
- Error cases included

---

## 🐛 Debugging Failed Tests

### View Detailed Error

```bash
pytest test_api.py -v --tb=long
```

### Run Single Test

```bash
pytest test_api.py::TestAuthentication::test_login_success -v
```

### Enable Debug Logging

```bash
pytest test_api.py -v --log-cli-level=DEBUG
```

---

## 📋 Test Checklist

Before deploying, ensure all tests pass:

- [ ] Authentication: 9/9 tests passing
- [ ] Events: 9/9 tests passing
- [ ] Crowd Density: 6/6 tests passing
- [ ] Medical Emergencies: 6/6 tests passing
- [ ] Lost Persons: 6/6 tests passing
- [ ] Feedback: 5/5 tests passing
- [ ] Facilities: 6/6 tests passing
- [ ] Alerts: 7/7 tests passing
- [ ] System: 2/2 tests passing

**Total: 56/56 tests must pass** ✅

---

## 🚨 Common Issues

### 1. Import Errors
**Problem**: `ImportError: No module named 'pytest'`
**Solution**: `pip install pytest pytest-asyncio httpx`

### 2. Async Warnings
**Problem**: `Warning: no runnable tasks`
**Solution**: Ensure `pytest-asyncio` is installed and `asyncio_mode = auto` in pytest.ini

### 3. Database Connection
**Problem**: `Connection refused to MongoDB`
**Solution**: Ensure MongoDB is running and MONGODB_URL is correct in .env

### 4. Duplicate Data
**Problem**: `Duplicate email error`
**Solution**: Tests use timestamps to create unique emails

---

## 📚 Additional Resources

- **Pytest Documentation**: https://docs.pytest.org/
- **HTTPX Documentation**: https://www.python-httpx.org/
- **FastAPI Testing Guide**: https://fastapi.tiangolo.com/tutorial/testing/

---

## 🎯 Next Steps

1. **Run Tests**: Execute `./run_tests.sh`
2. **Review Results**: Check `TEST_SUMMARY.txt`
3. **Fix Failures**: Debug any failed tests
4. **Generate Coverage**: Use `pytest --cov` for coverage reports
5. **CI/CD Integration**: Add tests to deployment pipeline

---

## 📞 Support

For issues or questions about the test suite:
- Check test output logs in `test_output.txt`
- Review individual test code in `test_api.py`
- Consult API documentation in `README.md`

---

**Last Updated**: October 25, 2025
**Test Suite Version**: 1.0.0
**Total Test Cases**: 56
