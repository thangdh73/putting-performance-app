# Unfinished-Session Handling – Design Recommendation

**Status:** Design only (no code changes)  
**Scope:** All seven drill types, consistent partial-session and extra-practice behaviour  
**Principles:** Backend source of truth, simple MVP-friendly design

---

## 1. Shared rules across all drills

### Core concepts

| Concept | Definition |
|---------|------------|
| **Official completion** | The drill-specific number of attempts/holes required for a valid score. Once reached, `official_attempts_count` is set and the official score is locked. |
| **Partial session** | A session with one or more attempts but `official_attempts_count` is still `null` (not officially complete). |
| **Completed session** | `official_attempts_count` is set. Official score is computed from the first N attempts only. |
| **Extra practice** | Attempts beyond `official_attempts_count`. These do not affect the official score. |

### Shared invariants

1. **Sessions are always saveable.** Every attempt is persisted immediately. There is no “unsaved draft” state.
2. **Official score uses only official attempts.** Backend computes totals from `attempts[:official_attempts_count]` when that value is set. Extra attempts are ignored for scoring.
3. **Official completion is decided by the backend.** The backend sets `official_attempts_count` when the drill’s completion rule is met. The frontend does not define completion.
4. **Partial sessions are excluded from official analytics.** Only sessions with `official_attempts_count != null` count toward charts and trends.
5. **Extra practice is optional.** After completion, the user may continue adding attempts; they are recorded but do not change the official score.

---

## 2. Drill-by-drill rules

### Broadie 5 ft / 10 ft / 15 ft

| Aspect | Average mode | Completion mode |
|--------|--------------|-----------------|
| **Official completion rule** | 10 putts recorded | Target score reached (15 / 10 / 5 pts for 5/10/15 ft) |
| **official_attempts_count** | 10 | `attempts_required` (number of putts to reach target) |
| **Partial allowed** | Yes. Any number of putts (1–9) can be saved. | Yes. Sessions can stop before target. |
| **Partial in History** | e.g. "7/10 putts · 12 pts" | e.g. "12 pts in 8 putts · target 15" or "In progress" |
| **Resume** | Navigate to Session Entry, add putts 8–10. | Navigate to Session Entry, add putts until target. |
| **Extra practice after completion** | Yes. User can add more putts; official score stays based on first 10. | Yes. Official score stays based on first N putts to target. |

### 100 ft Performance Drill

| Aspect | Rule |
|--------|------|
| **Official completion rule** | 20 putts recorded |
| **official_attempts_count** | 20 |
| **Partial allowed** | Yes. 1–19 putts can be saved. |
| **Partial in History** | e.g. "12/20 putts · 45 ft" |
| **Resume** | Navigate to Session Entry, add remaining putts in order (structure: 5 holes × 4 distances). |
| **Extra practice after completion** | Yes. Official score = footage from first 20. |

### 4–8 ft Performance Drill

| Aspect | Rule |
|--------|------|
| **Official completion rule** | 20 putts recorded |
| **official_attempts_count** | 20 |
| **Partial allowed** | Yes. 1–19 putts can be saved. |
| **Partial in History** | e.g. "14/20 putts · 70%" (percentage from recorded putts) |
| **Resume** | Navigate to Session Entry, add remaining putts in order (4 holes × 5 distances). |
| **Extra practice after completion** | Yes. Official score = percentage from first 20. |

### 9-Hole SG Drill

| Aspect | Rule |
|--------|------|
| **Official completion rule** | 9 holes recorded |
| **official_attempts_count** | 9 |
| **Partial allowed** | Yes. 1–8 holes can be saved. |
| **Partial in History** | e.g. "5/9 holes · 12 putts" |
| **Resume** | Navigate to Session Entry, add holes 6–9. |
| **Extra practice after completion** | No meaningful extra practice (holes are discrete). Recommendation: allow viewing only; no further hole entry after 9. |

