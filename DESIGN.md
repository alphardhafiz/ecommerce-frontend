# Design Reference — Mini E-Commerce

**Untuk:** Storefront (Next.js, public-facing) dan Admin Dashboard (Next.js, internal)
**Tujuan dokumen:** referensi desain tunggal supaya kedua permukaan (storefront & dashboard) konsisten secara sistem, tapi tetap punya kepribadian berbeda sesuai audiensnya masing-masing.

---

## 0. Grounding — kenapa arah ini dipilih

Brief awal tidak menentukan kategori produk spesifik (fashion, elektronik, dsb), jadi identitas visual di sini **tidak digantungkan pada satu niche produk**, melainkan digantungkan pada **subjek commerce itu sendiri**: struk, price tag, benang jahit label baju, cap stempel gudang, buku kas/ledger. Ini artefak nyata yang setiap orang kenali dari pengalaman belanja & berjualan — bukan gaya visual generik yang bisa dipakai di brief apa pun.

**Signature konsep: "Ledger & Tag"** — storefront terasa seperti membuka katalog/price tag fisik yang rapi, dashboard terasa seperti buku kas/ledger seorang pemilik toko. Dua permukaan, satu bahasa visual, beda tekanan.

Jika di kemudian hari kamu menentukan kategori produk final (misal fashion, home goods, dsb), palet & tone di bawah tetap valid — sesuaikan foto produk & copy contoh saja.

**Niche produk final (dikunci): alat tulis kertas & kayu.** "Ledger & Tag" menjual alat tulis berbahan kertas & kayu — notebook jahit tangan, pensil/pena kayu, kartu letterpress, aksesoris meja kayu. Kenapa cocok: bahan produknya persis token desain (kertas = `paper`, tinta = `ink`, cap gudang = `stamp`, buku kas = `ledger`), dan nama toko menjadi produk hero alami (buku kas sungguhan dijual di katalog). Palet & tone di bawah sudah final — foto produk & copy contoh menyesuaikan niche ini.

---

## 1. Warna

| Token | Hex | Peran |
|---|---|---|
| `ink` | `#161D1A` | Teks utama, header gelap, sidebar dashboard |
| `paper` | `#EDE8DC` | Background utama storefront — warm stone, sengaja **tidak** krem terang generik |
| `paper-raised` | `#F7F4EC` | Card/surface di atas `paper`, kontras tipis |
| `stamp` | `#A63D2F` | Aksen utama storefront — merah-bata seperti tinta cap gudang. Dipakai tipis: CTA utama, badge diskon, indikator status penting |
| `ledger` | `#2F5D50` | Warna primer dashboard — hijau tua "buku kas", dipakai di sidebar, chart positif, status sukses |
| `mustard` | `#C98A2C` | Aksen kedua — highlight, badge "baru", warning ringan |
| `taupe` | `#B8AF9C` | Border, divider, teks sekunder di atas `paper` |
| `taupe-dark` | `#6E6656` | Teks tersier, placeholder |
| `error` | `#9B2C2C` | Error state (beda dari `stamp` — lebih gelap & jenuh agar tidak tertukar dengan CTA) |

**Kenapa bukan default:** kombinasi krem hangat + aksen terracotta (`#D97757`-ish) adalah pola yang sangat sering muncul di desain buatan AI — di sini `paper` sengaja digeser ke arah abu-batu (bukan krem murni), dan `stamp` digeser ke merah-bata gelap yang lebih ke arah tinta cap, bukan oranye lembut. Dashboard memakai hijau tua sebagai warna primer (bukan biru SaaS generik atau ungu gradient) karena hijau ledger/uang punya asosiasi finansial yang relevan untuk dashboard toko.

**Aturan pemakaian:**
- `stamp` **hanya** untuk satu CTA utama per layar dan badge status penting. Jangan dipakai untuk elemen dekoratif berulang.
- `ledger` adalah warna dominan dashboard (sidebar, header), tapi **tidak** dipakai di storefront sama sekali — ini yang membedakan dua permukaan secara instan.
- Tidak ada gradient di manapun. Warna flat, solid.

---

## 2. Tipografi

| Role | Font | Alasan |
|---|---|---|
| Display (judul besar, hero, harga besar) | **Fraunces** (variable, optical size tinggi, soft) | Serif berkarakter dengan detail "ink trap" yang terasa seperti dicetak, bukan serif elegan generik (hindari Playfair Display yang jadi default AI) |
| Body (paragraf, label, UI umum) | **Public Sans** | Humanist sans dengan sedikit kepribadian teknis/pemerintahan-AS-modern, cukup netral untuk UI panjang tapi tidak se-generik Inter |
| Data / angka / kode (harga di tabel, SKU, order ID, mono figures dashboard) | **IBM Plex Mono** | Memperkuat nuansa "ledger" — angka finansial di dashboard dan struk terasa seperti dicetak mesin kasir |

