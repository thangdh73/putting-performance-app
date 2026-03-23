import { useCallback, useEffect, useState } from "react";
import { getSession, getSessionAttempts } from "../api/sessions";
import { getDrill } from "../api/drills";
import { getErrorMessage } from "../lib/apiErrors";
import type { Session, Attempt, Drill } from "../types";

export function useSessionData(sessionId: string | undefined) {
  const [session, setSession] = useState<Session | null>(null);
  const [drill, setDrill] = useState<Drill | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sid = sessionId ? parseInt(sessionId, 10) : NaN;
  const validId = Number.isInteger(sid) && sid >= 1;

  const fetchData = useCallback(() => {
    if (!sessionId || !validId) {
      setError("Invalid session");
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    Promise.all([getSession(sid), getSessionAttempts(sid)])
      .then(([s, a]) => {
        setSession(s);
        setAttempts(a);
        return getDrill(s.drill_id);
      })
      .then((d) => {
        setDrill(d);
        setError(null);
      })
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [sessionId, validId, sid]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { session, drill, attempts, loading, error, setError, validId, fetchData };
}
