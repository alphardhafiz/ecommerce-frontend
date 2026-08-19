"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth";

// Redirect ke /login bila anonim. Saat loading (sesi dipulihkan) tidak ada
// redirect prematur — render kosong sampai status pasti.
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "anonymous") router.replace("/login");
  }, [status, router]);

  if (status === "loading" || status === "anonymous") return null;
  return <>{children}</>;
}

// Area /admin: wajib login DAN role admin (PRD §B). Anonim → /login;
// bukan admin → beranda.
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "anonymous") {
      router.replace("/login");
    } else if (status === "authenticated" && user?.role !== "admin") {
      router.replace("/");
    }
  }, [status, user, router]);

  if (status === "loading" || status === "anonymous") return null;
  if (user?.role !== "admin") return null;
  return <>{children}</>;
}