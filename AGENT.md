# AGENT.md — Client (Next.js)

Baca file ini SELALU sebelum menulis kode apa pun di repo ini.

## Sumber kebenaran

Aturan umum, stack, gotchas, dan alur kerja fase TIDAK diduplikasi di sini.
Baca file berikut:

- [`../docs/AGENTS.md`](../docs/AGENTS.md) — aturan umum & stack
- [`../docs/PRD.md`](../docs/PRD.md) — spesifikasi produk

## Urutan kerja (WAJIB)

1. Buka [`PLANNING.md`](PLANNING.md) — ini task list berjalan.
2. Ambil task pertama yang BELUM dicentang pada fase berjalan.
3. Kerjakan **SATU task saja** per sesi kerja. Jangan lompat fase, jangan
   kerjakan beberapa task sekaligus.
4. Setelah task selesai (test + lint jalan), centang `[x]` di PLANNING.md.

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

## Perintah standar

| Aksi | Command |
|---|---|
| Jalankan dev server | `npm run dev` |
| Lint | `npm run lint` |
| Test | `npm test` |

## Aturan pembuatan GitHub issue

Jika diminta membuat GitHub issue untuk suatu task:

- Tulis secara **high level**, jangan detail/low level.
- Target pembaca: junior programmer / AI model murah. Detail implementasi
  dibiarkan sebagai keputusan mereka.

## Aturan commit

- **JANGAN** commit, push, atau buat PR sebelum user review.
- Tampilkan `git diff` / ringkasan perubahan, lalu TUNGGU persetujuan eksplisit.
- Commit dalam bahasa Inggris, mengikuti commit convention global.
- Tandai task yang selesai di PLANNING.md.
