"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  api,
  refreshSession,
  setAuthCallbacks,
  setTokenGetter,
  type SessionData,
} from "@/lib/api";

export type AuthUser = {
  id: string;
  name: string;
  role: string;
};

type AuthStatus = "loading" | "authenticated" | "anonymous";

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const tokenRef = useRef<string | null>(null);

  // Access token hanya di memory (PRD §C.1): getter dibaca api client per request.
  // Callback: silent refresh memperbarui token di memory; refresh gagal → anonim.
  useEffect(() => {
    setTokenGetter(() => tokenRef.current);
    setAuthCallbacks({
      onTokenRefresh: (token) => {
        tokenRef.current = token;
      },
      onAuthExpired: () => {
        tokenRef.current = null;
        setUser(null);
        setStatus("anonymous");
      },
    });
    return () => {
      setTokenGetter(null);
      setAuthCallbacks({});
    };
  }, []);

  function applySession(data: SessionData) {
    tokenRef.current = data.access_token;
    setUser(data.user);
    setStatus("authenticated");
  }

  // Hydrate saat app load: /auth/refresh pakai refresh token cookie (httpOnly)
  // + CSRF double-submit. Lewat refreshSession() biar dedup: StrictMode
  // double-mount (dev) tidak memicu 2 request yang saling membatalkan sesi
  // (server rotasi + reuse detection).
  useEffect(() => {
    let cancelled = false;
    refreshSession()
      .then((data) => {
        if (!cancelled) applySession(data);
      })
      .catch(() => {
        if (!cancelled) setStatus("anonymous");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function login(email: string, password: string): Promise<AuthUser> {
    const data = await api.post<SessionData>("/auth/login", { email, password });
    applySession(data);
    return data.user;
  }

  async function logout(): Promise<void> {
    try {
      await api.post<void>("/auth/logout");
    } finally {
      // Local selalu dibersihkan; cookie server di-revoke endpoint logout.
      tokenRef.current = null;
      setUser(null);
      setStatus("anonymous");
    }
  }

  return (
    <AuthContext.Provider value={{ user, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
