# System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CROWD MANAGEMENT SYSTEM                              │
│                         Backend Architecture                                 │
└─────────────────────────────────────────────────────────────────────────────┘

                                   FRONTEND
                    ┌──────────────────────────────────┐
                    │   React/TypeScript Frontend      │
                    │   - Dashboard                    │
                    │   - Events Management            │
                    │   - Emergency Response           │
                    │   - Lost Persons Tracking        │
                    │   - Feedback Reports             │
                    └────────────┬─────────────────────┘
                                 │
                                 │ HTTP/REST API
                                 │ JSON
                                 ▼
                    ┌────────────────────────────────┐
                    │         FASTAPI SERVER         │
                    │      (main.py - Port 8000)     │
                    │                                │
                    │   ┌────────────────────────┐   │
                    │   │   CORS Middleware      │   │
                    │   └────────────────────────┘   │
                    │   ┌────────────────────────┐   │
                    │   │   Error Handling       │   │
                    │   └────────────────────────┘   │
                    │   ┌────────────────────────┐   │
                    │   │   Validation (Pydantic)│   │
                    │   └────────────────────────┘   │
                    └────────────┬───────────────────┘
                                 │
                    ┌────────────┴───────────────┐
                    │                            │
         ┌──────────▼─────────┐    ┌────────────▼──────────┐
         │   API ROUTERS      │    │   DATA MODELS         │
         │   (8 Modules)      │    │   (models.py)         │
         │                    │    │                       │
         │ • auth.py          │◄───┤ • User Models         │
         │ • events.py        │    │ • Event Models        │
         │ • crowd_density.py │    │ • Crowd Models        │
         │ • medical_*.py     │    │ • Emergency Models    │
         │ • lost_person.py   │    │ • Lost Person Models  │
         │ • feedback.py      │    │ • Feedback Models     │
         │ • facilities.py    │    │ • Facility Models     │
         │ • alerts.py        │    │ • Alert Models        │
         └────────────┬───────┘    └───────────────────────┘
                      │
                      │ Motor (Async Driver)
                      │
         ┌────────────▼────────────────────┐
         │      DATABASE LAYER              │
         │      (database.py)               │
         │                                  │
         │  • AsyncIOMotorClient            │
         │  • Index Management              │
         │  • Connection Pooling            │
         └────────────┬───────────────────┘
                      │
                      ▼
         ┌─────────────────────────────────┐
         │         MONGODB                  │
         │    (crowd_management_system)     │
         │                                  │
         │  ┌──────────────────────────┐   │
         │  │ Collections:             │   │
         │  │  • users                 │   │
         │  │  • events                │   │
         │  │  • crowd_density         │   │
         │  │  • medical_emergencies   │   │
         │  │  • lost_persons          │   │
         │  │  • feedback              │   │
         │  │  • facilities            │   │
         │  │  • alerts                │   │
         │  │  • weather_alerts        │   │
         │  └──────────────────────────┘   │
         └───────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════

                            DATA FLOW DIAGRAM

   ┌────────┐                                                    ┌────────┐
   │ CLIENT │                                                    │DATABASE│
   └───┬────┘                                                    └───▲────┘
       │                                                             │
       │ 1. HTTP Request (JSON)                                     │
       ├──────────────────────────►┌──────────────┐                 │
       │                            │   FastAPI    │                 │
       │                            │   Router     │                 │
       │                            └──────┬───────┘                 │
       │                                   │                         │
       │                            2. Validate with                 │
       │                               Pydantic Models               │
       │                                   │                         │
       │                            ┌──────▼───────┐                 │
       │                            │  Business    │                 │
       │                            │    Logic     │                 │
       │                            └──────┬───────┘                 │
       │                                   │                         │
       │                            3. Database Query                │
       │                                   ├─────────────────────────┤
       │                                   │                         │
       │                            ┌──────▼───────┐                 │
       │                            │   MongoDB    │                 │
       │                            │  Operations  │                 │
       │                            └──────┬───────┘                 │
       │                                   │                         │
       │                            4. Format Response               │
       │                                   │                         │
       │ 5. HTTP Response (JSON)           │                         │
       │◄──────────────────────────────────┘                         │
       │                                                             │
   ┌───▼────┐                                                    ┌───┴────┐
   │ CLIENT │                                                    │DATABASE│
   └────────┘                                                    └────────┘


═══════════════════════════════════════════════════════════════════════════════

                        AUTHENTICATION FLOW

    ┌──────┐                                              ┌──────────┐
    │ User │                                              │ Database │
    └──┬───┘                                              └────▲─────┘
       │                                                       │
       │ 1. POST /auth/register                               │
       │    {email, password, ...}                            │
       ├────────────────────►┌──────────┐                     │
       │                     │  Validate│                     │
       │                     │  Input   │                     │
       │                     └────┬─────┘                     │
       │                          │                           │
       │                     2. Hash Password                 │
       │                          │                           │
       │                     ┌────▼─────┐                     │
       │                     │ Generate │                     │
       │                     │ User ID  │                     │
       │                     └────┬─────┘                     │
       │                          │                           │
       │                     3. Store User                    │
       │                          ├───────────────────────────┤
       │                          │                           │
       │ 4. Return User Info      │                           │
       │◄─────────────────────────┘                           │
       │                                                      │
       │ 5. POST /auth/login                                  │
       │    {email, password}                                 │
       ├────────────────────►┌──────────┐                     │
       │                     │  Find    │                     │
       │                     │  User    │◄────────────────────┤
       │                     └────┬─────┘                     │
       │                          │                           │
       │                     6. Verify Password               │
       │                          │                           │
       │ 7. Return User Data      │                           │
       │◄─────────────────────────┘                           │
       │                                                      │
    ┌──▼───┐                                              ┌────┴─────┐
    │ User │                                              │ Database │
    └──────┘                                              └──────────┘


