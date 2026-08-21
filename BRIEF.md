# Brief Project: E-commerce Customer Behavior Analysis (Olist)

Tolong bangun project data analyst kedua ini dari nol. Dataset dan struktur sudah aku siapkan di bawah, ikuti persis supaya SQL join-nya benar.

## Konteks

Dataset: **Brazilian E-Commerce Public Dataset by Olist**, 99.441 order (2016-2018), terdiri dari 8 file CSV yang saling berelasi + 1 file translasi kategori. Semua file sudah ada di folder `data/`.

## Skema data & relasi antar tabel

```
olist_orders_dataset.csv
  order_id (PK), customer_id (FK -> customers), order_status,
  order_purchase_timestamp, order_approved_at,
  order_delivered_carrier_date, order_delivered_customer_date,
  order_estimated_delivery_date

olist_customers_dataset.csv
  customer_id (PK), customer_unique_id, customer_zip_code_prefix,
  customer_city, customer_state

olist_order_items_dataset.csv
  order_id (FK -> orders), order_item_id, product_id (FK -> products),
  seller_id (FK -> sellers), shipping_limit_date, price, freight_value

olist_order_payments_dataset.csv
  order_id (FK -> orders), payment_sequential, payment_type,
  payment_installments, payment_value

olist_order_reviews_dataset.csv
  review_id (PK), order_id (FK -> orders), review_score,
  review_comment_title, review_comment_message,
  review_creation_date, review_answer_timestamp

olist_products_dataset.csv
  product_id (PK), product_category_name (FK -> category_translation),
  product_name_lenght, product_description_lenght, product_photos_qty,
  product_weight_g, product_length_cm, product_height_cm, product_width_cm

olist_sellers_dataset.csv
  seller_id (PK), seller_zip_code_prefix, seller_city, seller_state

product_category_name_translation.csv
  product_category_name (PK), product_category_name_english
```

## Catatan kualitas data (sudah dicek, JANGAN drop baris secara sembarangan)

- `orders`: kolom tanggal delivery (`order_approved_at`, `order_delivered_carrier_date`, `order_delivered_customer_date`) banyak yang kosong — ini **valid**, karena order tersebut memang belum/tidak sampai (status `canceled`, `unavailable`, `processing`, dll). Jangan di-drop, cukup di-exclude dari perhitungan yang butuh tanggal delivery (misal saat hitung rata-rata waktu pengiriman, filter `WHERE order_delivered_customer_date IS NOT NULL`).
- `products`: 610 dari 32.951 produk tidak punya `product_category_name`. Kategorikan sebagai `"unknown"` saat join dengan tabel translasi, jangan di-drop dari tabel produk.
- `reviews`: `review_comment_title` dan `review_comment_message` banyak kosong karena memang opsional diisi customer. Tidak berpengaruh ke analisis `review_score` (kolom ini selalu terisi).

## Pertanyaan bisnis yang harus terjawab

1. Bagaimana perilaku customer — berapa besar porsi repeat customer (pakai `customer_unique_id`, karena satu customer bisa punya banyak `customer_id`), dan seperti apa segmentasi RFM (Recency, Frequency, Monetary)?
2. Kategori produk apa yang paling laris dan yang punya rating (review_score) tertinggi/terendah?
3. Bagaimana performa pengiriman — on-time delivery rate (delivered_customer_date vs estimated_delivery_date) dan rata-rata waktu pengiriman per state?
4. Metode pembayaran (`payment_type`) apa yang paling umum, dan apakah jumlah cicilan (`payment_installments`) berhubungan dengan nilai order?
5. Apakah ada hubungan antara lama pengiriman dan review_score yang diberikan customer?

## Tugas 1 — Data preparation & SQL

- Load kedelapan CSV ke database SQLite (`sql/olist.db`), satu tabel per file, nama tabel disederhanakan (`orders`, `customers`, `order_items`, `payments`, `reviews`, `products`, `sellers`, `category_translation`).
- Konversi semua kolom tanggal ke format `YYYY-MM-DD HH:MM:SS` sebelum insert ke SQLite (supaya fungsi tanggal SQL jalan normal — ini sempat jadi bug di project pertama, jangan diulang).
- Buat `sql/queries.sql` berisi query SQL (pakai JOIN antar tabel sesuai skema di atas) yang menjawab kelima pertanyaan bisnis di atas. Setiap query diberi komentar pertanyaan bisnis yang dijawab.
- Buat 1 query tambahan yang menggabungkan `products` + `category_translation` supaya nama kategori dalam bahasa Inggris (`product_category_name_english`) dipakai di semua query lain yang menyebut kategori produk, bukan nama Portugis aslinya.

