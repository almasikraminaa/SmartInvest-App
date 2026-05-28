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

def generate_recommendation_summary(
    best_method,
    bi_rate,
    market_trend_str,
    confidence,
    horizon_yr,
    ret_pct,
    risk_pct,
    sharpe,
    beta,
    gain_ex,
    loss_ex,
    alloc_str,
    comparison_str
):
    # Calculate fallback text in case of GenAI API issues
    fallback_text = f"""👋 Hallo Sobat SmartInvest!

Senang sekali bisa bantu kamu melihat gambaran portofolio investasi kamu. Setelah menganalisis data pasar historis selama {horizon_yr} tahun terakhir dengan BI Rate acuan sebesar {bi_rate}%, sistem kami menyaring berbagai pilihan metode alokasi portofolio terbaik. Berdasarkan kondisi IHSG saat ini yang sedang {market_trend_str}, metode **{best_method}** dipilih sebagai metode terbaik untuk memaksimalkan perjalanan investasimu.

Metode ini disesuaikan secara khusus dengan kondisi pasar saat ini. Saat IHSG {market_trend_str}, kami menerapkan algoritma optimasi yang paling selaras demi menyeimbangkan aspek return dan risiko portofolio Anda.

━━━━━━━━━━━━━━━━━━
📊 DATA PENTING
━━━━━━━━━━━━━━━━━━
💰 Expected Return: {ret_pct:.1f}% per tahun
📉 Risiko: {risk_pct:.1f}% per tahun
🎯 Sharpe Ratio: {sharpe:.3f}
💸 Simulasi:
potensi untung +Rp{gain_ex:,}
potensi turun -Rp{loss_ex:,}

━━━━━━━━━━━━━━━━━━
🎯 ISTILAH INVESTASI
━━━━━━━━━━━━━━━━━━
* **Return**: Potensi keuntungan atau tingkat pengembalian yang diharapkan dari dana investasi Anda setiap tahunnya.
* **Risk (Risiko)**: Tingkat volatilitas atau fluktuasi pergerakan harga saham, menunjukkan potensi ketidakpastian nilai modal.
* **Sharpe Ratio**: Ukuran efisiensi portofolio, membandingkan kelebihan return terhadap risiko yang diambil. Semakin tinggi nilainya, semakin baik.
* **Alpha**: Kinerja portofolio di atas rata-rata pasar acuan.
* **Beta**: Sensitivitas pergerakan nilai portofolio Anda terhadap indeks pasar IHSG secara keseluruhan (Beta = {f'{beta:.2f}' if beta is not None else 'N/A'}).
* **Treynor Ratio**: Kinerja kelebihan return portofolio per unit risiko pasar (beta) yang diambil.

━━━━━━━━━━━━━━━━━━
🏦 ALOKASI PORTOFOLIO
━━━━━━━━━━━━━━━━━━
Sebagian besar dana ditempatkan pada saham dengan performa stabil dan potensi return yang baik. Komposisi alokasi saham pilihan Anda adalah:
{alloc_str}
Dengan modal awal sebesar Rp10.000.000, potensi keuntungan Anda diperkirakan mencapai +Rp{gain_ex:,} dengan potensi penurunan risiko sekitar -Rp{loss_ex:,}.

━━━━━━━━━━━━━━━━━━
📌 PERBANDINGAN METODE LAIN
━━━━━━━━━━━━━━━━━━
Perbandingan skor metode optimasi portofolio Anda:
{comparison_str}

━━━━━━━━━━━━━━━━━━
💡 Beberapa tips yang harus Kamu lakukan:
━━━━━━━━━━━━━━━━━━
👉 Lakukan diversifikasi secara disiplin dan jangan menaruh seluruh dana Anda pada satu saham saja.
👉 Selalu cek dan lakukan rebalancing portofolio secara berkala minimal 3 hingga 6 bulan sekali.
👉 Gunakan dana dingin yang aman dan pastikan dana darurat Anda telah terpenuhi sebelum berinvestasi.

⚠️ Ini bukan jaminan keuntungan, hanya proyeksi berdasarkan data historis pasar."""

    key = os.getenv("GEMINI_API_KEY_ANALYSIS") or os.getenv("GEMINI_API_KEY")
    if not key or key.strip() == "":
        return fallback_text

    try:
        genai.configure(api_key=key)
        model = genai.GenerativeModel("gemini-2.5-flash")

        prompt = f"""
Kamu adalah AI Financial Assistant SmartInvest 📈
Tugasmu adalah menjelaskan hasil analisis portofolio saham kepada investor pemula menggunakan Bahasa Indonesia yang santai, sederhana, dan mudah dipahami.

Gunakan gaya seperti financial advisor modern yang friendly, bukan seperti laporan akademik atau skripsi.

━━━━━━━━━━━━━━━━━━
📊 DATA ANALISIS
━━━━━━━━━━━━━━━━━━

Metode terbaik: {best_method}

BI Rate: {bi_rate}%

Kondisi IHSG:
{market_trend_str}

Confidence Prediksi:
{confidence:.2%}

Periode historis data:
{horizon_yr} tahun

━━━━━━━━━━━━━━━━━━
🏆 HASIL PORTOFOLIO TERBAIK
━━━━━━━━━━━━━━━━━━

Expected Return:
{ret_pct:.1f}% per tahun

Risk / Volatilitas:
{risk_pct:.1f}% per tahun

Sharpe Ratio:
{sharpe:.3f}

Beta:
{f'{beta:.2f}' if beta is not None else 'N/A'}

Simulasi Investasi:
Modal Rp10.000.000

Potensi keuntungan:
+Rp{gain_ex:,}

Potensi penurunan:
-Rp{loss_ex:,}

Komposisi saham:
{alloc_str}

━━━━━━━━━━━━━━━━━━
📌 PERBANDINGAN METODE
━━━━━━━━━━━━━━━━━━

{comparison_str}

━━━━━━━━━━━━━━━━━━
🎯 FORMAT OUTPUT WAJIB
━━━━━━━━━━━━━━━━━━

1. Awali dengan:
   👋 Hallo Sobat SmartInvest!

2. Gunakan emoji agar lebih menarik dan modern.

3. Buat penjelasan dalam paragraf pendek dan nyaman dibaca.

4. Jangan gunakan bahasa terlalu teknis atau formal.

5. Tampilkan bagian angka penting seperti ini (WAJIB SATU BARIS SATU ITEM):

💰 Expected Return: {ret_pct:.1f}%

📉 Risiko: {risk_pct:.1f}%

🎯 Sharpe Ratio: {sharpe:.3f}

💸 Simulasi:
potensi untung +Rp{gain_ex:,}
potensi turun -Rp{loss_ex:,}

6. Jelaskan arti istilah berikut menggunakan bahasa sederhana:

* Return
* Risk
* Sharpe Ratio
* Alpha
* Beta
* Treynor Ratio (jika tersedia)

7. Jelaskan kondisi IHSG dan confidence prediksi dengan bahasa sederhana.

8. Jelaskan alasan sistem memilih metode terbaik secara jelas dan mudah dipahami investor pemula.

WAJIB menjelaskan:

* Saat IHSG bullish → sistem lebih fokus pada return & Sharpe Ratio
* Saat IHSG sideways → sistem menilai semua aspek secara seimbang
* Saat IHSG bearish → sistem lebih fokus pada risk & beta
* Sistem tetap membandingkan semua metode menggunakan skor gabungan
* Faktor yang dibandingkan:
  return, risk, Sharpe Ratio, alpha, dan beta

9. Jelaskan komposisi saham dengan singkat:
   contoh:
   “Sebagian besar dana ditempatkan pada saham dengan performa stabil dan potensi return yang baik.”

10. Jelaskan:

* berapa modal yang digunakan
* berapa potensi keuntungan
* berapa potensi penurunan

11. Gunakan tone optimis tetapi tetap realistis.

12. Setelah penjelasan selesai, tampilkan section ini:

━━━━━━━━━━━━━━━━━━
💡 Beberapa tips yang harus Kamu lakukan:
━━━━━━━━━━━━━━━━━━

👉 tips pertama

👉 tips kedua

👉 tips ketiga

13. Tutup dengan:

⚠️ Ini bukan jaminan keuntungan, hanya proyeksi berdasarkan data historis pasar.
"""
        response = model.generate_content(prompt)
        return response.text
    except Exception:
        return fallback_text


