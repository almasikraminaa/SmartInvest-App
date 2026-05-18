import os
import google.generativeai as genai


# API Keys loaded dynamically per endpoint to avoid rate limits


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

    # Ambil kunci khusus IHSG, jika kosong fallback ke kunci default
    key = os.getenv("GEMINI_API_KEY_IHSG") or os.getenv("GEMINI_API_KEY")
    if not key or key.strip() == "":
        return "GenAI Error: API Key untuk IHSG tidak ditemukan di .env."

    try:
        genai.configure(api_key=key)
        model = genai.GenerativeModel("gemini-2.5-flash")

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
    # Calculate simulated numbers
    gain_ex = int(investment_amount * (annual_return / 100))
    loss_ex = int(investment_amount * (annual_risk / 100))

    # Format composition text
    allocation_items = [
        f"{item['ticker'].replace('.JK', '')} ({item['weight']*100:.1f}%)"
        for item in portfolio[:5]
    ]
    if len(portfolio) > 5:
        allocation_str = ", ".join(allocation_items[:-1]) + f", dan {allocation_items[-1]}"
    else:
        allocation_str = ", ".join(allocation_items)

    trend_description = {
        "Bullish": " sedang BULLISH atau sedang semangat naik",
        "Bearish": " sedang BEARISH atau sedang cenderung turun",
        "Sideways": " sedang SIDEWAYS atau stabil di tempat"
    }.get(market_trend, " sedang SIDEWAYS")

    fallback_text = f"""👋 Hallo Sobat SmartInvest!

Senang sekali bisa bantu kamu melihat gambaran portofolio investasi kamu. Setelah kita pelajari data historis, kita menemukan cara terbaik untuk mengatur uang kamu supaya hasilnya maksimal. Kita menggunakan metode bernama {best_method}, yang {reason}.

Metode {best_method} ini terpilih jadi yang terbaik karena memberikan hasil yang optimal berdasarkan kondisi pasar saat ini. Ibarat belanja, metode ini membantu kita mendapatkan 'barang' (keuntungan) yang paling bagus dengan harga (risiko) yang paling terjangkau. 📈

Jika kamu menginvestasikan uang sebesar Rp{investment_amount:,.0f}, maka dalam satu tahun ke depan, hitungan kasarnya adalah kamu punya potensi keuntungan sekitar Rp{gain_ex:,}. Tapi ingat ya, namanya juga investasi saham, ada juga potensi risikonya, yaitu kemungkinan turun sekitar Rp{loss_ex:,}. Semua ini sudah kita hitung agar kamu lebih tenang saat mulai berinvestasi. 💸

Sebagai pembanding, target keuntungan portofolio ini dirancang untuk memaksimalkan hasil investasi Anda secara terukur. Portofolio ini sangat cocok untuk kamu yang ingin mengembangkan uang secara lebih serius namun tetap terukur. 🚀

Expected Return: {annual_return:.1f}%
Risiko: {annual_risk:.1f}%
Simulasi: potensi untung +Rp{gain_ex:,} / potensi turun -Rp{loss_ex:,}

Untuk isi 'keranjang' investasi kamu, kita bagi ke saham-saham pilihan: {allocation_str} sebagai pembentuk porsi utama portofolio kamu agar kinerjanya lebih bervariasi dan solid. 🏦

Kabar baiknya, kondisi pasar saham kita (IHSG) saat ini diprediksi{trend_description}. Tingkat kepercayaan (confidence) analisis ini pun cukup tinggi, yaitu di angka {confidence:.2%}. Ini sinyal yang cukup oke untuk mulai melangkah! 🌟

Disiplinlah untuk tidak panik kalau harga saham turun sebentar, karena investasi butuh waktu untuk tumbuh.
👉 Selalu cek portofolio secara berkala, minimal 3-6 bulan sekali.
👉 Jangan masukkan semua uang tabunganmu ke saham, pastikan dana darurat aman.
👉 Diversifikasikan investasi Anda dan sesuaikan dengan profil risiko pribadi.

⚠️ Ini bukan jaminan keuntungan, hanya proyeksi berdasarkan data.
⚠️ Ini bukan saran keuangan profesional. Gunakan sebagai referensi saja."""

    # Ambil kunci khusus Analisis, jika kosong fallback ke kunci default
    key = os.getenv("GEMINI_API_KEY_ANALYSIS") or os.getenv("GEMINI_API_KEY")
    if not key or key.strip() == "":
        return fallback_text

    try:
        genai.configure(api_key=key)
        model = genai.GenerativeModel("gemini-2.5-flash")
        allocation_str_full = ", ".join([
            f"{item['ticker']}: {item['weight']*100:.1f}%"
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
{allocation_str_full}

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

        response = model.generate_content(prompt)
        return response.text

    except Exception:
        return fallback_text