### Skala tipe (storefront)
| Level | Ukuran / line-height | Weight | Font |
|---|---|---|---|
| Hero display | 64px / 1.05 (mobile: 40px/1.1) | 500 (Fraunces Medium) | Fraunces |
| Section heading | 32px / 1.15 | 500 | Fraunces |
| Product name (card) | 16px / 1.3 | 600 | Public Sans |
| Body | 15px / 1.6 | 400 | Public Sans |
| Caption / meta | 13px / 1.4 | 400, letter-spacing 0.02em | Public Sans |
| Harga | 15–18px | 600 tabular-nums | IBM Plex Mono |

### Skala tipe (dashboard)
Lebih padat, karena dashboard adalah alat kerja bukan halaman marketing:
| Level | Ukuran | Weight | Font |
|---|---|---|---|
| Page title | 24px / 1.2 | 500 | Fraunces (dipakai terbatas, hanya judul halaman) |
| Table header | 12px, uppercase, letter-spacing 0.06em | 600 | Public Sans |
| Table cell (teks) | 14px | 400 | Public Sans |
| Table cell (angka: harga, stok, ID) | 14px, tabular-nums, rata kanan | 500 | IBM Plex Mono |
| Metric besar (dashboard card) | 36px | 500 | Fraunces |

**Aturan:** Fraunces dipakai *dengan sangat terbatas* — hanya hero, judul section, dan angka metrik besar. Jangan jadikan Fraunces sebagai font body di manapun; itu yang membuatnya tetap terasa istimewa alih-alih berlebihan.

---

## 3. Layout & Spacing

- **Grid dasar:** 8px baseline. Spacing tokens: `4, 8, 12, 16, 24, 32, 48, 64, 96`.
- **Border radius:** sengaja **kecil dan konsisten** (`4px` untuk button/input, `2px` untuk badge/tag), **bukan 0 (broadsheet-flat)** dan **bukan rounded-2xl bubble ala SaaS modern**. Radius kecil ini terasa seperti sudut kartu/kertas fisik yang dipotong rapi, bukan digital-bubbly maupun sengaja retro-koran.
- **Container width:** storefront max-width 1280px dengan padding sisi 24px (mobile) / 64px (desktop). Dashboard full-bleed dengan sidebar tetap (240px) + content area fluid.
- **Divider:** garis putus-putus tipis (`border-dashed`, 1px, warna `taupe`) dipakai sebagai "garis perforasi" antar section produk/struk — bagian dari signature, bukan hairline biasa.

### Wireframe konsep — Storefront Home
```
┌─────────────────────────────────────────────┐
│ [Logo]              [Search]     [Cart][User]│  ← header, paper bg
├─────────────────────────────────────────────┤
│                                               │
│   Fraunces headline besar, rata kiri         │
│   (bukan center-hero generik)                │
│   sub-copy pendek + [CTA bertekstur tag]     │
│                                               │
│   [foto produk unggulan — natural light]     │
│  - - - - - - - - - - - - - - - - - - - - -  │  ← garis perforasi
├─────────────────────────────────────────────┤
│  Kategori →   [chip] [chip] [chip] [chip]    │
├─────────────────────────────────────────────┤
│  [card] [card] [card] [card]                 │  ← grid produk, card
│  [card] [card] [card] [card]      bergaya tag│
└─────────────────────────────────────────────┘
```

### Wireframe konsep — Product Card (signature)
```
┌───────────────────╮
│(●)                │  ← lubang kecil pojok kiri atas,
│    [foto produk]   │     seperti lubang gantungan price tag
│                    │
│- - - - - - - - - -│  ← perforasi
│ Nama Produk        │
│ Rp 89.000  [MONO]  │
│ ○ Stok tersedia    │
╰───────────────────┘
```
Card tidak pakai shadow tebal ala Material Design — cukup border 1px `taupe` + sedikit offset warna background (`paper-raised` di atas `paper`) untuk kedalaman.

### Wireframe konsep — Dashboard
```
┌────────┬──────────────────────────────────────┐
│ LEDGER │  Page Title (Fraunces)     [period ▾]│
│ (ink   ├──────────────────────────────────────┤
│  bg)   │  [Metric] [Metric] [Metric] [Metric]  │  ← angka besar Fraunces,
│        │                                        │     label kecil mono
│ ▸ Dash │  ┌────────────────────────────────┐   │
│ ▸ Order│  │ Tabel data, rata kanan untuk    │   │
│ ▸ Prod │  │ angka (mono), garis horizontal  │   │
│ ▸ User │  │ tipis antar baris (bukan zebra  │   │
│        │  │ striping / card per row)         │   │
└────────┴──────────────────────────────────────┘
```
Dashboard sengaja **tidak** memakai pola "banyak card berbayang dengan ikon warna-warni" yang jadi default template admin panel. Tabel data terasa seperti buku kas: garis horizontal tipis, angka rata kanan dan tabular, minim dekorasi.

