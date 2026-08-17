# PLANNING.md — Client (Next.js)

Pecahan task per fase mengikuti PRD §U (Development Roadmap) dan PRD §J (halaman). Sumber kebenaran: [`../docs/PRD.md`](../docs/PRD.md) + [`../docs/AGENTS.md`](../docs/AGENTS.md).

**Cara pakai:**
- Kerjakan berurutan per task. Jangan mulai fase berikutnya sebelum DoD fase sekarang terpenuhi.
- Satu saat = satu task. Centang `[x]` hanya setelah task selesai (lint/test jalan).
- Fase N client bergantung pada fase N server yang sudah selesai (misal halaman login butuh `/auth/login` jalan).
- Fase 8 (Redis) murni backend — tidak ada task client.

## Fase 1 — Project setup

- [x] Init Next.js (App Router, TypeScript, ESLint)
- [x] Install deps: TanStack Query, React Hook Form, Zod
- [x] API client (fetch wrapper): base URL env, attach Bearer token, parse format error PRD §L
- [ ] Layout dasar, UI primitives, komponen Toast, error/loading/empty state umum
- [ ] Test: app jalan, API client bisa hit `/health`

**DoD:** frontend jalan, siap dikembangkan halaman.

## Fase 2 — Authentication (butuh server fase 2)

- [ ] AuthContext: access token di memory, hydrate via `/auth/refresh` (CSRF double-submit) saat app load
- [ ] Handler 401 `TOKEN_EXPIRED` → silent refresh → retry request sekali
- [ ] Halaman Login (RHF + Zod, inline error)
- [ ] Halaman Register
- [ ] Halaman Forgot Password (pesan sukses selalu generic)
- [ ] Halaman Reset Password (token dari URL, handle token expired)
- [ ] Route guard: redirect ke /login jika belum login; admin guard di area /admin
- [ ] Navbar dengan state login/logout

**DoD (PRD §U.2 + §J):** register → login → refresh → logout jalan end-to-end.

## Fase 3 — Produk (butuh server fase 3)

- [ ] Halaman Home (hero, kategori, featured products)
- [ ] Halaman Product Listing (filter sidebar, sort dropdown, pagination — semua di URL query string, PRD §K)
- [ ] Halaman Product Detail (galeri, add-to-cart, wishlist button)
- [ ] Komponen Skeleton + empty + error state per PRD §J

**DoD (PRD §U.3 + §J):** user bisa browse, search, filter, sort produk.

## Fase 4 — Wishlist + cart (butuh server fase 4)

- [ ] Halaman Wishlist (grid + remove)
- [ ] Halaman Cart (quantity stepper, remove, subtotal dari backend, indikator `is_available:false`)
- [ ] TanStack Query: invalidate on mutation, cart/wishlist source of truth dari backend

**DoD (PRD §U.4 + §J):** wishlist & cart end-to-end.

## Fase 5 — Address + checkout + payment (butuh server fase 5)

- [ ] Halaman Address (CRUD + set default)
- [ ] Halaman Checkout (pilih address, review item, tombol submit blocking/double-click guard)
- [ ] Halaman Payment: redirect ke Snap (embed/redirect), full-page spinner

**DoD (PRD §U.5 + §J):** checkout mengarahkan user ke halaman pembayaran Midtrans.

## Fase 6 — Order (butuh server fase 6)

- [ ] Halaman Order History (list + status badge)
- [ ] Halaman Order Detail (item snapshot, status timeline, tombol cancel hanya saat PENDING)
- [ ] Handle status "menunggu pembayaran" (tampil status terkini dari backend, bukan dari redirect)

**DoD (PRD §U.6 + §J):** order PAID muncul di history, cancel PENDING bekerja.

## Fase 7 — Admin (butuh server fase 7)

- [ ] Halaman Dashboard (metric cards, filter periode, chart revenue)
- [ ] Product Management (data table, form CRUD, upload image)
- [ ] Category Management (CRUD)
- [ ] User Management (list, toggle status)
- [ ] Order Management (list semua, filter status, update status)
- [ ] Guard: seluruh /admin wajib role admin

**DoD (PRD §U.7 + §J):** semua halaman admin berfungsi sesuai permission matrix PRD §B.

## Fase 9 — Testing (butuh fase 2-7)

- [ ] Component test: form validation, cart quantity stepper, price formatter
- [ ] E2E Playwright critical path (register → login → browse → wishlist → cart → checkout → bayar sandbox → order PAID)
- [ ] Test jalan di CI

**DoD (PRD §U.9):** E2E flow minimal lulus.

## Fase 10 — Deployment (butuh fase 9)

- [ ] Deploy Vercel (auto dari `main`), set env var (API URL, dll)

**DoD (PRD §U.10):** frontend diakses via domain publik, terhubung ke API production.
