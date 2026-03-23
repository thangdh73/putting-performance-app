# Multiple-Player Practice Management – Implementation Plan

## App Scope

### Target behaviour
- One device manages multiple players locally.
- Each player has their own sessions (already true: `Session.user_id`).
- History can filter by player.
- Analytics can filter by player.
- User selects the active player before starting a session.
- No authentication, no cloud sync, no payments, no coach portals.
- Backend remains source of truth; app stays local-first and MVP-focused.

### Minimum viable multi-player
- Add/remove players (create user, optional: delete user when no sessions).
- Choose active player; selection persists across page reloads (e.g. localStorage).
- Start session for the active player.
- History and Analytics filter by selected player (or "All players").
- No coach view, no comparison charts, no admin roles.

---

## Design Decisions (Answered)

### 1. Should the existing User model become Player, or should Player be a new model?

**Recommendation: Keep the `User` model.**

- The `User` model already represents a player: id, name, sessions.
- `Session.user_id` already links sessions to users.
- Renaming to "Player" would require a DB migration (table rename, FK references) with no functional gain.
- Use the term **"Player"** in the UI only (labels, nav) so it matches practice use; the backend continues to use `User` and `user_id`.

### 2. What is the safest way to handle the current default/single-user data?

**Recommendation: No migration. Use existing data as-is.**

- Seed already creates one user "Golfer" if none exists.
- Existing sessions have `user_id = 1` and stay valid.
- New behaviour: allow creating additional users; seed still ensures at least one user.
- The only change: frontend stops hardcoding `users[0]` and uses the selected active player instead.
- Existing DB and sessions require no schema changes or data migration.

### 3. Where should active-player selection live in the UI?

**Recommendation: Persistent in header + surfaced on Drill Detail.**

- **Primary:** A compact "Player: [Name ▼]" dropdown in the header (or just below nav). Always visible, easy to change before starting a drill.
- **Persistence:** Store selected `user_id` in `localStorage` (e.g. `activePlayerId`). On load, restore; if invalid (deleted user), fall back to first user.
- **Drill Detail:** Show "Recording as: [Player name]" near the Start Session button so it’s obvious who the session is for.
- **Dashboard:** Optional short "Playing as [Name]" reminder; not required if header is clear.

### 4. What is the minimum viable multi-player version before any coach/admin features?

- Create and list players.
- Select active player (persisted).
- Start session for active player.
- History and Analytics filter by active player (or "All").
- Optional: add "Add player" and "Remove player" (only if no sessions). No roles, no coach view, no comparisons.

---

## Data Model Changes

### Database
- **No schema changes.** `User` and `Session.user_id` already support multi-player.
- Optional later: `display_order` or `is_default` on `User` for UI ordering; not required for MVP.

### Seed
- Keep `seed_default_user`: create "Golfer" if no users exist.
- No change to drill seed.

---

## Backend Changes

### Models
- **User**: No change. Already has id, name, sessions.

### Schemas
- **UserRead, UserCreate**: No change. May add `UserCreate` usage for "Add player" if that feature is included.
- **SessionRead**: Already includes `user_id`; no change.

### Services
- **Scoring**: No change; scoring is per-session.
- **Seed**: No change.

### Routes

| Route | Current | Change |
|-------|---------|--------|
| `GET /api/users` | List all users | No change. Used for player list. |
| `GET /api/users/{id}` | Get one user | No change. |
| `POST /api/users` | — | **Add** for "Add player". Body: `{ name: string }`. |
| `DELETE /api/users/{id}` | — | **Optional** for "Remove player". Only if user has no sessions. Return 400 if sessions exist. |
| `GET /api/sessions` | Optional `user_id`, `drill_id` | **Already supports** `user_id`. Ensure it’s used by frontend for player filter. |
| `POST /api/sessions` | Body includes `user_id` | No change. Frontend passes active player’s id. |

### Summary of backend work
1. Add `POST /api/users` (create user with name).
2. Optionally add `DELETE /api/users/{id}` (only when no sessions).
3. Confirm `GET /api/sessions?user_id=X` works and is used for filtering.

---

## Frontend Changes

### New / modified files