---

## 4. Signature Elements

Satu elemen berani per konteks, sisanya tenang:

1. **Storefront — "receipt slip" saat add-to-cart:** ketika user menambah produk ke cart, muncul animasi singkat seperti kertas struk "keluar dari mesin kasir" dari arah tombol menuju ikon cart (bukan toast generik pojok kanan atas). Ini satu-satunya animasi mencolok di storefront — dipakai konsisten di semua add-to-cart, tidak di tempat lain.
2. **Product tag card:** lubang kecil + garis perforasi seperti dijelaskan di atas. Konsisten di semua card produk (listing, wishlist, cart item).
3. **Checkout progress:** step checkout ditampilkan seperti item struk yang "dicetak" satu per satu ke bawah (alamat → ringkasan → pembayaran), bukan progress bar horizontal generik dengan lingkaran bernomor.
4. **Dashboard — cap "PAID" / status stempel:** status order di tabel admin ditampilkan sebagai badge kecil miring (rotate -4deg) dengan border seperti cap stempel karet, warna sesuai status (`ledger` untuk PAID/COMPLETED, `mustard` untuk PENDING/PROCESSING, `error` untuk CANCELLED/EXPIRED) — bukan pill badge flat berwarna standar.

Jangan tambah signature lain di luar 4 ini. Kalau ingin elemen baru, ganti salah satu di atas — jangan menumpuk.

---

## 5. Komponen

### Button
- Primary: `stamp` (storefront) / `ledger` (dashboard) solid, teks `paper`, radius 4px, padding 12px 20px, tanpa shadow. Hover: darken 8%, bukan scale/glow.
- Secondary: border 1px `ink`, transparent bg, teks `ink`.
- Disabled: opacity 40%, tidak ada style tambahan.

### Input & Form
- Border bottom 1px sebagai default style (bukan full-border box) untuk field text sederhana di storefront — terasa seperti mengisi form kertas.
- Dashboard tetap pakai full-border box input (lebih sesuai konteks data-entry padat), border `taupe`, focus ring `ledger` 2px.
- Semua input wajib punya visible focus state (outline/ring jelas, bukan cuma border color berubah tipis) — accessibility non-negotiable.

### Badge / Status
- Bentuk stempel miring seperti dijelaskan di Signature #4, dipakai konsisten di order status baik storefront (order history) maupun dashboard.

### Table (dashboard)
- Header uppercase kecil, letter-spacing lebar, warna `taupe-dark`.
- Baris dipisah garis horizontal 1px `taupe`, bukan zebra-stripe bukan card-per-row.
- Angka selalu rata kanan, tabular-nums, IBM Plex Mono.

---

## 6. Motion

- **Page load:** tidak ada animasi masuk yang mencolok di seluruh halaman (hindari stagger-fade-in generik di semua elemen). Cukup fade sangat halus 150ms untuk konten yang di-fetch.
- **Add to cart:** signature "receipt slip" (lihat bagian 4), durasi ~500ms, easing ease-out.
- **Hover produk:** scale gambar sangat halus (1.02), tanpa shadow pop.
- **Dashboard:** motion minimal sekali — ini alat kerja, bukan panggung. Transisi antar state cukup 100–150ms, tanpa efek dekoratif.
- Semua motion menghormati `prefers-reduced-motion` — matikan animasi non-esensial (receipt slip boleh diganti instant-appear + checkmark saat reduced motion aktif).

---

## 7. Imagery & Ikonografi

- **Foto produk (niche: alat tulis kertas & kayu):** subjek = notebook jahit tangan, pensil/pena kayu, kartu letterpress, aksesoris meja kayu. Cahaya natural, background hangat netral (permukaan kayu, linen, kertas kraft) — bukan studio putih bersih generik e-commerce besar. Konsistensi material (kertas/kayu) di semua foto adalah bagian dari signature, bukan kebetulan.
- **Hindari:** ilustrasi vektor gaya "undraw"/flat-illustration generik, foto stok yang terasa AI-generated (kulit terlalu halus, komposisi terlalu simetris, teks palsu di background).
- **Ikon:** garis tipis (line icon, stroke 1.5px), set konsisten (misal Lucide sudah cukup — tapi kustomisasi 3–4 ikon signature seperti ikon cart berbentuk kantong belanja bersimpul, bukan trolley/cart generik).
- **Empty state:** ilustrasi garis sederhana (bukan ilustrasi berwarna penuh), dengan copy yang mengarahkan aksi (lihat bagian 8).

