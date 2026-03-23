import { useCallback, useEffect, useState } from "react";
import { getSessions } from "../api/sessions";
import { getDrills } from "../api/drills";
import { sessionsParamsFromPlayerFilter } from "../lib/apiParams";
import { getErrorMessage } from "../lib/apiErrors";
import type { Session, Drill } from "../types";

export interface UseSessionsWithDrillsOptions {
  /** If true, only fetch sessions with official completion (for analytics). Default false. */
  officialOnly?: boolean;
}

export function useSessionsWithDrills(
  playerFilter: string,
  options?: UseSessionsWithDrillsOptions
) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [drills, setDrills] = useState<Drill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setError(null);
    setLoading(true);
    const params = {
      ...sessionsParamsFromPlayerFilter(playerFilter),
      ...(options?.officialOnly === true && { official_only: true }),
    };
    getSessions(params)
      .then(setSessions)
      .then(() => getDrills())
      .then(setDrills)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [playerFilter, options?.officialOnly]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const drillMap = Object.fromEntries(drills.map((d) => [d.id, d]));

  return { sessions, drills, drillMap, loading, error, refetch };
}
