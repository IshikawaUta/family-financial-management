# 💰 FinFamily - Smart Family Finance

FinFamily adalah aplikasi manajemen keuangan keluarga modern berbasis web yang dirancang untuk kecepatan, keamanan, dan kemudahan penggunaan. Aplikasi ini memungkinkan pengguna untuk mencatat transaksi, memantau grafik tahunan, serta melakukan pemindaian struk otomatis menggunakan OCR.

## 🚀 Fitur Unggulan

-   **Dashboard Real-time**: Pantau saldo, pemasukan, dan pengeluaran secara instan.
-   **Smart OCR Scanner**: Ambil foto struk belanja dan biarkan AI mencatat nominal serta kategorinya secara otomatis.
-   **Notifikasi Email (Brevo)**: Setiap transaksi yang tercatat akan mengirimkan konfirmasi ke email pengguna melalui API Brevo.
-   **Export Data**: Unduh laporan keuangan dalam format **Excel (XLSX)** atau **PDF**.
-   **Pencarian Cerdas**: Fitur pencarian transaksi terintegrasi bahkan di halaman 404.
-   **Dark Mode Support**: Tampilan yang nyaman di mata baik siang maupun malam.

## 🛠️ Stack Teknologi

-   **Frontend**: HTML5, Tailwind CSS, JavaScript (Vanilla)
-   **Backend**: Netlify Functions (Node.js)
-   **Database**: MongoDB Atlas
-   **Auth**: Netlify Identity (JWT)
-   **Email**: Brevo API (via Axios)
-   **OCR**: OCR.space API
-   **Charts**: Chart.js

## ⚙️ Persiapan Environment

Buat file `.env` di root direktori atau tambahkan variabel berikut di dashboard Netlify:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/finance_db
OCR_API_KEY=your_ocr_space_api_key
BREVO_API_KEY=your_brevo_api_key_v3
EMAIL_FROM=email_anda@domain.com
URL=[https://finfamily.netlify.app](https://finfamily.netlify.app)
```

## 📦 Instalasi Lokal

1. Clone repositori ini:

```bash
git clone https://github.com/IshikawaUta/family-financial-management.git
cd family-financial-management
```

2. Instal dependensi untuk fungsi backend:

```bash
npm install
```

3. Jalankan server pengembangan lokal menggunakan Netlify CLI:

```bash
netlify dev
```

4. Buka `http://localhost:8888` di browser Anda.

## 📂 Struktur Folder

* `/functions` - API serverless (Node.js) untuk operasi CRUD dan integrasi pihak ketiga.
* `index.html` - Antarmuka utama aplikasi.
* `404.html` - Halaman error kustom dengan fitur pencarian & export.
* `_config.yml` - Konfigurasi Jekyll untuk deployment.
* `robots.txt` - Aturan pengindeksan mesin pencari.

## 📄 Lisensi

Proyek ini dibuat untuk keperluan pribadi dan edukasi.

---

**Developed by [IshikawaUta**](https://www.google.com/search?q=https://github.com/IshikawaUta)