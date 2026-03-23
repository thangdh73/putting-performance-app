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

### Before you deploy — checklist

| Item | Required |
|------|----------|
| GitHub repo with this project pushed | Yes |
| Render: set Root Directory to `backend` | Yes |
| Render: add `CORS_ORIGINS` = your Vercel URL | Yes (add after Vercel deploy) |
| Vercel: set Root Directory to `frontend` | Yes |
| Vercel: add `VITE_API_BASE` = your Render URL | Yes |
| Redeploy Vercel after changing `VITE_API_BASE` | Yes (build-time variable) |

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

### Step 4: Persistent data (players and sessions)

On Render’s free tier, the default SQLite database is ephemeral and resets when the service restarts or redeploys. To keep players and sessions:

1. Create a free PostgreSQL database:
   - **Option A – [Neon](https://neon.tech)** (recommended): Sign up → Create project → copy the connection string.
   - **Option B – [Render Postgres](https://render.com/docs/databases)**: New + → PostgreSQL → Create. Copy the **Internal Database URL** from the service’s Info tab.

2. In **Render Dashboard** → your backend service → **Environment**:
   - Add variable: **Key** `DATABASE_URL`, **Value** your Postgres connection string.
   - Save and **Redeploy** the service.

3. The backend will use Postgres instead of SQLite. Data (players, sessions) will persist across deploys and restarts.

### Step 5: Fix CORS (if needed)

If your Vercel URL is different from `https://putting-performance-app.vercel.app`:

1. Render Dashboard → your service → **Environment**.
2. Edit `CORS_ORIGINS` to your exact Vercel URL (e.g. `https://putting-performance-app-xxxx.vercel.app`).
3. **Manual Deploy** → **Deploy latest commit**.

### Step 6: Add to iPhone Home Screen

1. Open your app URL in **Safari** on iPhone.
2. Tap the **Share** button (square with arrow).
3. Scroll and tap **Add to Home Screen**.
4. Tap **Add**.

The app runs in standalone mode with a minimal browser UI. Data is stored on the server (Render); the home screen shortcut opens the same web app.

---

### Deployment notes

| Topic | Notes |
|-------|-------|
| **Render free tier** | Service sleeps after ~15 min idle. First request after sleep can take 30–60 seconds to wake up. The app shows: *"Connection failed. The server may be waking up — try again in a moment."* |
| **Data persistence** | Without `DATABASE_URL`: SQLite resets on deploy/restart. Set `DATABASE_URL` to a Neon or Render Postgres connection string for persistent players and sessions. |
| **Environment** | `VITE_API_BASE` is baked in at build time. Redeploy the Vercel frontend if you change the Render URL. |

### Troubleshooting

| Problem | Fix |
|---------|-----|
| CORS error in browser | Ensure Render `CORS_ORIGINS` matches your Vercel URL exactly (including `https://`, no trailing slash). |
| "Connection failed" or blank screen | Backend may be waking. Wait 30–60 seconds and tap Retry. |
| "Method Not Allowed" when adding a player | `VITE_API_BASE` may be missing in Vercel. Set it to your Render URL and **redeploy** the frontend. |
| API 404 or wrong base URL | Set `VITE_API_BASE` in Vercel to your Render URL. Redeploy Vercel (required). |
| Add to Home Screen not working | Use **Safari** on iPhone. Share → Add to Home Screen. Chrome on iOS uses Safari under the hood; use Safari for best results. |
| Players/sessions disappear after a while | Add a free Postgres DB (Neon or Render Postgres) and set `DATABASE_URL` on the Render backend. Redeploy. |

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
