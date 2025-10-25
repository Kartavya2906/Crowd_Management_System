#!/usr/bin/env python3
"""
Crowd Management System - Backend Verification Script
This script verifies the backend setup and dependencies
"""

import sys
import subprocess
from pathlib import Path

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print('='*60)

def check_python_version():
    print_section("Checking Python Version")
    version = sys.version_info
    print(f"Python version: {version.major}.{version.minor}.{version.micro}")
    if version.major >= 3 and version.minor >= 8:
        print("✅ Python version is compatible (3.8+)")
        return True
    else:
        print("❌ Python 3.8 or higher is required")
        return False

def check_file_structure():
    print_section("Checking File Structure")
    required_files = [
        "main.py",
        "models.py",
        "database.py",
        "config.py",
        "requirements.txt",
        ".env.example",
        "routes/auth.py",
        "routes/events.py",
        "routes/crowd_density.py",
        "routes/medical_emergencies.py",
        "routes/lost_person.py",
        "routes/feedback.py",
        "routes/facilities.py",
        "routes/alerts.py",
    ]
    
    all_exist = True
    for file in required_files:
        file_path = Path(file)
        if file_path.exists():
            print(f"✅ {file}")
        else:
            print(f"❌ {file} - MISSING")
            all_exist = False
    
    return all_exist

def check_mongodb():
    print_section("Checking MongoDB")
    try:
        result = subprocess.run(
            ["mongod", "--version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            version_line = result.stdout.split('\n')[0]
            print(f"✅ MongoDB installed: {version_line}")
            return True
        else:
            print("⚠️  MongoDB not found or not in PATH")
            print("Please install MongoDB: https://www.mongodb.com/try/download/community")
            return False
    except FileNotFoundError:
        print("⚠️  MongoDB not found")
        print("Please install MongoDB: https://www.mongodb.com/try/download/community")
        return False
    except Exception as e:
        print(f"⚠️  Could not check MongoDB: {e}")
        return False

def check_env_file():
    print_section("Checking Environment Configuration")
    if Path(".env").exists():
        print("✅ .env file exists")
        return True
    else:
        print("⚠️  .env file not found")
        print("Run: cp .env.example .env")
        print("Then edit .env with your configuration")
        return False

def check_dependencies():
    print_section("Checking Dependencies")
    try:
        import fastapi
        print(f"✅ FastAPI installed (version {fastapi.__version__})")
    except ImportError:
        print("❌ FastAPI not installed")
        
    try:
        import motor
        print(f"✅ Motor installed")
    except ImportError:
        print("❌ Motor not installed")
        
    try:
        import pydantic
        print(f"✅ Pydantic installed")
    except ImportError:
        print("❌ Pydantic not installed")
    
    print("\nTo install all dependencies, run:")
    print("  pip install -r requirements.txt")

def print_next_steps():
    print_section("Next Steps")
    print("""
1. Install dependencies (if not already installed):
   pip install -r requirements.txt

2. Create .env file (if not exists):
   cp .env.example .env
   
3. Make sure MongoDB is running:
   mongod

4. Start the backend server:
   ./start.sh
   OR
   uvicorn main:app --reload

5. Access API documentation:
   http://localhost:8000/docs

6. Run tests:
   See API_TESTING.md for example API calls
""")

def main():
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║   Crowd Management System - Backend Verification          ║
    ║   Checking setup and requirements...                      ║
    ╚═══════════════════════════════════════════════════════════╝
    """)
    
    checks = {
        "Python Version": check_python_version(),
        "File Structure": check_file_structure(),
        "MongoDB": check_mongodb(),
        "Environment File": check_env_file(),
    }
    
    check_dependencies()
    
    print_section("Summary")
    passed = sum(checks.values())
    total = len(checks)
    
    for check, result in checks.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{check:.<40} {status}")
    
    print(f"\nPassed: {passed}/{total} checks")
    
    if passed == total:
        print("\n🎉 All checks passed! Your backend is ready to run.")
    else:
        print("\n⚠️  Some checks failed. Please fix the issues above.")
    
    print_next_steps()

if __name__ == "__main__":
    main()
