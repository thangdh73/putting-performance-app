# Backend (Phase 1)

FastAPI + SQLite (SQLAlchemy engine; models in Phase 2).

## Commands

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Run from the `backend/` directory so imports resolve (`app.main:app`).

## SQLite

Database file path: `backend/putting.db` (created when tables are added).
