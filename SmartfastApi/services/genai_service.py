import os
import google.generativeai as genai


# ==========================
# API KEY
# ==========================

GEMINI_API_KEY = os.getenv(
    "GEMINI_API_KEY"
)

genai.configure(
    api_key=GEMINI_API_KEY
)

model = genai.GenerativeModel(
    "gemini-2.5-flash"
)


# ==========================
# MARKET SUMMARY
# ==========================

def generate_market_summary(
    market_trend,
    confidence,
    market_condition,
    recommended_method,
    reason
):

    try:

        prompt = f"""
Kamu adalah SmartInvest AI,
asisten investasi saham.

Berikut hasil prediksi pasar IHSG.

Trend Pasar:
{market_trend}

Confidence:
{confidence:.2%}

Kondisi Pasar:
{market_condition}

Metode yang Direkomendasikan:
{recommended_method}

Alasan:
{reason}

TUGAS:

1. Mulai dengan:
📈 SmartInvest AI Market Insight

2. Jelaskan kondisi pasar dengan bahasa sederhana.

3. Jelaskan arti confidence prediction.

4. Jelaskan kenapa metode tersebut cocok.

5. Berikan 2-3 tips investasi singkat.

6. Gunakan bahasa santai dan mudah dipahami orang awam.

7. Maksimal 180 kata.

8. Tambahkan emoticon agar menarik.
"""

        response = (
            model.generate_content(
                prompt
            )
        )

        return response.text

    except Exception as e:

        return (
            f"GenAI Error: {str(e)}"
        )


# ==========================
# PORTFOLIO SUMMARY
# ==========================

def generate_portfolio_summary(
    best_method,
    annual_return,
    annual_risk,
    sharpe_ratio,
    alpha,
    beta,
    portfolio,
    market_trend,
    confidence,
    investment_amount,
    reason
):

    try:

        gain_ex = int(
            investment_amount
            *
            (
                annual_return
                / 100
            )
        )

        loss_ex = int(
            investment_amount
            *
            (
                annual_risk
                / 100
            )
        )

        allocation_str = ", ".join([
            (
                f"{item['ticker']}: "
                f"{item['weight']*100:.1f}%"
            )
            for item in portfolio[:10]
        ])

        prompt = f"""
Kamu adalah konsultan investasi bernama SmartInvest AI.

Jelaskan hasil analisis investasi saham dengan bahasa sederhana untuk orang awam.

DATA HASIL ANALISIS:

- Metode terbaik:
{best_method}

- Kondisi pasar IHSG:
{market_trend}

- Confidence prediksi:
{confidence:.2%}

- Expected Return:
{annual_return}%

- Risiko:
{annual_risk}%

- Sharpe Ratio:
{sharpe_ratio}

- Alpha:
{alpha}

- Beta:
{beta}

- Simulasi investasi:
Rp{investment_amount:,.0f}

- Potensi untung:
+Rp{gain_ex:,}

- Potensi turun:
-Rp{loss_ex:,}

- Komposisi saham:
{allocation_str}

- Alasan metode dipilih:
{reason}

TUGAS:

1. Mulai dengan:
👋 Hallo Sobat SmartInvest!

2. Jelaskan hasil analisis dalam
4-5 paragraf pendek.

3. Gunakan bahasa santai,
mudah dipahami orang awam.

4. WAJIB tampilkan format:

- Expected Return: XX%
- Risiko: XX%
- Simulasi:
potensi untung +RpXX
potensi turun -RpXX

5. Jelaskan kenapa metode ini dipilih.

6. Jelaskan komposisi saham singkat.

7. Sebutkan prediksi IHSG.

8. Berikan 3 tips format:

👉 tips pertama
👉 tips kedua
👉 tips ketiga

9. Tambahkan emoticon agar menarik.

10. Tutup dengan:

⚠️ Ini bukan jaminan keuntungan,
hanya proyeksi berdasarkan data.
"""

        response = (
            model.generate_content(
                prompt
            )
        )

        return response.text

    except Exception as e:

        return (
            f"GenAI Error: {str(e)}"
        )