<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Client (Next.js)

Baca SELALU sebelum menulis kode.

## Sumber kebenaran (baca, jangan duplikasi di sini)
- [`../docs/AGENTS.md`](../docs/AGENTS.md) — aturan umum & stack
- [`../docs/PRD.md`](../docs/PRD.md) — spesifikasi produk
- [`DESIGN.md`](DESIGN.md) — desain visual (warna, font, komponen, signature)

## Alur kerja
1. Buka [`PLANNING.md`](PLANNING.md), ambil task pertama yang belum `[x]` di fase berjalan.
2. Kerjakan **1 task/sesi**. Tidak boleh lompat fase / gabung task.
3. Selesai (test+lint lolos) → centang `[x]`.
4. Task baru → buat GitHub issue dulu (lihat §Issue), baru kerjakan.

## Start/stop (sering salah, WAJIB patuh)
- Buat issue ≠ kerjakan issue. Diminta "buat issue" saja → stop setelah issue dibuat.
- Mulai coding hanya setelah perintah eksplisit ("eksekusi"/"kerjakan"/"lanjut").
- Tiap tahap selesai → stop, lapor singkat. Jangan lanjut ke tahap berikutnya (commit/centang/close issue/task baru) tanpa perintah user.
- Ragu maksud user → tanya, jangan asumsi "sekaligus kerjakan".

## Aturan frontend
1. Spesifikasi: PRD §J (halaman/komponen), §K (state), §L (format error API).
2. Stack tetap (jangan ganti tanpa izin): Next.js App Router, TanStack Query, RHF+Zod, React Context (auth). Zustand/Redux hanya jika perlu (PRD §K).
3. Frontend tidak pernah hitung nilai finansial — harga/total dari backend saja (PRD §C.8, §R.3); frontend kirim ID+qty.
4. Access token di memory state (bukan localStorage). Refresh token httpOnly cookie (PRD §C.1). `401 TOKEN_EXPIRED` → silent refresh `/auth/refresh` (CSRF double-submit) → retry sekali (PRD §S.14).
5. Redirect Midtrans hanya UX, tidak boleh ubah status order (PRD §C.10).
6. Filter/sort/page produk di URL query string (`useSearchParams`), bukan global store (PRD §K).
7. Hindari `dangerouslySetInnerHTML` untuk data user-generated (PRD §I).
8. Cek [`DESIGN.md`](DESIGN.md) sebelum bikin/ubah komponen visual — token warna/font/radius/spacing, style komponen, 4 signature element ada di sana. Cek anti-pattern §9 sebelum nulis CSS.

## Command
| Aksi | Command |
|---|---|
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Test | `npm test` |

## Issue
Diminta buatkan GitHub issue:
1. Planning high-level saja, tanpa detail teknis rinci (nama class/file/langkah).
2. Format: konteks singkat, tujuan, pointer PRD, acceptance criteria.

## Commit
1. Jangan commit/push/PR sebelum user review & approve eksplisit. Tampilkan `git diff`/ringkasan dulu.
2. Checkpoint wajib tiap task selesai:
   - `git status` + `git diff --stat` → ringkas ke user.
   - Tanya "Commit + push + close issue?" → **STOP**.
   - Tidak lanjut `git commit`/`push`/`gh issue close` sebelum user setuju eksplisit.
3. Commit message: English, conventional commits (`feat:`, `fix:`, `chore:`, `docs:`).
4. Task selesai → centang `[x]` di PLANNING.md sebelum/bersama commit.