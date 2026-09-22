# 🌟 Portofolio Profil Web Modern - Michael Pratama Nasution

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=252422&height=200&section=header&text=Portofolio%20Web%20Bootstrap%205&fontSize=40&fontColor=FFFCF2&animation=fadeIn&fontAlignY=38&desc=Praktikum%20PPW%20Minggu%2003%20%E2%80%A2%20Refaktorisasi%20Bootstrap%205.3%20%2B%20Custom%20Overrides&descAlignY=58&descSize=17" alt="Header Banner" width="100%"/>
</p>

<p align="center">
  <a href="https://github.com/MichaelNasution"><img src="https://img.shields.io/badge/Mahasiswa-Michael%20Pratama%20Nasution-252422?style=for-the-badge&logo=github&logoColor=FFFCF2" alt="Mahasiswa"/></a>
  <img src="https://img.shields.io/badge/NIM-12S24003-EB5E28?style=for-the-badge" alt="NIM"/>
  <img src="https://img.shields.io/badge/Mata%20Kuliah-PPW%20(12S3101)-403D39?style=for-the-badge" alt="Mata Kuliah"/>
  <img src="https://img.shields.io/badge/Prodi-S1%20Sistem%20Informasi-2D6A4F?style=for-the-badge" alt="Prodi"/>
  <img src="https://img.shields.io/badge/Kampus-Institut%20Teknologi%20Del-252422?style=for-the-badge" alt="Kampus"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Bootstrap-5.3.3%20CDN-7952B3?style=flat-square&logo=bootstrap&logoColor=white" alt="Bootstrap 5.3"/>
  <img src="https://img.shields.io/badge/Bootstrap%20Icons-1.11.3-7952B3?style=flat-square&logo=bootstrap&logoColor=white" alt="Bootstrap Icons"/>
  <img src="https://img.shields.io/badge/Custom%20CSS-Rustic%20Charm%20Theme-EB5E28?style=flat-square" alt="Rustic Charm"/>
  <img src="https://img.shields.io/badge/Aksesibilitas-WCAG%202.2%20AA-success?style=flat-square&logo=w3c&logoColor=white" alt="WCAG AA"/>
  <img src="https://img.shields.io/badge/Validasi-Bootstrap%20Client--Side-2D6A4F?style=flat-square" alt="Validasi Form"/>
</p>

---

## 🔗 Tautan Demo Langsung & Repositori

