"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth";
import { buttonClasses } from "./ui/button";
import { Input } from "./ui/input";

export function SiteHeader() {
  const { user, status, logout } = useAuth();

  return (
    <header className="border-b border-taupe bg-paper">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-6 py-4 md:px-16">
        <Link href="/" className="font-display text-2xl text-ink">
          Ledger <span className="italic">&</span> Tag
        </Link>
        <div className="ml-auto hidden max-w-xs flex-1 sm:block">
          <Input aria-label="Cari produk" placeholder="Cari produk…" />
        </div>
        <nav className="flex items-center gap-2" aria-label="Akun">
          <Link
            href="/cart"
            aria-label="Keranjang"
            className="flex h-11 w-11 items-center justify-center rounded-sm text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 6h15l-1.5 9h-12z" />
              <path d="M6 6L5 3H2" />
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="18" cy="20" r="1.5" />
            </svg>
          </Link>

          {status === "loading" ? null : user ? (
            <>
              <Link
                href="/profile"
                className="hidden h-11 items-center rounded-sm px-3 text-[15px] font-medium text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp sm:flex"
              >
                {user.name}
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className={buttonClasses("secondary")}
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={`${buttonClasses("secondary")} hidden sm:inline-flex`}>
                Masuk
              </Link>
              <Link href="/register" className={buttonClasses("primary")}>
                Daftar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}