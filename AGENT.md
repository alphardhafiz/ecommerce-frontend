# AGENT.md — Client (Next.js)

Baca ini sebelum menulis kode apa pun. Sumber kebenaran: [`../docs/AGENTS.md`](../docs/AGENTS.md) dan [`../docs/PRD.md`](../docs/PRD.md). Aturan umum, stack, gotchas, dan alur kerja fase ada di sana — jangan diduplikasi di sini.

**Progress:** [`PLANNING.md`](PLANNING.md) adalah task list berjalan. Sebelum mulai kerja, cek PLANNING.md — ambil task pertama yang belum dicentang pada fase berjalan, kerjakan SATU task itu saja, lalu centang `[x]` setelah selesai (test/lint jalan). Jangan lompat fase, jangan kerjakan banyak task sekaligus.

## Aturan khusus frontend

1. Spesifikasi halaman/komponen frontend: PRD §J. State management: PRD §K. Format error API: PRD §L.
2. Stack sudah diputuskan: Next.js (App Router), TanStack Query (server state), React Hook Form + Zod (form), React Context (auth). Zustand/Redux hanya jika benar-benar perlu (PRD §K).
3. Frontend **tidak pernah** menghitung nilai finansial. Harga/total selalu dari response backend (PRD §C.8, §R.3). Kirim hanya ID + quantity.
4. Access token di memory state, **bukan** localStorage; refresh token hanya httpOnly cookie (PRD §C.1). `401 TOKEN_EXPIRED` → silent refresh via `/auth/refresh` (dengan CSRF double-submit token) lalu retry sekali (PRD §S.14).
5. Redirect dari Midtrans hanya untuk UX, tidak pernah dipakai mengubah status order (PRD §C.10).
6. Filter/sort/page produk disimpan di URL query string (`useSearchParams`), bukan global store (PRD §K).
7. Hindari `dangerouslySetInnerHTML` untuk data user-generated (PRD §I).

## Perintah standar

| Aksi | Command |
|---|---|
| Jalankan | `npm run dev` |
| Lint | `npm run lint` |
| Test | `npm test` |

## Aturan commit

**JANGAN commit, push, atau buat PR sebelum user review.** Tampilkan `git diff`/ringkasan perubahan, tunggu persetujuan eksplisit.
