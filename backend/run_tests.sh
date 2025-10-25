#!/bin/bash

# Crowd Management System - Test Execution Script
# This script runs all pytest tests and generates a comprehensive report

echo "=========================================="
echo "Crowd Management System - API Test Suite"
echo "=========================================="
echo ""

# Check if pytest is installed
if ! command -v pytest &> /dev/null
then
    echo "❌ pytest not found. Installing required packages..."
    pip install pytest pytest-asyncio httpx
fi

# Set environment variables for testing
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
export TESTING=true

echo "🔧 Starting test execution..."
echo ""

# Run tests with detailed output and generate reports
pytest test_api.py \
    -v \
    --tb=short \
    --color=yes \
    --maxfail=5 \
    -W ignore::DeprecationWarning \
    | tee test_output.txt

# Capture exit code
TEST_EXIT_CODE=$?

echo ""
echo "=========================================="

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ All tests passed successfully!"
else
    echo "❌ Some tests failed. Check test_output.txt for details."
fi

echo "=========================================="
echo ""
echo "📊 Test results saved to: test_output.txt"
echo ""

# Generate test summary report
python3 << EOF
import re
from datetime import datetime

# Read test output
try:
    with open('test_output.txt', 'r') as f:
        content = f.read()
    
    # Extract test results
    passed = len(re.findall(r'PASSED', content))
    failed = len(re.findall(r'FAILED', content))
    errors = len(re.findall(r'ERROR', content))
    skipped = len(re.findall(r'SKIPPED', content))
    total = passed + failed + errors + skipped
    
    # Generate summary report
    report = f"""
╔══════════════════════════════════════════════════════════╗
║          TEST EXECUTION SUMMARY REPORT                   ║
╚══════════════════════════════════════════════════════════╝

📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
📦 Project: Crowd Management System Backend API

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEST RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Tests:    {total}
✅ Passed:      {passed}
❌ Failed:      {failed}
⚠️  Errors:      {errors}
⏭️  Skipped:     {skipped}

Success Rate:   {(passed/total*100) if total > 0 else 0:.2f}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: {"✅ ALL TESTS PASSED" if failed == 0 and errors == 0 else "❌ TESTS FAILED"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
    
    print(report)
    
    # Save summary to file
    with open('TEST_SUMMARY.txt', 'w') as f:
        f.write(report)
    
    print("📄 Summary report saved to: TEST_SUMMARY.txt")
    
except FileNotFoundError:
    print("⚠️  Could not generate summary report - test output file not found")
EOF

exit $TEST_EXIT_CODE
