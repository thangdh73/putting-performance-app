# AGENTS.md

## Project
Build a mobile-friendly putting performance app based on the documentation in `docs/product-guide.md`.

## Main goal
Create an MVP that helps golfers:
- choose a drill,
- record results quickly,
- score the drill automatically,
- save session history,
- review trends over time.

## Tech stack
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: FastAPI + SQLite
- Charts: Recharts
- API style: REST
- Data validation: Pydantic
- Backend modelling: SQLModel or SQLAlchemy

## Architecture
- `frontend/` handles UI, navigation, forms, charts, and API calls
- `backend/` handles business logic, persistence, scoring rules, and analytics
- scoring logic must live in backend services, not duplicated in frontend
- drill definitions should be config-driven where practical

## MVP scope
Implement only:
1. Drill Library
2. Drill Detail page
3. Session Entry for supported drills
4. Session Summary
5. History page
6. Analytics page
7. Backend scoring engine
8. SQLite persistence

## Explicitly out of scope for MVP
Do not add unless explicitly requested:
- authentication
- social features
- cloud sync
- subscriptions
- payment
- push notifications
- smartwatch integration
- AI coaching
- strokes gained calculation tables beyond placeholder support
- Docker
- CI/CD
- deployment

## Supported drills
The app must support:
1. Broadie 5 ft
2. Broadie 10 ft
3. Broadie 15 ft
4. 100 ft Performance Drill
5. 4–8 ft Performance Drill
6. 9-Hole Strokes Gained Drill
7. 18-Hole Strokes Gained Drill

## Backend requirements
Create clear models for:
- User
- Drill
- Session
- Attempt

Use:
- typed schemas
- service modules
- pure functions for scoring where possible
- simple REST endpoints
- seed data for drill definitions

## Frontend requirements
Build these pages first:
- Dashboard
- Drill Library
- Drill Detail
- Session Entry
- Session Summary
- History
- Analytics

UI requirements:
- mobile-friendly
- large buttons
- fast session entry
- minimal typing during drills
- simple card layout
- clean readable charts

## Coding rules
- TypeScript strict mode
- small focused components
- readable filenames
- avoid unnecessary abstraction
- keep the code modular and maintainable
- prefer explicit types
- avoid magic numbers
- write tests for scoring logic
- use comments only where logic is not obvious

## Workflow rules
Before writing code:
1. read `AGENTS.md`
2. read `docs/product-guide.md`
3. read `README.md`

For large tasks:
- first produce a concise plan
- then implement in phases
- summarise files created/changed after each phase

## Safety rails
- do not rewrite the whole codebase unless asked
- do not change unrelated files
- do not invent requirements not present in the docs
- do not add complex dependencies unless clearly justified
- do not duplicate scoring logic across frontend and backend

## Quality bar
The generated app should:
- run locally,
- be easy to understand,
- be easy to extend,
- use realistic folder structure,
- be stable for MVP workflows.
