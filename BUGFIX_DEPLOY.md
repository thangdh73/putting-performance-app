# Bug fix deployment guide

## Summary of changes (8 bugs addressed)

| Bug | Fix applied |
|-----|-------------|
| **#1** – First putt needs 2 clicks | `BroadieResultButtons`: Simplified to single `onClick`, added `touchAction: "manipulation"` to remove 300ms tap delay |
| **#7** – Cancel records instead of canceling | `SessionEntry`: All Cancel links replaced with `<button onClick={() => navigate("/drills")}>` |
| **#2** – "Resuming" on new sessions | `SessionEntry`: Label changed from "Resuming —" to "In progress —" for Broadie and SG |
| **#3** – Session summary lacks outcome labels | `SessionSummary`: Added `getBroadieOutcomeLabel()` so attempts show "Holed first putt", "2 putts, first short", etc. |
| **#4** – Chart year truncated | `analyticsData.ts`: Changed `year: "2-digit"` to `year: "numeric"` |
| **#5** – Loading spinner overlap | Not in app code; likely Cursor IDE or browser extension |
| **#6** – No confirmation before removing player | Already present (`window.confirm` in Players.tsx) |
| **#8** – Empty 9-hole form submits | `SGHoleEntry`: Added early validation with message "Please enter a distance and putt count before recording." |

## Files modified

- `frontend/src/components/BroadieResultButtons.tsx`
- `frontend/src/pages/SessionEntry.tsx`
- `frontend/src/pages/SessionSummary.tsx`
- (Previously: `frontend/src/lib/analyticsData.ts`, `frontend/src/components/SGHoleEntry.tsx`)

## Deploy to Vercel

1. **Close OneDrive sync** for this folder (or pause sync) to avoid git lock issues.

2. **Commit and push:**
   ```bash
   cd "C:\Users\thang\OneDrive\Documents\19-Golf\Phil Kenyon\Apps\putting-performance-app"
   git add -A
   git commit -m "Fix bugs 1-8: Broadie single-tap, Cancel navigation, labels, chart year, validation"
   git push origin master
   ```

3. **Verify Vercel:**
   - In [Vercel Dashboard](https://vercel.com/dashboard): open the putting-performance-app project
   - Check it is connected to `thangdh73/putting-performance-app` (GitHub)
   - Ensure the latest deployment is from `master`
   - Wait for the deployment to finish after the push

4. **Verify deployment:**
   - Open https://putting-performance-app.vercel.app/ in an incognito window
   - Hard refresh (Ctrl+Shift+R) to avoid cached assets
   - Test:
     - Bug #2: Start a Broadie session, record 1 putt → should show "In progress —" not "Resuming —"
     - Bug #4: Go to Analytics → chart x-axis should show full year (e.g. 2026)
     - Bug #7: In Broadie session, tap a result, then tap Cancel → should go to Drill Library without recording

## If Vercel doesn’t auto-deploy

- Check the project’s GitHub integration
- Manually trigger a redeploy in the Vercel dashboard
- Confirm the project builds from the `frontend` folder (or root with `frontend` as build context)
