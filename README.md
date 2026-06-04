# 📈 SmartInvest

SmartInvest merupakan platform berbasis web yang dirancang untuk membantu investor, khususnya investor pemula, dalam menentukan alokasi investasi saham secara optimal dengan memanfaatkan data historis pasar saham Indonesia serta teknologi Artificial Intelligence (AI).

Platform ini menyediakan analisis tren pasar, optimasi portofolio saham, interpretasi hasil berbasis AI, serta visualisasi data investasi untuk membantu pengguna mengambil keputusan investasi yang lebih rasional dan berbasis data.

---

## 🚀 Fitur Utama

### 1. Dashboard Analisis Tren IHSG
Menampilkan kondisi pasar saham Indonesia melalui visualisasi pergerakan **Indeks Harga Saham Gabungan (IHSG)** berdasarkan data historis dan real-time.

### 2. Analisis & Optimasi Portofolio
Sistem membantu pengguna menentukan komposisi portofolio investasi optimal berdasarkan:
- Modal investasi
- Periode historis
- Indeks saham pilihan
- Metode optimasi investasi

### 3. Perbandingan Metode Portofolio
SmartInvest membandingkan beberapa metode optimasi investasi:

- **Mean Variance Portfolio (MVP)**
- **Single Index Model (SIM)**
- **Capital Asset Pricing Model (CAPM)**

Sistem akan memilih metode terbaik berdasarkan:
- Expected Return
- Risk
- Sharpe Ratio

### 4. AI Advisor
Fitur AI yang membantu pengguna memahami hasil analisis investasi secara otomatis menggunakan penjelasan naratif berbasis Artificial Intelligence.

### 5. Visualisasi Pasar Saham
Fitur tambahan:
- Grafik IHSG
- OHLC Market Data
- Index Performance
- Index Diary (Heatmap)
- Low–High Range
- IDX30 & LQ45 Monitoring

---

## 🏗️ Arsitektur Sistem

```txt
Frontend (React + Vite)
            ↓
      FastAPI REST API
            ↓
AI Model / Portfolio Analysis
            ↓
        Supabase Database
```

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- CSS
- Tailwind CSS

### Backend
- FastAPI (Python)

### Artificial Intelligence & Data Science
- Python
- Gemini API
- Portfolio Optimization
- Historical Stock Analysis

### Database & Authentication
- Supabase

### External API
- Twelve Data API
- Yahoo Finance

---

## 📂 Struktur Folder Project

```txt
SMARTINVEST-APP/
│── ai-engineer/
│   ├── FastAPI_Rekomendasi_Services/
│   ├── FastAPI_TrenSaham_Services/
│   ├── Model_Analisis/
│   ├── Model_Rekomendasi/
│
│── data-science/
│   ├── dashboard/
│   ├── notebook/
│
│── fullstack/
│   ├── backend/
│   ├── frontend/
│
│── README.md
│── requirements.txt
```

---

## ⚙️ Environment Setup

### Backend (.env)

Buat file `.env` pada folder backend/FastAPI:

```env
GEMINI_API_KEY_IHSG=your_api_key
GEMINI_API_KEY_ANALYSIS=your_api_key

SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

---

### Frontend (.env)

Buat file `.env` pada folder frontend:

```env
VITE_TWELVEDATA_KEY=your_api_key

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

VITE_AI_BASE_URL=your_fastapi_endpoint

GOAPI_API_KEY=your_api_key
```

> ⚠️ Jangan memasukkan API Key asli atau kredensial sensitif ke repository publik.

---

## 📦 Installation

### 1. Clone Repository

```bash
git clone https://github.com/your-username/smartinvest.git
cd smartinvest
```

---

### 2. Setup Frontend

Masuk ke folder frontend:

```bash
cd fullstack/frontend
```

Install dependency:

```bash
npm install
```

Jalankan frontend:

```bash
npm run dev
```

Frontend berjalan pada:

```txt
http://localhost:5173
```

---

### 3. Setup FastAPI Backend

Masuk ke folder FastAPI:

```bash
cd fullstack/backend/SmartfastApi
```

Install dependency Python:

```bash
pip install -r requirements.txt
```

Jalankan server FastAPI:

```bash
uvicorn main:app --reload
```

Backend berjalan pada:

```txt
http://localhost:8000
```

---

## ▶️ Cara Menjalankan Aplikasi

1. Jalankan FastAPI terlebih dahulu
2. Jalankan frontend React
3. Buka browser
4. Akses:

```txt
http://localhost:5173
```

5. Register akun baru
6. Login ke SmartInvest
7. Masukkan parameter investasi
8. Klik **Mulai Analisis**
9. Lihat hasil rekomendasi portofolio dan interpretasi AI

---

## 📊 Dataset & Sumber Data

Data yang digunakan berasal dari:

- Yahoo Finance
- Twelve Data API
- Data historis saham Indonesia
- Indeks IDX30 & LQ45

---

## 🤖 Model AI & Analisis

SmartInvest menggunakan kombinasi:

### Analisis Tren Pasar
Untuk membaca kondisi pasar berdasarkan tren historis IHSG.

### Optimasi Portofolio
Metode:
- MVP
- SIM
- CAPM

### AI Recommendation
Menggunakan **Gemini API** untuk menghasilkan interpretasi naratif hasil analisis investasi.

---

## 🌐 Deployment

Frontend:
```txt
https://your-frontend-link.vercel.app
```

Backend API:
```txt
https://your-fastapi-link.hf.space
```

---

## 👥 Tim Pengembang

**CC26-PSU409 – Coding Camp 2026**

- Helmi Azkia — Full-Stack Web Developer
- Muhammad Zidni Syukron — Full-Stack Web Developer
- Almas Ikramina — Data Scientist
- Zahra Salma Dwi Meylinda — Data Scientist
- Helvia Zahra Adinda — AI Engineer
- Galih Putra Pratama — AI Engineer

---

## ⚠️ Disclaimer

SmartInvest merupakan alat bantu analisis investasi dan **bukan platform financial advisor resmi**. Seluruh hasil rekomendasi investasi dihasilkan berdasarkan data historis, model analisis, dan interpretasi AI.

Keputusan investasi tetap berada pada pengguna dan memiliki risiko masing-masing.

---

## 📄 License

Project ini dikembangkan untuk kebutuhan **Coding Camp 2026 Capstone Project**.