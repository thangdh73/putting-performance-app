import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getUsers } from "../api/users";
import { getErrorMessage } from "../lib/apiErrors";
import type { User } from "../types";

const STORAGE_KEY = "activePlayerId";

interface ActivePlayerContextValue {
  users: User[];
  activePlayer: User | null;
  loading: boolean;
  usersError: string | null;
  setActivePlayerId: (id: number) => void;
  refreshUsers: () => Promise<void>;
  clearUsersError: () => void;
}

const ActivePlayerContext = createContext<ActivePlayerContextValue | null>(null);

export function ActivePlayerProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [activePlayer, setActivePlayer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const usersRef = useRef<User[]>([]);
  usersRef.current = users;

  const clearUsersError = useCallback(() => setUsersError(null), []);

  const setActivePlayerId = useCallback((id: number) => {
    const user = usersRef.current.find((u) => u.id === id);
    if (user) {
      setActivePlayer(user);
      try {
        localStorage.setItem(STORAGE_KEY, String(id));
      } catch {
        // Ignore localStorage errors
      }
    }
  }, []);

  const refreshUsers = useCallback(async () => {
    setUsersError(null);
    try {
      const data = await getUsers();
      setUsers(data);
      setUsersError(null);
      if (data.length === 0) {
        setActivePlayer(null);
        return;
      }
      const stored = (() => {
        try {
          return localStorage.getItem(STORAGE_KEY);
        } catch {
          return null;
        }
      })();
      const storedId = stored != null ? parseInt(stored, 10) : NaN;
      const validUser = Number.isInteger(storedId)
        ? data.find((u) => u.id === storedId)
        : undefined;
      const fallback = data[0];
      const selected = validUser ?? fallback;
      setActivePlayer(selected);
      if (!validUser && selected) {
        try {
          localStorage.setItem(STORAGE_KEY, String(selected.id));
        } catch {
          // Ignore
        }
      }
    } catch (e) {
      setUsersError(getErrorMessage(e, "Something went wrong. Please try again."));
      setUsers([]);
      setActivePlayer(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    getUsers()
      .then((data) => {
        if (cancelled) return;
        setUsers(data);
        if (data.length === 0) {
          setActivePlayer(null);
          setLoading(false);
          return;
        }
        let stored: string | null = null;
        try {
          stored = localStorage.getItem(STORAGE_KEY);
        } catch {
          // Ignore
        }
        const storedId = stored != null ? parseInt(stored, 10) : NaN;
        const validUser = Number.isInteger(storedId)
          ? data.find((u) => u.id === storedId)
          : undefined;
        const fallback = data[0];
        const selected = validUser ?? fallback;
        setActivePlayer(selected);
        if (!validUser && selected) {
          try {
            localStorage.setItem(STORAGE_KEY, String(selected.id));
          } catch {
            // Ignore
          }
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setUsersError(getErrorMessage(e, "Something went wrong. Please try again."));
          setUsers([]);
          setActivePlayer(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value: ActivePlayerContextValue = {
    users,
    activePlayer,
    loading,
    usersError,
    setActivePlayerId,
    refreshUsers,
    clearUsersError,
  };

  return (
    <ActivePlayerContext.Provider value={value}>
      {children}
    </ActivePlayerContext.Provider>
  );
}

export function useActivePlayer(): ActivePlayerContextValue {
  const ctx = useContext(ActivePlayerContext);
  if (!ctx) {
    throw new Error("useActivePlayer must be used within ActivePlayerProvider");
  }
  return ctx;
}
