/**
 * Helpers for API request parameters.
 */

/** Build sessions API params from player filter string. */
export function sessionsParamsFromPlayerFilter(
  playerFilter: string
): { user_id: number } | undefined {
  if (!playerFilter || !/^\d+$/.test(playerFilter)) return undefined;
  return { user_id: parseInt(playerFilter, 10) };
}
