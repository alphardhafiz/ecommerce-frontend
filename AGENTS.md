<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Client (Next.js)

Baca file ini SELALU sebelum menulis kode apa pun di repo ini.

## Sumber kebenaran

Aturan umum, stack, gotchas, dan alur kerja fase TIDAK diduplikasi di sini.
Baca file berikut:

- [`../docs/AGENTS.md`](../docs/AGENTS.md) — aturan umum & stack
- [`../docs/PRD.md`](../docs/PRD.md) — spesifikasi produk
- [`DESIGN.md`](DESIGN.md) — bahasa desain & visual (warna, font, komponen, signature)

## Urutan kerja (WAJIB)

1. Buka [`PLANNING.md`](PLANNING.md) — ini task list berjalan.
2. Ambil task pertama yang BELUM dicentang pada fase berjalan.
3. Kerjakan **SATU task saja** per sesi kerja. Jangan lompat fase, jangan
   kerjakan beberapa task sekaligus.
4. Setelah task selesai (test + lint jalan), centang `[x]` di PLANNING.md.
5. Untuk task baru: buat GitHub issue dulu (lihat aturan issue di bawah)
   sebelum mengerjakan.

## Aturan mulai & berhenti kerja (PENTING, sering salah)

1. **Membuat issue ≠ mengerjakan issue.** Kalau user hanya minta "buat github issue", berhenti SETELAH issue dibuat. JANGAN lanjut eksekusi.
2. **Mulai menulis kode HANYA setelah user memerintah eksplisit**, contoh: "eksekusi", "kerjakan", "lanjut".
3. **Setiap tahap selesai → berhenti dan lapor singkat.** Jangan melanjutkan ke tahap berikutnya (commit, centang PLANNING, close issue, task berikutnya) tanpa perintah user.
4. **Sebelum mulai bekerja, baca ulang pesan terakhir user.** Kalau ragu apa yang diminta, tanya dulu — jangan asumsikan "sekaligus kerjakan".

## Aturan khusus frontend

1. Spesifikasi halaman/komponen: PRD §J. State management: PRD §K.
   Format error API: PRD §L.
2. Stack final (jangan ganti tanpa persetujuan): Next.js (App Router),
   TanStack Query (server state), React Hook Form + Zod (form),
   React Context (auth). Zustand/Redux HANYA jika benar-benar perlu (PRD §K).
3. Frontend **tidak pernah** menghitung nilai finansial. Harga/total
   selalu dari response backend (PRD §C.8, §R.3). Frontend hanya mengirim
   ID + quantity.
4. Access token disimpan di memory state, **bukan** localStorage. Refresh
   token hanya di httpOnly cookie (PRD §C.1). Saat dapat `401 TOKEN_EXPIRED`:
   silent refresh via `/auth/refresh` (dengan CSRF double-submit token),
   lalu retry request sekali (PRD §S.14).
5. Redirect dari Midtrans hanya untuk UX — TIDAK boleh dipakai mengubah
   status order (PRD §C.10).
6. Filter/sort/page produk disimpan di URL query string (`useSearchParams`),
   bukan di global store (PRD §K).
7. Hindari `dangerouslySetInnerHTML` untuk data user-generated (PRD §I).
8. **WAJIB cek [`DESIGN.md`](DESIGN.md) sebelum membuat/merubah komponen
   visual.** Token warna/font/radius/spacing, style komponen, dan 4 signature
   element ada di sana — jangan menebak. Baca daftar anti-pattern di DESIGN.md
   §9 sebelum menulis CSS; pola yang ada di daftar itu DILARANG dipakai.

## Perintah standar

| Aksi | Command |
|---|---|
| Jalankan dev server | `npm run dev` |
| Lint | `npm run lint` |
| Test | `npm test` |

## Aturan GitHub issue

Saat user minta dibuatkan GitHub issue untuk sebuah task:

1. Buat planning HIGH LEVEL saja. Jangan tulis detail low-level (nama class,
   nama file, langkah teknis rinci).
2. Format issue: konteks singkat, tujuan, pointer ke bagian PRD sebagai
   sumber kebenaran, dan acceptance criteria.
3. Alasan: yang mengerjakan issue adalah junior programmer atau AI model
   murah. Mereka harus belajar dari PRD, bukan menerima jawaban jadi.

## Aturan commit

1. **JANGAN commit, push, atau buat PR sebelum user review** dan mendapat
   persetujuan eksplisit. Tampilkan `git diff`/ringkasan perubahan dulu.
2. **Checkpoint wajib di akhir setiap task** (selalu lakukan, tanpa kecuali):
   1. Jalankan `git status` + `git diff --stat`, tampilkan ringkasan ke user.
   2. Tanya: "Commit + push + close issue?" — lalu **BERHENTI**.
   3. TIDAK boleh lanjut ke perintah `git commit`/`git push`/`gh issue close`
      sampai user menjawab setuju secara eksplisit.
3. Pesan commit dalam bahasa Inggris, deskriptif, mengikuti conventional
   commits (contoh: `feat:`, `fix:`, `chore:`, `docs:`).
4. Setiap task selesai → tandai `[x]` di PLANNING.md sebelum atau bersama
   commit.