---

## 8. Voice & Microcopy

- Aktif, langsung, tidak menjual berlebihan. Tombol bilang persis apa yang terjadi: "Tambah ke keranjang" bukan "Yuk, checkout sekarang!".
- Nama & copy produk menyebut bahan secara konkret — material adalah narasi utama toko: "Notebook jahit tangan A5 — kertas daur ulang", "Pensil kayu set 6", bukan judul puitis kosong.
- Nama aksi konsisten dari tombol sampai konfirmasi: tombol "Bayar Sekarang" → toast/hasil bilang "Pembayaran diproses", bukan istilah lain.
- Error tidak minta maaf berlebihan, langsung jelaskan apa yang salah dan apa yang bisa dilakukan:
  - Buruk: *"Ups! Sepertinya ada yang salah 😢"*
  - Baik: *"Stok tersisa 2. Kurangi jumlah untuk melanjutkan."*
- Empty state adalah ajakan bertindak, bukan sekadar pemberitahuan:
  - Buruk: *"Keranjang Anda kosong"*
  - Baik: *"Belum ada barang di keranjang. Mulai jelajahi produk kami."* + tombol jelas.
- Dashboard: nada lebih fungsional/singkat dari storefront — pemilik toko butuh informasi cepat, bukan copy hangat. "Stok menipis (3 produk)" bukan "Waduh, beberapa produkmu hampir habis nih!".

---

## 9. Yang Harus Dihindari (anti-pattern eksplisit)

Supaya tidak jatuh ke default visual AI generation yang gampang dikenali:

- ❌ Krem hangat (`#F4F1EA`-ish) + aksen terracotta lembut (`#D97757`-ish) — kombinasi paling sering muncul di desain AI-generated.
- ❌ Background nyaris hitam + satu aksen neon (acid-green/vermilion) sebagai "dark mode dramatis" default.
- ❌ Broadsheet koran generik (hairline rules di mana-mana, radius nol total, kolom sempit padat) — kecuali memang jadi keputusan sadar, di sini kita pilih radius kecil konsisten sebagai pembeda.
- ❌ Dashboard admin dengan tumpukan card berbayang lembut + ikon bulat gradient warna-warni per metric — pola template admin panel generik.
- ❌ Angka besar + label kecil + panah tren hijau/merah sebagai satu-satunya bentuk penyajian metric, tanpa variasi.
- ❌ Numbered marker (01/02/03) untuk fitur yang bukan benar-benar berurutan.
- ❌ Ilustrasi flat-vector "undraw-style" untuk empty state atau onboarding.
- ❌ Gradient di background, button, atau card manapun.
- ❌ Shadow tebal/blur besar sebagai elevasi utama — gunakan border tipis + offset warna sebagai gantinya.
- ❌ Emoji di UI produksi (boleh di internal changelog/commit message, tidak di copy user-facing).

---

## 10. Aksesibilitas & Baseline Teknis

- Kontras teks minimal WCAG AA (4.5:1 untuk body text) — khususnya cek `stamp` di atas `paper` dan `mustard` di atas `paper` karena keduanya cenderung mid-tone.
- Semua elemen interaktif (button, link, input, badge yang clickable) punya visible focus state — outline/ring, bukan hanya perubahan warna tipis.
- Responsive breakpoint: mobile-first, breakpoint utama di 640px / 1024px / 1280px.
- `prefers-reduced-motion` dihormati di semua animasi non-esensial (lihat bagian 6).
- Tap target minimal 44×44px di mobile untuk semua tombol/ikon interaktif.

---

## 11. Ringkasan Perbedaan Storefront vs Dashboard

| Aspek | Storefront | Dashboard |
|---|---|---|
| Warna primer | `paper` + `stamp` | `ink`/`ledger` |
| Nuansa | Katalog/tag hangat | Buku kas/ledger fungsional |
| Fraunces dipakai untuk | Hero, judul section | Judul halaman, metric besar saja |
| Motion | Ada 1 signature (receipt slip) | Minimal, cepat, tanpa dekorasi |
| Nada copy | Ramah, mengundang | Singkat, fungsional |
| Card style | Tag berlubang + perforasi | Tabel ledger, minim card |

---

*Dokumen ini adalah bahasa desain, bukan implementasi. Detail komponen React/Tailwind spesifik (nama class, token Tailwind config) diturunkan dari sini saat implementasi frontend dimulai — sebaiknya dibuat file terpisah `TOKENS.md` atau `tailwind.config` langsung begitu setup project frontend dimulai, supaya token di atas tidak didefinisikan dua kali secara manual.*