def generate_analysis_summary(
    market_condition,
    confidence,
    historical_period,
    portfolio_allocation,
    stock_details
):
    fallback_text = f"""👋 Hallo Sobat SmartInvest!

Berdasarkan data historis investasi Anda selama periode {historical_period}, sistem kami telah memetakan alokasi portofolio saham secara optimal. Kondisi makro IHSG saat ini diprediksi berada dalam status **{market_condition}** dengan tingkat keyakinan AI sebesar {confidence:.2%}. 

Secara keseluruhan, struktur portofolio Anda disusun untuk memberikan hasil terbaik yang disesuaikan dengan kondisi pasar saat ini. Mari kita bahas detailnya agar Anda lebih memahaminya secara mendalam!

━━━━━━━━━━━━━━━━━━
📊 KOMPOSISI PORTOFOLIO
━━━━━━━━━━━━━━━━━━
Portofolio Anda saat ini dialokasikan pada saham-saham pilihan sebagai berikut:
{portfolio_allocation}

Detail saham yang menyusun portofolio Anda beserta sektor dan status tren teknikalnya:
{stock_details}

━━━━━━━━━━━━━━━━━━
🛡️ ANALISIS FINANSIAL
━━━━━━━━━━━━━━━━━━
* **Diversifikasi Sektor & Risiko Konsentrasi**: Portofolio Anda didistribusikan di berbagai sektor untuk mengurangi risiko konsentrasi yang berlebihan pada satu emiten tunggal.
* **Strategi Posisi (Long Position)**: Seluruh portofolio Anda menggunakan strategi long position biasa, yang berarti keuntungan didapatkan ketika harga saham naik. Ini adalah opsi investasi yang sangat aman dan terstruktur bagi investor pemula.
* **Kategori Portofolio**: Portofolio Anda dikategorikan sebagai moderat, karena berfokus pada saham-saham berkinerja stabil dan pertumbuhan terarah, memberikan keseimbangan yang ideal antara imbal hasil dengan volatilitas pasar.

━━━━━━━━━━━━━━━━━━
💡 Strategi yang Bisa Dipertimbangkan
━━━━━━━━━━━━━━━━━━
👉 Tetap tenang dan hindari keputusan impulsif saat pasar berfluktuasi jangka pendek.
👉 Lakukan diversifikasi ke sektor-sektor non-komoditas lainnya untuk mengurangi ekspresi risiko pasar.
👉 Evaluasi berkala bobot saham terbesar Anda dan sesuaikan kembali bila ada berita industri terbaru.

⚠️ Analisis ini merupakan proyeksi berdasarkan data historis dan bukan jaminan keuntungan investasi."""

    key = os.getenv("GEMINI_API_KEY_ANALYSIS") or os.getenv("GEMINI_API_KEY")
    if not key or key.strip() == "":
        return fallback_text

    try:
        genai.configure(api_key=key)
        model = genai.GenerativeModel("gemini-2.5-flash")

        prompt = f"""
Kamu adalah AI Portfolio Advisor SmartInvest 📊
Tugasmu adalah menjelaskan kondisi dan struktur portofolio saham menggunakan Bahasa Indonesia yang santai, profesional, mudah dipahami investor pemula, dan terasa seperti analisis dari financial advisor modern.

Fokus utama penjelasan:

* kondisi pembobotan saham,
* dominasi saham bullish/bearish/stabil,
* risiko konsentrasi portofolio,
* diversifikasi sektor,
* potensi risiko,
* dan strategi short selling jika terdapat bobot negatif.

Jangan terlalu fokus menjelaskan model AI atau teknikal machine learning.

━━━━━━━━━━━━━━━━━━
📊 DATA PORTOFOLIO
━━━━━━━━━━━━━━━━━━

Prediksi kondisi pasar:
{market_condition}

Confidence AI:
{confidence:.2%}

Periode data historis:
{historical_period}

Komposisi portofolio:
{portfolio_allocation}

Detail saham:
{stock_details}

━━━━━━━━━━━━━━━━━━
📌 INFORMASI TAMBAHAN
━━━━━━━━━━━━━━━━━━

* Saham dapat memiliki label:
  📈 Bullish
  📉 Bearish
  ➖ Stabil / Sideways

* Bobot negatif berarti sistem menggunakan strategi short selling

━━━━━━━━━━━━━━━━━━
🎯 FORMAT OUTPUT WAJIB
━━━━━━━━━━━━━━━━━━

1. Awali dengan:

👋 Hallo Sobat SmartInvest!

2. Jelaskan kondisi portofolio secara keseluruhan dalam paragraf pembuka.

Contoh gaya:

* apakah portofolio didominasi saham bearish
* apakah cukup seimbang
* apakah terlalu terkonsentrasi
* apakah defensif atau agresif

3. Jelaskan sektor-sektor utama portofolio dengan bahasa sederhana.

4. WAJIB analisis dominasi pembobotan:

* saham mana yang memiliki bobot terbesar
* apakah terlalu terkonsentrasi
* apa dampaknya terhadap risiko portofolio

5. WAJIB jelaskan kondisi saham:

* mana yang bullish
* mana yang bearish
* mana yang stabil

Jelaskan dampaknya terhadap keseluruhan portofolio.

6. Jika mayoritas bobot berada pada saham bearish:
   jelaskan bahwa portofolio memiliki tekanan risiko penurunan.

7. Jika terdapat saham bullish dengan bobot besar:
   jelaskan potensi pertumbuhan sekaligus risiko konsentrasi.

8. Jika terdapat bobot negatif:
   WAJIB jelaskan short selling menggunakan bahasa sederhana.

Contoh gaya penjelasan:
“Terdapat beberapa bobot negatif pada portofolio. Ini berarti sistem mengizinkan strategi short selling, yaitu strategi investasi yang mencoba memperoleh keuntungan ketika harga saham turun. Strategi ini biasanya memiliki risiko lebih tinggi dibanding investasi biasa dan lebih cocok untuk investor yang sudah berpengalaman.”

9. Jika tidak ada bobot negatif:
   jelaskan bahwa seluruh portofolio menggunakan strategi long position biasa.

10. Jelaskan apakah portofolio:

* agresif
* moderat
* defensif

beserta alasannya.

11. Berikan insight yang terasa realistis dan profesional seperti financial advisor sungguhan.

Contoh:

* risiko konsentrasi
* tekanan bearish
* peluang recovery
* pentingnya diversifikasi
* perlunya evaluasi ulang bobot saham tertentu

12. Gunakan gaya bahasa:

* natural
* engaging
* tidak terlalu formal
* seperti advisor fintech modern

13. Gunakan emoji agar lebih menarik secara visual.

14. Setelah analisis selesai, tampilkan bagian:

━━━━━━━━━━━━━━━━━━
💡 Strategi yang Bisa Dipertimbangkan
━━━━━━━━━━━━━━━━━━

👉 strategi pertama

👉 strategi kedua

👉 strategi ketiga

15. Tutup dengan:

⚠️ Analisis ini merupakan proyeksi berdasarkan data historis dan bukan jaminan keuntungan investasi.

━━━━━━━━━━━━━━━━━━
🚫 LARANGAN
━━━━━━━━━━━━━━━━━━

* Jangan seperti laporan akademik
* Jangan terlalu teknikal
* Jangan menjelaskan coding/model machine learning
* Jangan membuat paragraf terlalu panjang
* Jangan menggunakan istilah sulit tanpa penjelasan sederhana
* Jangan terlalu sering mengulang nama saham
* Jangan ajak user bertanya kembali
"""
        response = model.generate_content(prompt)
        return response.text
    except Exception:
        return fallback_text

