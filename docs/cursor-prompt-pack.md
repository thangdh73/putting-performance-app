# Cursor Prompt Pack

## Master Cursor Prompt

Paste this into Cursor Agent first:

Read these files first:
1. AGENTS.md
2. README.md
3. docs/product-guide.md
4. docs/implementation-plan.md

I want you to build the MVP of this putting performance app.

Work in phases and follow the architecture and scope exactly.

Tech stack:
- frontend: React + TypeScript + Vite + Tailwind CSS
- backend: FastAPI + SQLite
- charts: Recharts

Important constraints:
- do not add authentication
- do not add cloud sync
- do not add Docker
- do not add CI/CD
- do not add payment or social features
- do not implement full strokes gained maths yet
- do not overengineer
- keep code simple, modular, and maintainable

Implementation requirements:
1. create the project structure
2. scaffold the frontend and backend
3. implement backend models and schemas
4. implement backend scoring services
5. add drill seed data
6. build frontend pages for:
   - Dashboard
   - Drill Library
   - Drill Detail
   - Session Entry
   - Session Summary
   - History
   - Analytics
7. connect frontend to backend
8. add unit tests for scoring logic
9. ensure the app can run locally

Workflow requirements:
- before each major phase, provide a brief plan
- after each major phase, summarise which files were created or modified
- do not rewrite unrelated files
- keep frontend and backend responsibilities cleanly separated

Start with:
Phase 1: scaffold the codebase and create the minimal runnable structure.
Then stop and summarise what you created.

## Prompt 2 – Backend foundation

Continue with Phase 2.

Implement the backend foundation:
- database setup
- models for User, Drill, Session, Attempt
- Pydantic schemas
- API route structure
- drill seed data

Use SQLite and keep the code simple.
Do not implement advanced analytics yet.
At the end, summarise created and modified files.

## Prompt 3 – Scoring engine

Continue with Phase 3.

Implement scoring services for:
- Broadie base scoring
- Broadie average mode
- Broadie completion mode
- 100 ft drill
- 4–8 ft drill

Requirements:
- use pure functions where possible
- keep scoring logic in backend only
- add unit tests for all scoring cases
- do not touch frontend files unless necessary

At the end, summarise created and modified files.

## Prompt 4 – Frontend shell

Continue with Phase 4.

Implement the frontend foundation:
- app routing
- shared layout
- navigation
- page shells for:
  - Dashboard
  - Drill Library
  - Drill Detail
  - Session Entry
  - Session Summary
  - History
  - Analytics

Use Tailwind for styling.
Keep the UI simple, mobile-friendly, and clean.
At the end, summarise created and modified files.
