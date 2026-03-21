# Putting Performance App

A mobile-friendly practice app for recording and analysing putting drills.

## Purpose
This app helps golfers:
- select a putting drill,
- record results quickly on a practice green,
- calculate scores automatically,
- save session history,
- review trends over time.

## MVP stack
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: FastAPI + SQLite
- Charts: Recharts (added in a later phase)

## Project structure
```
frontend/   # React + Vite + Tailwind
backend/    # FastAPI + SQLite
docs/       # product guide and implementation docs
```

## Run locally

**Prerequisites:** Node.js 18+ and Python 3.11+.

### Quick reference – exact commands

| Action | Command |
|--------|---------|
| **Backend** | `cd backend` → `.\.venv\Scripts\activate` → `pip install -r requirements.txt` → `uvicorn app.main:app --reload --host 127.0.0.1 --port 8000` |
| **Frontend** | `cd frontend` → `npm install` → `npm run dev` |
| **Backend tests** | `cd backend` → `.\.venv\Scripts\activate` → `pytest tests/ -v` |
| **Frontend build** | `cd frontend` → `npm run build` |

### Backend (terminal 1)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- API: http://127.0.0.1:8000  
- Interactive docs: http://127.0.0.1:8000/docs  
- SQLite: `backend/putting.db` (created on first run)

### Frontend (terminal 2)

```powershell
cd frontend
npm install
npm run dev
```

- App: http://localhost:5173  

**Start the backend first** so the Dashboard health check passes.  
Optional: set `VITE_API_BASE` in `frontend/.env` if the API is elsewhere (e.g. `VITE_API_BASE=http://127.0.0.1:8000`).

### Tests

**Backend (PowerShell):**
```powershell
cd backend
.\.venv\Scripts\activate
pytest tests/ -v
```

**Backend (bash):**
```bash
cd backend
source .venv/bin/activate
pytest tests/ -v
```

**Frontend build:**
```powershell
cd frontend
npm run build
```

**All tests (from project root):**
```powershell
# Backend
cd backend && .\.venv\Scripts\activate && pytest tests/ -v && cd ..

# Frontend
cd frontend && npm run build && cd ..
```

### CORS
The backend allows `http://localhost:5173` and `http://127.0.0.1:5173` for browser requests from Vite.

---

## Deploy (free: Render + Vercel)

**Prerequisites:** GitHub account, [Render](https://render.com) account, [Vercel](https://vercel.com) account.

### Step 1: Push to GitHub

1. Create a new repo on GitHub (e.g. `putting-performance-app`).
2. Push this project to it.
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/putting-performance-app.git
   git push -u origin main
   ```

### Step 2: Deploy backend on Render

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**.
2. **Connect** your GitHub repo (authorize if needed).
3. Set:
   - **Name:** `putting-performance-api`
   - **Region:** Oregon (or nearest)
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Click **Advanced** → **Add Environment Variable**:
   - **Key:** `CORS_ORIGINS`
   - **Value:** `https://putting-performance-app.vercel.app`  
     *(Use the same name you’ll give the Vercel project in Step 3.)*
5. Click **Create Web Service**. Wait for the deploy to finish.
6. Copy the URL at the top (e.g. `https://putting-performance-api.onrender.com`).

### Step 3: Deploy frontend on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) → **Import** your GitHub repo.
2. Before deploying, click **Edit** next to **Root Directory**:
   - Set to `frontend` and confirm.
3. Under **Environment Variables**, add:
   - **Name:** `VITE_API_BASE`
   - **Value:** paste your Render URL from Step 2 (e.g. `https://putting-performance-api.onrender.com`)
   - **Environment:** Production
4. Click **Deploy**. Wait for it to finish.
5. Copy your app URL (e.g. `https://putting-performance-app.vercel.app`).

### Step 4: Fix CORS (if needed)

If your Vercel URL is different from `https://putting-performance-app.vercel.app`:

1. Render Dashboard → your service → **Environment**.
2. Edit `CORS_ORIGINS` to your exact Vercel URL (e.g. `https://putting-performance-app-xxxx.vercel.app`).
3. **Manual Deploy** → **Deploy latest commit**.

---

**Notes:**
- Render free tier sleeps after ~15 min; first load after sleep can take 30–60 seconds.
- SQLite data resets on deploy or service restart.
- Add to iPhone: Safari → your app URL → Share → Add to Home Screen.

---

## Main documentation
- `docs/product-guide.md` – product and drill specification
- `AGENTS.md` – Cursor build instructions
- `.cursor/rules/app-architecture.mdc` – persistent architecture rules

## Cursor workflow
1. Open this folder in Cursor
2. Read `AGENTS.md`
3. Read `docs/product-guide.md`
4. Paste the master prompt from `docs/cursor-prompt-pack.md`
5. Let Cursor scaffold the MVP in phases

## MVP features (roadmap)
- Drill Library
- Drill Detail pages
- Session Entry
- Session Summary
- History
- Analytics
- Backend scoring engine
- SQLite persistence

## Notes
- MVP only — no auth, Docker, CI/CD, or cloud sync in Phase 1
- Session scoring will be computed on the server; the frontend will not duplicate scoring logic
