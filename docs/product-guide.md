# Putting Performance App – Product Guide

## 1. Purpose

This app is designed to help golfers run, record, score, and review putting performance drills in a structured way.

The app should focus on performance practice, not technical swing mechanics.

Its purpose is to:
- guide users through each drill,
- calculate scores automatically,
- store historical results,
- show trends over time,
- compare performance against internal benchmarks and reference standards.

## 2. Supported drills

The drills supported in the first version are:
1. Broadie 5 ft Drill
2. Broadie 10 ft Drill
3. Broadie 15 ft Drill
4. 100 ft Performance Drill
5. 4–8 ft Performance Drill
6. 9-Hole Strokes Gained Drill
7. 18-Hole Strokes Gained Drill

## 3. Broadie drill rules

Broadie drills use this scoring system:
- +2 if the first putt is holed
- 0 if the player 2-putts and the first putt is not short
- -1 if the player 2-putts and the first putt is short
- -3 if the player 3-putts

The player must always hole out after a miss.

### Broadie average mode
The golfer completes 10 putts and total points are summed.

Reference values:
- 5 ft: best 16, average 15, worst 14
- 10 ft: best 8, average 7, worst 6
- 15 ft: best 4, average 3, worst 1

### Broadie completion mode
The golfer keeps going until reaching the target score:
- 5 ft target = 15 points
- 10 ft target = 10 points
- 15 ft target = 5 points

Result = number of attempts required to reach target.

Reference values:
- 5 ft: best 10, average 10, worst 11
- 10 ft: best 11, average 14, worst 17
- 15 ft: best 11, average 14, worst 18

## 4. 100 ft Performance Drill

### Setup
Distances:
- 5 ft
- 10 ft
- 15 ft
- 20 ft

Repeat around 5 different holes.
Total putts = 20.

### Scoring
- each holed putt contributes its length in feet
- total score is total holed footage

Benchmark:
- 100 ft is roughly average PGA Tour winner level

## 5. 4–8 ft Performance Drill

### Setup
Distances:
- 4 ft
- 5 ft
- 6 ft
- 7 ft
- 8 ft

Repeat around 4 different holes.
Total putts = 20.

### Scoring
- count total holed putts
- convert to percentage

Benchmarks:
- 15/20 = 75%
- 13/20 = 65%

## 6. 9-hole and 18-hole strokes gained drills

The user enters:
- distance for each hole
- number of putts taken

For MVP:
- store entries
- calculate total putts
- calculate average distance
- allow later extension to full strokes gained logic

Do not implement full strokes gained maths yet unless a reference table is provided.

## 7. Main screens

The app should include:
1. Dashboard
2. Drill Library
3. Drill Detail Screen
4. Session Entry Screen
5. Session Summary Screen
6. History Screen
7. Analytics Screen
8. Settings Screen

## 8. Main data entities

### User
- id
- name
- created_at
- updated_at
- preferred_scoring_mode

### Drill
- id
- code
- name
- category
- description
- instructions_markdown
- benchmark_json
- is_active
- created_at
- updated_at

### Session
- id
- user_id
- drill_id
- session_date
- scoring_mode
- total_score
- attempts_required
- made_count
- total_attempts
- percentage_score
- benchmark_label
- notes
- created_at
- updated_at

### Attempt
- id
- session_id
- attempt_number
- hole_group
- distance_ft
- result_type
- is_holed_first_putt
- is_first_putt_short
- putts_to_hole_out
- points_awarded
- created_at

## 9. Scoring logic

### Broadie scoring
IF holed_first_putt = true => +2
ELSE IF putts_to_hole_out = 2 AND first_putt_short = false => 0
ELSE IF putts_to_hole_out = 2 AND first_putt_short = true => -1
ELSE IF putts_to_hole_out >= 3 => -3

### Broadie average mode
- session ends after 10 attempts
- total score = sum(points_awarded)

### Broadie completion mode
- continue attempts until target reached
- store attempts required

### 100 ft drill
- if make = true, add distance to total footage

### 4–8 ft drill
- made_count / 20 * 100 = percentage

## 10. UX guidelines
- large touch-friendly buttons
- minimal typing
- fast progression from one attempt to next
- live score display
- progress indicator
- simple mobile layout
- high contrast readable outdoors

## 11. Recommended stack
- React + TypeScript + Vite
- Tailwind CSS
- Recharts
- FastAPI
- SQLite

## 12. Build priorities
The most important things are:
1. correct drill logic
2. fast session entry
3. reliable data saving
4. simple useful analytics