## Tugas 2 — Notebook dokumentasi

Buat `notebook/ecommerce_analysis.ipynb` dengan struktur yang sama seperti project pertama (Superstore): data quality check di awal, EDA per pertanyaan bisnis pakai pandas, section SQL yang connect ke `sql/olist.db` dan jalankan minimal 3 query dari `queries.sql`, ditutup dengan section kesimpulan & rekomendasi bisnis.

## Tugas 3 — Dashboard (Next.js 15 + Tailwind v4)

Desain dashboard-nya dibuat terpisah lewat Google Stitch dengan 4 screen: **Overview**, **Customer Behavior**, **Product Performance**, **Orders & Delivery** (kode HTML/Tailwind hasil export Stitch akan aku kasih terpisah sebagai referensi visual persis — pakai itu sebagai acuan styling/layout, jangan bikin desain sendiri dari nol).

**Arsitektur:**
- Next.js 15, App Router, Tailwind v4.
- Karena data ada di SQLite (`sql/olist.db`) dan Next.js jalan di server (bukan Python), pakai package `better-sqlite3` untuk baca database dari dalam API routes.
- Buat API routes di `app/api/` (misal `app/api/overview/route.ts`, `app/api/customers/route.ts`, dst) yang menjalankan query SQL (boleh reuse query dari `sql/queries.sql`) dan mengembalikan JSON.
- Setiap halaman dashboard (`app/overview/page.tsx`, `app/customers/page.tsx`, `app/products/page.tsx`, `app/orders/page.tsx`) fetch data dari API route masing-masing, lalu render pakai chart library (pakai `recharts`, ringan dan gampang dipasang dengan Tailwind).
- Sidebar navigasi 4 halaman, filter tanggal & state di halaman yang relevan (state disimpan di URL query param, bukan hanya client state, supaya bisa di-share sebagai link).

**Konten per halaman:**
- Overview: KPI cards (Total Revenue, Total Orders, Avg Order Value, Repeat Customer Rate) + tren bulanan.
- Customer Behavior: tabel/chart segmentasi RFM, distribusi customer per state.
- Product Performance: tabel top kategori produk dengan revenue & avg review score.
- Orders & Delivery: KPI on-time delivery rate & avg delivery time, breakdown per state.

**Penting:** `sql/olist.db` harus ikut ke-bundle sebagai read-only file (taruh di root project, bukan di `public/`, dan akses lewat path relatif `process.cwd()` di API route) supaya tetap terbaca saat di-deploy ke Vercel.

## Tugas 4 — Kelengkapan & persiapan deployment

- `package.json` dengan semua dependency ter-pin versinya (`next`, `better-sqlite3`, `recharts`, `tailwindcss`, dll).
- `.gitignore` standar Next.js (`node_modules`, `.next`, dll) — pastikan `sql/olist.db` TIDAK ke-ignore, karena dashboard butuh file itu saat runtime.
- `README.md` lengkap: business questions, key findings, screenshot dashboard, cara run (`npm install` lalu `npm run dev`).
- Pastikan `npm run build` sukses tanpa error (ini yang dipakai Vercel saat deploy) — cek khusus apakah `better-sqlite3` perlu konfigurasi tambahan di `next.config.js` (biasanya perlu ditambahkan ke `serverExternalPackages` supaya tidak di-bundle secara salah).
- `git init` + commit pertama. Aku yang push ke GitHub & deploy ke Vercel secara manual setelah ini selesai (tinggal import repo di vercel.com, otomatis terdeteksi sebagai project Next.js).

## Kriteria selesai

- Semua query di `sql/queries.sql` jalan tanpa error terhadap `sql/olist.db`.
- `npm run dev` jalan tanpa error, 4 halaman bisa diakses dan menampilkan data asli dari SQLite (bukan placeholder/dummy).
- `npm run build` sukses tanpa error, siap di-deploy ke Vercel.
- Struktur folder:
```
ecommerce-project/
├── data/                 (9 file CSV, sudah ada)
├── sql/
│   ├── olist.db
│   └── queries.sql
├── notebook/
│   └── ecommerce_analysis.ipynb
├── app/
│   ├── api/
│   ├── overview/page.tsx
│   ├── customers/page.tsx
│   ├── products/page.tsx
│   └── orders/page.tsx
├── package.json
├── next.config.js
├── .gitignore
└── README.md
```

Kerjakan satu tugas dulu (mulai dari Tugas 1), tunjukkan hasilnya untuk dicek sebelum lanjut ke tugas berikutnya.