### 18-Hole SG Drill

| Aspect | Rule |
|--------|------|
| **Official completion rule** | 18 holes recorded |
| **official_attempts_count** | 18 |
| **Partial allowed** | Yes. 1–17 holes can be saved. |
| **Partial in History** | e.g. "12/18 holes · 28 putts" |
| **Resume** | Navigate to Session Entry, add holes 13–18. |
| **Extra practice after completion** | Same as 9-hole: no further hole entry after 18. |

---

## 3. History behaviour

### Display rules

1. **Show all sessions** – Completed and partial. Filter by player and drill type as today.
2. **Partial vs completed** – Use a status label so users can tell them apart:
   - Partial: `"In progress"` or drill-specific progress (e.g. `"7/10 putts"`).
   - Completed: show main score; if extra practice: `"Official: 15 pts · +3 extra"`.

3. **Sort order** – Most recent first (by `session_date` / `updated_at`). Partial sessions can be shown at top within the same date if desired, but simplest is date-desc only.

4. **Tap behaviour** – Always navigate to Session Entry (for partial) or Session Summary (for completed).  
   - **Recommendation:** Always go to Session Entry if partial; for completed, offer both “View summary” and “Add extra practice” (which also goes to Session Entry). For MVP, a single tap to Summary is fine; Summary can show “Add extra practice” linking to Entry.

   - **Simpler MVP:** Tap always goes to Session Summary. Summary shows “Resume” (→ Entry) if partial, “Add extra practice” (→ Entry) if completed with that option.

5. **Progress wording per drill** (for partial sessions in History):

   | Drill | Partial label example |
   |-------|------------------------|
   | Broadie average | `7/10 putts · 12 pts` |
   | Broadie completion | `8 putts · 12 pts (target 15)` or `In progress` |
   | 100 ft | `12/20 putts · 45 ft` |
   | 4–8 ft | `14/20 putts · 70%` |
   | 9-Hole SG | `5/9 holes · 12 putts` |
   | 18-Hole SG | `12/18 holes · 28 putts` |

---

## 4. Analytics behaviour

### Inclusion rule

**Only include sessions where `official_attempts_count` is not null.**

- Partial sessions must not appear in any chart.
- This keeps trends based on comparable, completed drills.

### Implementation

1. **Backend:** Add optional query param `official_only=true` (default: `true`) to `GET /api/sessions`. When true, filter `WHERE official_attempts_count IS NOT NULL`.
2. **Frontend:** Use `official_only=true` (or equivalent) for Analytics. History can use `official_only=false` to show partial and completed.
3. **Chart helpers:** `analyticsData.ts` should only receive sessions that are officially complete. Filtering at the API keeps the rule in one place.

### Roll-up

- Rolling average, trends, and all aggregates use only officially completed sessions.
- Extra practice does not affect analytics; `official_attempts_count` already limits which attempts are scored.

---

## 5. Recommended session status model

### Derived status (no new DB column)

Session status can be derived from existing fields:

| Status | Condition | Meaning |
|--------|-----------|---------|
| `partial` | `official_attempts_count == null` | In progress or abandoned; can be resumed |
| `completed` | `official_attempts_count != null` and `len(attempts) <= official_attempts_count` | Finished, no extra practice |
| `completed_with_extra` | `official_attempts_count != null` and `len(attempts) > official_attempts_count` | Finished, extra practice recorded |

### Helper (backend or shared)

```text
is_officially_complete(session) := session.official_attempts_count != null
has_extra_practice(session) := attempts.length > (session.official_attempts_count ?? 0)
```

### Optional explicit field (future)

If desired later, add `status: enum('partial'|'completed'|'completed_with_extra')` computed on write. For MVP, deriving from `official_attempts_count` and `attempts.length` is enough.

---

## 6. Recommended UI wording

### Session Entry

