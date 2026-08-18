"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { api, setTokenGetter } from "@/lib/api";

export type AuthUser = {
  id: string;
  name: string;
  role: string;
};

type AuthStatus = "loading" | "authenticated" | "anonymous";

type SessionData = {
  access_token: string;
  expires_in: number;
  user: AuthUser;
};

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
  useEffect(() => {
    setTokenGetter(() => tokenRef.current);
    return () => setTokenGetter(null);
  }, []);

  function applySession(data: SessionData) {
    tokenRef.current = data.access_token;
    setUser(data.user);
    setStatus("authenticated");
  }

  // Hydrate saat app load: /auth/refresh pakai refresh token cookie (httpOnly)
  // + CSRF double-submit (dikirim api client, lihat lib/api.ts).
  useEffect(() => {
    let cancelled = false;
    api
      .post<SessionData>("/auth/refresh")
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
