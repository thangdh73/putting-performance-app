# Analytics Date Filtering & Data Management – Implementation Plan

## Feature Scope

### 1. Analytics date filtering
- Filter charts by: **Today**, **This week**, **This month**, **This year**, **Custom range**
- All four chart series (Broadie, 100 ft, 4–8 ft, SG) use the same filter
- Rolling average (3-session) respects the filtered date range
- Backend applies date filter; frontend passes `date_from` and `date_to` query params

### 2. History date filtering
- Filter sessions by date range: **Custom from/to** (or preset shortcuts: week, month, year)
- Works alongside existing drill-type filter
- Backend applies date filter via query params

### 3. Delete single session
- Delete button on History list items and Session Summary page
- Deletes the session and all its attempts
- Confirmation modal before delete

### 4. Reset/restart in-progress session
- "Restart session" or "Reset" button on Session Entry when the session has attempts but is not complete
- Deletes all attempts for that session; backend recalculates session totals (clears them)
- Confirmation before reset
- User stays on Session Entry and can record from scratch

### 5. Optional data reset tools
- **Clear one player history**: Delete all sessions for a user (MVP: typically one user)
- **Clear one drill history**: Delete all sessions for a drill
- **Clear all data**: Delete all sessions (and attempts)
- Placed in a **Settings** or **Data** area (e.g. expandable "Data management" section)
- Each action requires confirmation (modal with explicit wording)
- Only affects sessions and attempts; users and drills remain

---

## Data Model / Backend Changes

### Database
- **No schema changes.** Existing `Session` and `Attempt` models are sufficient.
- Ensure `Attempt` is deleted when its `Session` is deleted. Options:
  - Add `cascade="all, delete-orphan"` on `Session.attempts` relationship, **or**
  - Explicitly delete attempts before deleting session in the API handler.

### Backend logic
- **Sessions router**: Add optional query params `date_from`, `date_to` (ISO date strings) to `GET /api/sessions`. Filter `session_date` within range.
- **Sessions router**: Add `DELETE /api/sessions/{session_id}` – delete attempts, then session.
- **Sessions router**: Add `DELETE /api/sessions/{session_id}/attempts` – delete all attempts for session, recalc totals (set to null/zero). Used for "reset in-progress."
- **Sessions router**: Add bulk-delete endpoints (or one flexible endpoint):
  - `DELETE /api/sessions?user_id={id}` – delete all sessions for user
  - `DELETE /api/sessions?drill_id={id}` – delete all sessions for drill
  - `DELETE /api/sessions?all=true` – delete all sessions (and attempts)
- Validate that bulk delete requires explicit params to avoid accidental wipe.

---

## Frontend / UI Changes

### Analytics page
- Date filter control above charts: dropdown or buttons for Today / Week / Month / Year, plus "Custom" that opens a small date-picker (from/to).
- Pass selected range to `getSessions({ date_from, date_to })`.
- Reuse existing chart components; they receive pre-filtered sessions.

### History page
- Add date range filter (from/to inputs or preset buttons).
- Pass `date_from` and `date_to` to `getSessions`.
- Add delete icon/button on each session card – opens confirmation modal.
- On confirm: call `deleteSession(id)`, remove from local state or refetch, optionally navigate to History.

### Session Summary page
- Add "Delete session" button.
- Confirmation modal: "Delete this session? This cannot be undone."
- On confirm: `deleteSession(id)`, navigate to History.

### Session Entry page
- When `attempts.length > 0` and session is not complete: show "Restart session" link/button.
- Confirmation: "Clear all attempts and start over? This cannot be undone."
- On confirm: call `DELETE /api/sessions/{id}/attempts` (or equivalent), refetch session/attempts, stay on Session Entry.

### Settings / Data management
- New page or collapsible section: "Data management" or "Reset data".
- Options:
  - **Clear my history** (clear sessions for default user)
  - **Clear [Drill name] history** (per drill, or "Clear drill history" with drill selector)
  - **Clear all data** (all sessions)
- Each option: button → confirmation modal with explicit warning → on confirm, call bulk delete, then refetch or navigate.

---

## API Changes

### New/changed endpoints

| Method | Path | Params / body | Description |
|--------|------|---------------|-------------|
| `GET` | `/api/sessions` | `date_from`, `date_to` (optional, ISO date) | Extend existing; filter by `session_date` range |
| `DELETE` | `/api/sessions/{session_id}` | — | Delete session and its attempts; return 204 |
| `DELETE` | `/api/sessions/{session_id}/attempts` | — | Delete all attempts for session; recalc session totals; return 204 |
| `DELETE` | `/api/sessions` | `user_id` or `drill_id` or `all=true` (exactly one) | Bulk delete; return `{ deleted: number }` |

### Query param semantics
- `date_from`: inclusive start (sessions with `session_date >= date_from`).
- `date_to`: inclusive end (sessions with `session_date <= date_to`).
- Dates are date-only (e.g. `2024-03-01`); backend compares using date part of `session_date`.

---

## Recommended Build Order

1. **Phase A: Date filtering (read-only, low risk)**  
   - Backend: add `date_from` / `date_to` to `GET /api/sessions`  
   - Frontend: Analytics date filter UI and `getSessions` params  
   - Frontend: History date filter UI  

2. **Phase B: Delete single session**  
   - Backend: `DELETE /api/sessions/{id}` with cascade/explícit attempt deletion  
   - Frontend: delete button + confirmation on History and Session Summary  
   - Tests: API and basic E2E for delete flow  

3. **Phase C: Reset in-progress session**  
   - Backend: `DELETE /api/sessions/{id}/attempts` + recalc session totals  
   - Frontend: "Restart session" on Session Entry + confirmation  
   - Tests: reset flow  

4. **Phase D: Optional bulk data resets**  
   - Backend: bulk delete endpoint with `user_id` / `drill_id` / `all`  
   - Frontend: Settings / Data management UI with confirmations  
   - Tests: bulk delete behaviour  

---

## Risks and Safeguards

### Accidental deletion
- **Confirmation modals** for every destructive action.
- **Explicit copy**: e.g. "Delete this session? All attempts will be removed. This cannot be undone."
- **Bulk delete** requires a distinct param (`user_id`, `drill_id`, or `all=true`) – no accidental wipe from a simple `DELETE /api/sessions`.

### Data consistency
- Delete attempts before sessions (or use DB cascade) to avoid FK violations.
- After delete, frontend should refetch or update local state so UI reflects backend.

### UX
- Disable or hide "Restart" when the session is already complete.
- After reset, keep the user on Session Entry with a clean state.
- After bulk delete, redirect to Dashboard or History and show a short success message.

### Backend validation
- Reject bulk delete if more than one of `user_id`, `drill_id`, `all` is set.
- For `all=true`, consider requiring an extra confirmation token or header in a future iteration; for MVP, confirmation in the UI is acceptable.

### Out of scope
- No undo.
- No soft delete or archive.
- No auth – any user of the app can perform these actions.