| Scenario | Wording |
|----------|---------|
| No attempts yet | Normal drill instructions |
| Partial (in progress) | "Resume" or "X of Y recorded — continue?" |
| Completed, adding extra | "Official score locked · Extra practice: N putts" (already used) |
| Completed, no extra | "Session complete" → link to Summary |

### History

| Scenario | Wording |
|----------|---------|
| Partial | "In progress · [progress]" (e.g. "7/10 putts") |
| Completed | "[Main score]" (e.g. "15 pts", "72 ft", "75%") |
| Completed + extra | "[Main score] · +N extra" |

### Session Summary

| Scenario | Wording |
|----------|---------|
| Partial | "In progress — Tap to resume" (link to Entry) |
| Completed | Normal summary |
| Completed + extra | "Official score: X · Extra practice: N putts" |

### Analytics

| Scenario | Wording |
|----------|---------|
| Page intro | "Scores use official putts only. Partial sessions are excluded." (or similar) |

---

## 7. Phased implementation plan

### Phase A: Analytics exclusion of partial sessions

**Goal:** Analytics charts use only officially completed sessions.

1. Backend: add `official_only` (default `true`) to `GET /api/sessions`.
2. Frontend: ensure Analytics requests use `official_only=true`.
3. Add/update `analyticsData` filter so it never includes partial sessions (belt-and-braces).
4. Test: create partial Broadie session, confirm it does not appear in Analytics.

### Phase B: History partial-session display

**Goal:** History clearly shows partial vs completed and progress.

1. Extend `getSessionSummary` (or equivalent) to support partial sessions with progress labels.
2. History list: show "In progress · X/Y" (or drill-specific) for partial sessions.
3. Session Summary: for partial, show "Resume" linking to Session Entry.
4. Test: create partial sessions for each drill type, confirm labels and links.

### Phase C: Resume flow

**Goal:** User can resume a partial session from History.

1. History: tapping a partial session goes to Session Entry (or Summary with “Resume”).
2. Session Entry: when loading a partial session, show "Resume" state and correct next attempt/hole.
3. Ensure attempt numbering continues from existing attempts (already true if backend uses `attempts.length + 1`).
4. Test: start Broadie, record 5, leave; from History, resume and add 5 more; confirm completion.

### Phase D: Extra-practice clarity (optional polish)

**Goal:** Clear messaging when adding extra practice.

1. Session Entry: when `official_attempts_count` is set and user adds more, keep/refine "Official score locked · Extra practice: N putts".
2. Session Summary: when extra practice exists, show "Official score: X · Extra practice: N putts".
3. History: optional "+N extra" for completed-with-extra sessions.
4. Test: complete Broadie, add 3 extra putts; confirm UI reflects extra practice and Analytics unchanged.

### Phase E: Reset / restart (if not yet done)

**Goal:** User can discard a partial session and start over.

1. Backend: `DELETE /api/sessions/{id}/attempts` (from analytics plan).
2. Session Entry: "Restart session" when partial; confirmation; clear attempts, stay on Entry.
3. Test: partial session → Restart → confirm clean state.

---

## 8. Summary

| Topic | Recommendation |
|-------|----------------|
| **Partial sessions** | Allowed for all drills; saved incrementally; resumable from History. |
| **Official completion** | Backend sets `official_attempts_count` per drill (10 / target / 20 / 9 / 18). |
| **Analytics** | Only sessions with `official_attempts_count != null`. |
| **Extra practice** | Allowed for Broadie, 100 ft, 4–8 ft; not for SG (discrete holes). |
| **History** | Show partial and completed; use "In progress" and progress labels for partial. |
| **Resume** | Navigate to Session Entry; continue from next attempt/hole. |
| **Status model** | Derive `partial` / `completed` / `completed_with_extra` from `official_attempts_count` and `attempts.length`. |
| **Build order** | A (Analytics) → B (History display) → C (Resume) → D (Extra-practice polish) → E (Reset). |