| File | Change |
|------|--------|
| **Layout or header** | Add active-player dropdown; read/write `localStorage` for `activePlayerId`. |
| **Context or hook** | Optional `useActivePlayer()` to share active player across pages. |
| **DrillDetail** | Use active player id (from context/localStorage) instead of `users[0]` when creating session. Show "Recording as: [Name]". |
| **History** | Add player filter (dropdown: All / Player 1 / Player 2 / …). Pass `user_id` to `getSessions` when a specific player selected. |
| **Analytics** | Add player filter. Pass `user_id` to `getSessions`. Filter chart data by selected player. |
| **Settings or Players page** | New section or page: list players, "Add player", optionally "Remove player" (with guard for sessions). |
| **api/users** | Add `createUser`, optionally `deleteUser`. |
| **api/sessions** | Ensure `getSessions({ user_id })` is called with selected player when filtering. |
| **types** | No change. `User` and `Session.user_id` already exist. |

### Flows

1. **App load**
   - Fetch users.
   - Read `activePlayerId` from localStorage.
   - If valid (exists in users), use it; else use `users[0].id`, persist.

2. **Change player**
   - User selects from header dropdown.
   - Update localStorage and state/context.
   - History and Analytics reflect new selection (refetch with `user_id` or filter client-side from cached sessions).

3. **Start session**
   - DrillDetail uses active player id for `createSession({ user_id, ... })`.

4. **History**
   - Player filter: "All" (no `user_id`) or specific player (`user_id`).
   - Pass to `getSessions({ user_id })` when filtering by player.

5. **Analytics**
   - Same player filter. Pass `user_id` to `getSessions`. Chart helpers receive filtered sessions.

6. **Add player**
   - Simple form: name input + Add. Call `POST /api/users`. Refresh user list. Optionally set as active.

7. **Remove player**
   - Only if `sessions.length === 0` for that user. Confirm; call `DELETE /api/users/{id}`. Refresh list; clear active if deleted.

---

## Migration Approach

### From single-user to multi-player

1. **No DB migration.** Existing `users` and `sessions` stay as-is.

2. **Code changes only:**
   - Replace `users[0]` with active-player selection from context/localStorage.
   - Add player filter to History and Analytics.
   - Add player management UI (add, optionally remove).

3. **First-time upgrade behaviour:**
   - Existing DB has one user "Golfer" (id=1) and possibly sessions.
   - On first load with new code: no `activePlayerId` in localStorage → use first user (id=1) → same behaviour as before.
   - User can add more players and switch; existing sessions remain under "Golfer".

4. **Backward compatibility:**
   - Single-player users see one player; filtering is effectively a no-op.
   - No data loss, no forced migration.

---

## Phased Implementation Plan

### Phase 1: Active player selection (foundation)
- Add `activePlayerId` to localStorage + a small hook or context.
- Add player dropdown to header (or Dashboard).
- DrillDetail: use active player instead of `users[0]` when creating session.
- **Result:** Sessions are created for the selected player. No visible filter yet.

### Phase 2: History and Analytics player filter
- History: add player dropdown; pass `user_id` to `getSessions` when not "All".
- Analytics: same player filter; pass `user_id` to `getSessions`.
- **Result:** User can view one player’s data or all.

### Phase 3: Add player
- `POST /api/users` endpoint.
- Settings or Players section: form to add player (name).
- After add, refresh user list; optionally set new player as active.
- **Result:** User can create additional players.

### Phase 4: Remove player (optional)
- `DELETE /api/users/{id}` (only when no sessions).
- UI: remove button with confirmation; guard when sessions exist.
- **Result:** User can delete players with no history.

---

## Risks and Ambiguities

### Risks
- **localStorage loss:** If user clears site data, active player resets to first user. Acceptable for local MVP.
- **Deleted player:** If we add delete, and the active player is deleted, fall back to first remaining user.
- **Empty user list:** Seed ensures at least one user. If seed is skipped, handle empty list (disable session start, show message).

### Ambiguities
- **Player naming:** Allow duplicate names? Recommend yes for simplicity (e.g. two "Alex").
- **Default player on first add:** When adding the first extra player, keep "Golfer" as active or switch to new? Recommend keep current active unless user explicitly switches.
- **"All" vs "All players" in filter:** Use "All players" for clarity in multi-player context.

### Out of scope (for this plan)
- Coach view, comparison charts, admin roles.
- Auth, cloud sync, device linking.
- Player avatars, preferences beyond name.
- Import/export per player.

---

## Recommended Build Order

1. **Phase 1** – Active player selection (localStorage, header dropdown, DrillDetail)
2. **Phase 2** – History and Analytics player filter
3. **Phase 3** – Add player (backend + UI)
4. **Phase 4** – Remove player (optional, backend + UI)

Build phases in this order to minimise risk and deliver incremental value.
