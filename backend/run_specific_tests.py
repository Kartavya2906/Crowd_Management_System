"""
Example: Running specific tests from the test suite
This script demonstrates how to run tests programmatically
"""

import subprocess
import sys


def run_all_tests():
    """Run all tests"""
    print("🧪 Running all tests...")
    result = subprocess.run(
        ["pytest", "test_api.py", "-v"],
        capture_output=True,
        text=True
    )
    print(result.stdout)
    return result.returncode


def run_module_tests(module_name):
    """Run tests for a specific module"""
    print(f"🧪 Running {module_name} tests...")
    result = subprocess.run(
        ["pytest", f"test_api.py::Test{module_name}", "-v"],
        capture_output=True,
        text=True
    )
    print(result.stdout)
    return result.returncode


def run_single_test(test_class, test_name):
    """Run a single test"""
    print(f"🧪 Running {test_class}::{test_name}...")
    result = subprocess.run(
        ["pytest", f"test_api.py::{test_class}::{test_name}", "-v"],
        capture_output=True,
        text=True
    )
    print(result.stdout)
    return result.returncode


def main():
    """Main function"""
    print("=" * 60)
    print("Crowd Management System - Test Runner")
    print("=" * 60)
    print()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "all":
            return run_all_tests()
        
        elif command == "auth":
            return run_module_tests("Authentication")
        
        elif command == "events":
            return run_module_tests("Events")
        
        elif command == "density":
            return run_module_tests("CrowdDensity")
        
        elif command == "medical":
            return run_module_tests("MedicalEmergencies")
        
        elif command == "lost":
            return run_module_tests("LostPersons")
        
        elif command == "feedback":
            return run_module_tests("Feedback")
        
        elif command == "facilities":
            return run_module_tests("Facilities")
        
        elif command == "alerts":
            return run_module_tests("Alerts")
        
        elif command == "system":
            return run_module_tests("System")
        
        else:
            print(f"Unknown command: {command}")
            print()
            print("Available commands:")
            print("  python run_specific_tests.py all         - Run all tests")
            print("  python run_specific_tests.py auth        - Run authentication tests")
            print("  python run_specific_tests.py events      - Run event tests")
            print("  python run_specific_tests.py density     - Run crowd density tests")
            print("  python run_specific_tests.py medical     - Run medical emergency tests")
            print("  python run_specific_tests.py lost        - Run lost person tests")
            print("  python run_specific_tests.py feedback    - Run feedback tests")
            print("  python run_specific_tests.py facilities  - Run facility tests")
            print("  python run_specific_tests.py alerts      - Run alert tests")
            print("  python run_specific_tests.py system      - Run system tests")
            return 1
    else:
        # Default: run all tests
        return run_all_tests()


if __name__ == "__main__":
    sys.exit(main())
