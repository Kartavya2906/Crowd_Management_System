# 🧪 Quick Start: Running API Tests

## Installation

```bash
# Navigate to backend directory
cd /Users/mayanksoni/Desktop/crowd/Crowd_Management_System/backend

# Install testing dependencies
pip install pytest pytest-asyncio httpx
```

## Run Tests

### Option 1: Automated Script (Recommended)
```bash
./run_tests.sh
```
This will automatically:
- ✅ Check dependencies
- ✅ Run all 56 tests
- ✅ Generate reports
- ✅ Show summary

### Option 2: Direct pytest
```bash
# Run all tests with verbose output
pytest test_api.py -v

# Run specific module tests
pytest test_api.py::TestAuthentication -v
pytest test_api.py::TestEvents -v
pytest test_api.py::TestCrowdDensity -v

# Run single test
pytest test_api.py::TestAuthentication::test_register_public_user -v
```

### Option 3: Python
```bash
python test_api.py
```

## View Results

After running tests, check these files:
- **test_output.txt** - Complete test log
- **TEST_SUMMARY.txt** - Quick summary
- **TEST_FINAL_REPORT.md** - Comprehensive report
- **TEST_DOCUMENTATION.md** - Full documentation

## Expected Output

```
✅ Total Tests:     56
✅ Passed:          56
❌ Failed:          0
⚠️  Errors:          0

Success Rate:       100%
Status:             ALL TESTS PASSED
```

## Test Modules

1. **Authentication** (9 tests) - User registration, login
2. **Events** (9 tests) - Event CRUD, status management
3. **Crowd Density** (6 tests) - Real-time monitoring
4. **Medical Emergencies** (6 tests) - Emergency reporting
5. **Lost Persons** (6 tests) - Missing person tracking
6. **Feedback** (5 tests) - User feedback with AI sentiment
7. **Facilities** (6 tests) - Facility management
8. **Alerts** (7 tests) - Alert & weather notifications
9. **System** (2 tests) - Health checks

## Troubleshooting

### Import Errors
```bash
pip install pytest pytest-asyncio httpx
```

### Database Connection Issues
Ensure MongoDB is running:
```bash
# Check MongoDB status
mongosh --eval "db.version()"
```

### Permission Denied
```bash
chmod +x run_tests.sh
```

## Next Steps

1. Run tests: `./run_tests.sh`
2. Review results: Check TEST_SUMMARY.txt
3. Fix any failures (if any)
4. Deploy with confidence! 🚀

---

**Need Help?**
- See TEST_DOCUMENTATION.md for detailed guide
- Check TEST_FINAL_REPORT.md for full test results
