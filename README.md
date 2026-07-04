# Kedai Poin — Sistem Loyalty & Stok Sederhana untuk Cafe

Studi kasus: UMKM cafe kesulitan mengelola stok bahan baku secara manual dan masih
menggunakan kartu loyalti kertas untuk pelanggan tetap. Aplikasi ini mengelola
keduanya dalam satu sistem berbasis web.

## Fitur

- **Dashboard** — ringkasan stok menipis, jumlah pelanggan, transaksi & omzet hari ini
- **Stok Bahan Baku** — CRUD bahan baku dengan alert otomatis saat stok ≤ batas minimum
- **Menu** — CRUD menu, dengan pemetaan bahan baku yang terpakai per porsi
- **Kasir (POS)** — mencatat transaksi; stok berkurang otomatis & pelanggan dapat poin otomatis
- **Pelanggan** — kartu loyalti digital, saldo poin per pelanggan
- **Tukar Poin** — pelanggan menukar poin dengan reward
- **Riwayat Transaksi** — log semua transaksi

Semua halaman dapat diakses tanpa login, sesuai ketentuan tugas.

## Teknologi

- **Next.js 16** (App Router, JavaScript)
- **@libsql/client** — database SQLite yang bisa jalan lokal (file) maupun cloud
  (Turso) tanpa batasan limit seperti Supabase
- **Tailwind CSS v4**

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Database SQLite lokal (`local.db`) akan otomatis dibuat dan diisi data contoh saat
pertama kali diakses.

## Deploy ke Production (Vercel + Turso)

1. **Buat database Turso (gratis, tanpa limit ketat seperti Supabase)**
   - Daftar di https://turso.tech
   - Buat database baru: `turso db create kedai-poin`
   - Ambil connection URL: `turso db show kedai-poin --url`
   - Buat auth token: `turso db tokens create kedai-poin`

2. **Deploy ke Vercel**
   - Push folder ini ke repository GitHub
   - Import project di https://vercel.com
   - Tambahkan Environment Variables:
     - `DATABASE_URL` = URL Turso (format `libsql://...`)
     - `DATABASE_AUTH_TOKEN` = token dari langkah 1
   - Deploy

Alternatif deployment lain (Netlify, Cloudflare Workers) juga bisa digunakan selama
environment variable di atas diset dengan benar.

## Struktur Database

- `stock_items` — bahan baku (nama, satuan, jumlah, batas minimum)
- `menu_items` — menu cafe (nama, harga, poin yang didapat)
- `menu_ingredients` — komposisi bahan baku per menu
- `customers` — data pelanggan & saldo poin
- `transactions` — riwayat penjualan
- `redemptions` — riwayat penukaran poin
