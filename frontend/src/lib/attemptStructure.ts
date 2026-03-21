/**
 * Predefined attempt structure from product guide.
 * Used for 100 ft and 4–8 ft drills.
 */

/** 100 ft: 5 hole groups × 4 distances (5, 10, 15, 20) = 20 attempts */
export const FOOTAGE_STRUCTURE: { hole_group: number; distance_ft: number }[] = [];
for (let g = 1; g <= 5; g++) {
  for (const d of [5, 10, 15, 20]) {
    FOOTAGE_STRUCTURE.push({ hole_group: g, distance_ft: d });
  }
}

/** 4–8 ft: 4 hole groups × 5 distances (4, 5, 6, 7, 8) = 20 attempts */
export const PERCENTAGE_STRUCTURE: { hole_group: number; distance_ft: number }[] = [];
for (let g = 1; g <= 4; g++) {
  for (const d of [4, 5, 6, 7, 8]) {
    PERCENTAGE_STRUCTURE.push({ hole_group: g, distance_ft: d });
  }
}

export const TOTAL_ATTEMPTS = 20;
