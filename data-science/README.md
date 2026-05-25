# Data Science

# 📈 SmartInvest Dashboard

## 📌 Project Overview

SmartInvest Dashboard merupakan aplikasi analisis saham dan rekomendasi portofolio berbasis data yang dikembangkan untuk membantu investor memahami hubungan antara return, risiko, volatilitas, dan alokasi investasi secara lebih terarah.

Dashboard ini mengimplementasikan konsep modern portfolio theory dan financial analytics untuk menghasilkan insight investasi berbasis data historis saham.

Analisis yang dilakukan mencakup:

- 📊 Exploratory Data Analysis (EDA) saham indeks LQ45 dan IDX30
- 📈 Analisis Return dan Risk saham
- 📉 Rolling Volatility dan Cumulative Return Analysis
- 🔍 Sharpe Ratio Ranking
- 🔗 Correlation Heatmap antar saham
- 💼 Portfolio Optimization menggunakan metode MVEP
- 🤖 AI Portfolio Insight untuk interpretasi hasil portofolio

Seluruh hasil analisis divisualisasikan dalam dashboard interaktif menggunakan **Streamlit** dengan tampilan modern dan professional financial dashboard look.

---

# ❓ Analytical Questions

1. Bagaimana distribusi return dan risiko (volatilitas) saham LQ45 dan IDX30 selama periode pengamatan 1 April 2021 – 1 April 2026?
2. Saham LQ45 dan IDX30 mana yang memiliki rata-rata return tertinggi maupun terendah selama periode analisis?
3. Saham mana yang memiliki tingkat risiko (standar deviasi return) paling tinggi dan paling rendah selama periode analisis?
4. Bagaimana hubungan (korelasi) antar saham LQ45 dan IDX30, dan saham mana yang memiliki korelasi rendah untuk kebutuhan diversifikasi portofolio?
5. Saham mana yang memberikan kombinasi risk-return terbaik berdasarkan rasio (misalnya Sharpe Ratio) selama periode analisis?
6. Bagaimana komposisi portofolio optimal yang dapat dibentuk dari saham LQ45 dan IDX30 untuk memaksimalkan return dengan risiko minimum?
7. Bagaimana performa portofolio optimal dibandingkan dengan investasi pada satu saham saja dalam periode yang sama?

---

# 📊 Dashboard Features

## 📈 Exploratory Data Analysis (EDA)

### 🔹 Return Analysis
- Top 10 Annualized Return
- Bottom 10 Annualized Return

### 🔹 Risk Analysis
- Top 10 Annualized Volatility
- Bottom 10 Annualized Volatility

### 🔹 Sharpe Ratio Analysis
- Sharpe Ratio Ranking
- Risk vs Return Scatter Plot

### 🔹 Correlation Analysis
- Correlation Heatmap antar saham

### 🔹 Time Series Analysis
- Cumulative Return
- Rolling Volatility

---

## 💼 Portfolio Analysis

### 🔹 Portfolio Optimization
- Minimum Variance Efficient Portfolio (MVEP)

### 🔹 Portfolio Visualization
- Portfolio Allocation Pie Chart
- Portfolio Weight Distribution

### 🔹 Portfolio Performance
- Expected Return
- Portfolio Risk
- Sharpe Ratio Portfolio

### 🔹 AI Portfolio Insight
- Interpretasi sederhana hasil portofolio untuk membantu investor memahami potensi return dan risiko investasi.

---

# 📌 Key Insights

## 📈 Return Analysis
- Beberapa saham memiliki return tahunan yang sangat tinggi namun disertai volatilitas besar.
- Return tinggi tidak selalu menunjukkan performa investasi terbaik jika risiko terlalu besar.

## 📉 Risk & Volatility
- Saham dengan volatilitas rendah cenderung memberikan pergerakan harga yang lebih stabil.
- Rolling volatility menunjukkan perubahan tingkat risiko saham dari waktu ke waktu.

## 🔍 Sharpe Ratio
- Sharpe Ratio membantu mengukur efisiensi return terhadap risiko.
- Saham dengan Sharpe Ratio tinggi lebih optimal untuk dipertimbangkan dalam portofolio.

## 🔗 Correlation Analysis
- Korelasi antar saham membantu menentukan efektivitas diversifikasi portofolio.
- Saham dengan korelasi rendah lebih baik untuk mengurangi risiko portofolio.

## 💼 Portfolio Optimization
- Metode MVEP menghasilkan kombinasi bobot investasi optimal berdasarkan trade-off antara risiko dan return.
- Diversifikasi membantu menurunkan risiko keseluruhan portofolio.

---

# 🛠️ Tech Stack

Framework dan library yang digunakan dalam project ini:

- Python
- Streamlit
- Pandas
- NumPy
- Plotly
- Matplotlib
- SciPy
- Scikit-Learn
- PyPortfolioOpt
- OpenPyXL

---

# ⚙️ Setup Environment

## 🔹 Create Virtual Environment

### Windows

```bash
python -m venv .venv
```

### Activate Environment

```bash
.venv\Scripts\activate
```

---

## 🔹 Install Dependencies

```bash
pip install -r requirements.txt
```

---

# ▶️ Run Streamlit Dashboard

```bash
cd dashboard
streamlit run dashboard.py
```

---