- **Live Demo (GitHub Pages)**: [https://michaelnasution.github.io/ppw-2026-week2-12S24003/](https://michaelnasution.github.io/ppw-2026-week2-12S24003/) *(Aktifkan pada branch `week3-bootstrap`)*
- **Branch Kerja**: `week3-bootstrap`
- **Repositori**: `MichaelNasution/ppw-2026-week2-12S24003`

---

## 📌 Ringkasan Pembaruan Minggu 3

Pada penugasan **Minggu 03**, halaman web portofolio profil dari Minggu 02 direfaktorisasi secara menyeluruh menggunakan pustaka CSS **Bootstrap 5.3.3** dan **Bootstrap Icons** melalui Content Delivery Network (CDN), yang dipadukan dengan **Custom CSS Overrides** pada berkas `custom-style.css`.

Fokus utama pembaruan:
1. **Pondasi Framework Modern**: Integrasi Bootstrap 5.3.3 CSS & JS Bundle beserta Bootstrap Icons tanpa menghilangkan struktur semantik HTML5 yang telah dibangun sebelumnya.
2. **Navbar Responsif & Sticky**: Navigasi sticky yang mendukung menu *collapse/expand* dengan hamburger toggle di layar mobile.
3. **Hero Section Elegan**: Banner visual full-width dengan kontras gelap (*Carbon Black*), status badge interaktif, tipografi tegas, dan 2 tombol *Call to Action* (CTA).
4. **Refaktorisasi Kartu Profil**: Menggunakan komponen Bootstrap Card dan sistem 2 kolom grid yang adaptif di semua ukuran layar.
5. **Transformasi Tabel ke Grid Kartu Proyek & Modal Dialog**: Menampilkan 4 kartu proyek interaktif dengan micro-interaction hover, badge stack teknologi, serta modal dialog detail terpisah untuk tiap proyek.
6. **Formulir Interaktif Canggih**: Penggunaan Floating Labels, Input Group berikon, segmented toggle radio button, dan validasi visual client-side *real-time*.
7. **Identitas Visual Personal "Rustic Charm"**: Overrides CSS murni berbasis variabel `:root` tanpa penggunaan `!important`, memastikan nol warna biru default Bootstrap yang tertinggal.

---

## ⚖️ Tabel Komparasi: Sebelum vs Sesudah Integrasi Framework

| Aspek / Komponen | Sebelum (Minggu 02 - Pure HTML5 & CSS3) | Sesudah (Minggu 03 - Bootstrap 5.3 + Custom Overrides) |
| :--- | :--- | :--- |
| **Struktur & Layout** | CSS Flexbox & CSS Grid manual kaku dengan batas kontainer tetap (`max-width: 1000px`). | Sistem Grid Bootstrap 12-kolom responsif (`container`, `row`, `col-*`), `row-cols-*`, dan utility spacing terstandarisasi. |
| **Header & Navigasi** | Header statis Flexbox dengan link horizontal sederhana tanpa hamburger menu di ponsel. | **Bootstrap Navbar Sticky** (`navbar-expand-lg sticky-top navbar-dark`) dengan **Hamburger Toggler** fungsional di layar kecil. |
| **Hero Section** | Belum tersedia (halaman langsung dimulai dari kartu profil). | **Hero Section Full-Width** bertema gelap (*Carbon Black*), badge ketersediaan beranimasi *pulse*, tagline, dan 2 tombol CTA navigasi. |
| **Section Tentang Saya** | Struktur manual div dua kolom dengan pembatas garis CSS murni. | **Bootstrap Card** (`card shadow-sm rounded-4`) dengan pembagian kolom grid (`col-lg-8` & `col-lg-4`) dan Badge Pills resmi. |
| **Portofolio Karya** | Tabel statis HTML (`<table>`, `<thead>`, `<tbody>`, `<tfoot>`) yang digulir horizontal pada mobile. | **Grid 4 Kartu Proyek** (`row-cols-1 row-cols-md-2 row-cols-lg-3 g-4`) + **4 Modal Dialog** interaktif terhubung untuk rincian pekerjaan. |
| **Galeri Keahlian** | Dua artikel terpisah dalam CSS Grid statis. | Ditata ulang menjadi **List Group Numbered** Bootstrap di bawah grid kartu proyek dengan badge kategori keahlian. |
| **Formulir Kontak** | Input form standar dengan label statis di atas kolom input. | **Floating Labels** (`form-floating`), **Input Group** berikon di kiri, **Toggle Button Group** (`btn-check`), dan **Real-Time Client Validation** (`was-validated`). |
| **Styling & Theming** | Menggunakan CSS Reset manual dan variabel vanilla CSS di `style.css`. | Berkas `custom-style.css` yang melakukan **overrides spesifik tanpa `!important`** pada komponen Bootstrap, selaras dengan palet *Rustic Charm*. |

---

## 🎨 Palet Warna "Rustic Charm" (Aturan 60-30-10)

| Proporsi | Peran Desain | Nama Warna | Kode HEX | Variabel CSS | Penerapan |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **60%** | Dominan / Background | Floral White | `#FFFCF2` | `--color-bg` | Latar utama halaman web |
| **60%** | Permukaan Komponen | Pure White | `#FFFFFF` | `--color-surface` | Kartu profil, kartu proyek, isi modal dialog |
| **30%** | Teks Body Utama | Charcoal Brown | `#403D39` | `--color-text` | Teks paragraf, biografi, deskripsi proyek |
| **30%** | Heading & Dark Accent | Carbon Black | `#252422` | `--color-heading` | Navbar, footer, modal-header, heading judul |
| **30%** | Elemen Netral / Border | Silver Mist | `#CCC5B9` | `--color-border` | Garis tepi kartu, pemisah kolom, input form |
| **10%** | Aksen Interaktif | Spicy Paprika | `#EB5E28` | `--color-accent` | Tombol CTA, hover link, badge sorotan, focus ring |

---

## 📸 Dokumentasi & Pratinjau Tampilan (Screenshots)

> *Tambahkan tangkapan layar antarmuka halaman web pada placeholder di bawah ini setelah dideploy:*

| Tampilan Desktop (>= 1200px) | Tampilan Mobile (< 576px) |
| :---: | :---: |
| ![Pratinjau Desktop](https://via.placeholder.com/600x350/252422/FFFCF2?text=Screenshot+Desktop+View) | ![Pratinjau Mobile](https://via.placeholder.com/300x550/252422/FFFCF2?text=Screenshot+Mobile+View) |

| Modal Dialog Proyek Interaktif | Validasi Formulir Client-Side |
| :---: | :---: |
| ![Pratinjau Modal](https://via.placeholder.com/450x300/403D39/FFFCF2?text=Screenshot+Modal+Dialog) | ![Pratinjau Validasi Form](https://via.placeholder.com/450x300/EB5E28/FFFCF2?text=Screenshot+Form+Validation) |

---

## 📂 Struktur Berkas Proyek

```
ppw-2026-week2-12S24003/
├── index.html           # Berkas HTML5 utama dengan integrasi Bootstrap 5.3 CDN & semantik lengkap
├── custom-style.css     # Berkas styling kustom (Overrides Bootstrap bertema Rustic Charm tanpa !important)
├── style.css            # Berkas CSS Minggu 02 (diarsipkan / dikosongkan)
├── README.md            # Dokumentasi lengkap proyek dan komparasi refaktorisasi
└── .vscode/
    └── settings.json    # Konfigurasi workspace editor
```

---

## 🚀 Panduan Menjalankan & Deployment

### 1. Menjalankan di Komputer Lokal
1. Pastikan berkas proyek berada pada direktori lokal.
2. Buka berkas `index.html` menggunakan peramban web modern (Google Chrome, Mozilla Firefox, Microsoft Edge), atau gunakan ekstensi **Live Server** pada VS Code.

### 2. Prosedur Commit & Deploy ke GitHub Pages
Jalankan perintah berikut pada terminal Git:
```bash
# 1. Pastikan berada di branch week3-bootstrap
git checkout -b week3-bootstrap

# 2. Tambahkan perubahan dan lakukan commit
git add .
git commit -m "feat: refactor portofolio menggunakan Bootstrap 5.3 CDN dan Custom CSS Overrides"

# 3. Push ke branch remote GitHub
git push -u origin week3-bootstrap

# 4. Aktivasi GitHub Pages:
# - Buka repositori di GitHub -> Settings -> Pages
# - Pada opsi 'Branch', pilih 'week3-bootstrap' dan folder '/ (root)'
# - Klik 'Save' dan tunggu proses deployment selesai.
```

---

## 👤 Identitas Mahasiswa

- **Nama Lengkap** : Michael Pratama Nasution
- **NIM** : 12S24003
- **Program Studi** : S1 Sistem Informasi
- **Mata Kuliah** : Pemrograman dan Pengujian Aplikasi Web (12S3101)
- **Institusi** : Institut Teknologi Del
- **Email Institusi** : [michael.nasution@del.ac.id](mailto:michael.nasution@del.ac.id)
- **Tahun Akademik** : 2025/2026