═══════════════════════════════════════════════════════════════════════════════

                    EVENT MANAGEMENT FLOW

    Create Event → Define Areas → Monitor Crowd → Manage Emergencies
         │              │               │                  │
         ▼              ▼               ▼                  ▼
    ┌─────────┐   ┌─────────┐   ┌──────────┐      ┌─────────────┐
    │ Event   │   │ Areas   │   │  Density │      │ Emergencies │
    │ Created │──►│ Defined │──►│ Tracked  │◄────►│  Reported   │
    └─────────┘   └─────────┘   └──────────┘      └─────────────┘
         │              │               │                  │
         │              │               │                  │
         ▼              ▼               ▼                  ▼
    ┌─────────────────────────────────────────────────────────┐
    │              REAL-TIME MONITORING                       │
    │  • Crowd Density Levels                                 │
    │  • Medical Emergency Status                             │
    │  • Lost Person Reports                                  │
    │  • Facility Availability                                │
    │  • Weather Alerts                                       │
    └─────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════

                        MODULE RESPONSIBILITIES

┌─────────────────────┬──────────────────────────────────────────────────┐
│      MODULE         │              RESPONSIBILITIES                    │
├─────────────────────┼──────────────────────────────────────────────────┤
│ auth.py             │ • User registration & login                      │
│                     │ • Password hashing                               │
│                     │ • User management                                │
├─────────────────────┼──────────────────────────────────────────────────┤
│ events.py           │ • Event CRUD operations                          │
│                     │ • Area management                                │
│                     │ • Status tracking                                │
├─────────────────────┼──────────────────────────────────────────────────┤
│ crowd_density.py    │ • Density calculations                           │
│                     │ • Classification (Safe/Risky)                    │
│                     │ • Real-time monitoring                           │
├─────────────────────┼──────────────────────────────────────────────────┤
│ medical_*.py        │ • Emergency reporting                            │
│                     │ • Responder assignment                           │
│                     │ • Response time tracking                         │
├─────────────────────┼──────────────────────────────────────────────────┤
│ lost_person.py      │ • Missing person reports                         │
│                     │ • Priority calculation                           │
│                     │ • Status updates                                 │
├─────────────────────┼──────────────────────────────────────────────────┤
│ feedback.py         │ • Rating collection                              │
│                     │ • Sentiment analysis                             │
│                     │ • Statistics generation                          │
├─────────────────────┼──────────────────────────────────────────────────┤
│ facilities.py       │ • Facility CRUD                                  │
│                     │ • Location-based search                          │
│                     │ • Availability tracking                          │
├─────────────────────┼──────────────────────────────────────────────────┤
│ alerts.py           │ • Alert creation                                 │
│                     │ • Weather monitoring                             │
│                     │ • Active/inactive management                     │
└─────────────────────┴──────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════

                    TECHNOLOGY STACK OVERVIEW

    ┌───────────────────────────────────────────────────────────┐
    │                     PRESENTATION                          │
    │  React + TypeScript + Vite + TailwindCSS                  │
    └────────────────────┬──────────────────────────────────────┘
                         │ REST API (JSON)
    ┌────────────────────▼──────────────────────────────────────┐
    │                    APPLICATION                            │
    │  FastAPI + Pydantic + Python 3.8+                         │
    │  • Async/Await                                            │
    │  • Type Hints                                             │
    │  • Auto Documentation                                     │
    └────────────────────┬──────────────────────────────────────┘
                         │ Motor (Async Driver)
    ┌────────────────────▼──────────────────────────────────────┐
    │                      DATABASE                             │
    │  MongoDB + Motor                                          │
    │  • Document Store                                         │
    │  • Indexes                                                │
    │  • Aggregation                                            │
    └───────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════

                        DEPLOYMENT ARCHITECTURE

    ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
    │   Frontend   │        │   Backend    │        │   Database   │
    │              │        │              │        │              │
    │  Vite Build  │◄──────►│   FastAPI    │◄──────►│   MongoDB    │
    │  Static Files│  HTTP  │  Port 8000   │  Motor │  Port 27017  │
    │              │        │              │        │              │
    └──────────────┘        └──────────────┘        └──────────────┘
         │                       │                        │
         │                       │                        │
         ▼                       ▼                        ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                    PRODUCTION ENHANCEMENTS                   │
    │  • Nginx Reverse Proxy                                       │
    │  • SSL/TLS Certificates                                      │
    │  • Docker Containers                                         │
    │  • Load Balancing                                            │
    │  • Redis Caching                                             │
    │  • Monitoring & Logging                                      │
    └─────────────────────────────────────────────────────────────┘
```
