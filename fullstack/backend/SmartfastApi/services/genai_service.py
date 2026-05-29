import os
import google.generativeai as genai
import json

# API Keys loaded dynamically per endpoint to avoid rate limits

# ==============================================================================
# 1. MARKET SUMMARY (DIREKTUR OLEH ENDPOINT PREDICT-IHSG)
# ==============================================================================
def generate_market_summary(
    market_trend,
    confidence,
    market_condition,
    recommended_method,
    reason
):
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
        response = model.generate_content(prompt)
        return response.text

    except Exception as e:
        return f"GenAI Error: {str(e)}"


# ==============================================================================
# 2. RECOMMENDATION SUMMARY (DIREKTUR OLEH REKOMENDASI PAGE)
# ==============================================================================
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
    comparison_str,
    investment_amount=10000000,
    index_choice="LQ45"
):
    has_short = "-" in alloc_str

    # Deskripsi index
    index_upper = index_choice.upper() if index_choice else "LQ45"
    if index_upper == "LQ45":
        index_desc = "LQ45 (45 saham paling likuid dan berkapitalisasi besar di Bursa Efek Indonesia)"
    elif index_upper in ["IDX30", "IDX 30"]:
        index_desc = "IDX30 (30 saham blue-chip terpilih dengan likuiditas dan fundamental terbaik di BEI)"
    else:
        index_desc = f"{index_upper}"

    if has_short:
        p4_text = f"Hasilnya gokil banget! Kamu bisa melihat sendiri portofolio terbaikmu memiliki proyeksi keuntungan tahunan (Expected Return) sebesar **{ret_pct:.1f}%** dengan tingkat fluktuasi risiko tahunan yang sangat terukur sebesar **{risk_pct:.1f}%**. Karena portofoliomu kali ini memanfaatkan strategi **short selling** (bobot negatif) pada saham tertentu, AI kita langsung gercep memadukan posisi taktis ini untuk menghasilkan peluang keuntungan melimpah ketika harga emiten pilihanmu terkoreksi di pasar. Rasio efisiensi Sharpe Ratio yang didapatkan mencapai **{sharpe:.3f}**, yang artinya setiap unit risiko yang kamu tanggung memberikan bonus imbal hasil yang sangat optimal dan memuaskan! 💸🔥"
        beta_desc = f"Tingkat sensitivitas pergerakan nilai portofolio Anda terhadap indeks pasar IHSG secara keseluruhan (Beta = {f'{beta:.2f}' if beta is not None else 'N/A'}). Mengingat adanya posisi short selling di portofoliomu, nilai Beta ini membantumu melacak ketahanan portofolio terhadap guncangan pasar searah."
    else:
        p4_text = f"Hasilnya gokil banget! Kamu bisa melihat sendiri portofolio terbaikmu memiliki proyeksi keuntungan tahunan (Expected Return) sebesar **{ret_pct:.1f}%** dengan tingkat fluktuasi risiko tahunan yang sangat terukur sebesar **{risk_pct:.1f}%**. Rasio efisiensi Sharpe Ratio yang didapatkan mencapai **{sharpe:.3f}**, yang artinya setiap unit risiko yang kamu tanggung memberikan bonus imbal hasil yang sangat optimal dan menguntungkan. Uangmu kini bekerja dengan efisiensi tinggi untuk menghasilkan cuan yang maksimal secara terstruktur dan profesional! 💸🔥"
        beta_desc = f"Tingkat sensitivitas pergerakan nilai portofolio Anda terhadap indeks pasar IHSG secara keseluruhan (Beta = {f'{beta:.2f}' if beta is not None else 'N/A'}). Nilai ini membantu mendeteksi apakah portofolio Anda lebih stabil (Beta < 1) or lebih agresif (Beta > 1) dibanding pasar."

    fallback_text = f"""👋 Hallo Sobat SmartInvest! 🚀

Wah, senang banget deh bisa nemenin perjalanan investasimu biar bisa capai kebebasan finansial yang terukur! 🎯 Jadi gini, berdasarkan modal awal gokil yang kamu input sebesar **Rp {investment_amount:,.0f}** dengan BI Rate acuan terupdate **{bi_rate}%**, sistem AI kita langsung gercep memindai data bursa historis secara mendalam selama **{horizon_yr}** tahun terakhir untuk menguji ketahanan portofoliomu! 📈 Indeks acuan yang kamu pilih adalah **{index_desc}**, yang menjadi universe saham kandidat terpilih untuk portofoliomu. Mengingat kondisi tren makro IHSG saat ini terdeteksi lagi **{market_trend_str}**, metode **{best_method}** terpilih secara otomatis sebagai algoritma paling optimal buat nyusun porsi dana investasimu secara cerdas! 🏆

Kenapa sih inputanmu tadi penting banget? Nah, modal awal sebesar **Rp {investment_amount:,.0f}** adalah basis yang mantap untuk memulai pembentukan kekayaan jangka panjang. Suku bunga acuan BI Rate sebesar **{bi_rate}%** berfungsi sebagai pembanding bebas risiko (risk-free rate) agar kita tahu apakah portofolio sahammu benar-benar menghasilkan keuntungan yang jauh mengalahkan tabungan biasa. Ditambah lagi, data historis bursa selama **{horizon_yr}** tahun ke belakang memberikan jaminan bahwa portofolio ini sudah diuji melewati berbagai pasang surut iklim bursa Indonesia secara nyata! 🏦✨

Metode **{best_method}** dipilih oleh sistem cerdas kita karena terbukti paling jago mengoptimalkan bobot saham dalam kondisi pasar yang sedang **{market_trend_str}**. Algoritma ini bekerja dengan sangat teliti untuk menyusun porsi dana investasimu agar dapat memaksimalkan imbal hasil sekaligus meredam guncangan pasar. Sistem secara aktif memilah saham-saham berfundamental solid dan menyingkirkan emiten yang berisiko tinggi, sehingga kamu memiliki portofolio tangguh yang siap menghadapi segala arah pergerakan pasar saham! 🛡️💼

{p4_text}

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
* **Return**: Potensi keuntungan atau tingkat pengembalian yang diharapkan dari dana investasi Anda setiap tahunnya. Nilai {ret_pct:.1f}% menunjukkan proyeksi pertumbuhan portofolio Anda berdasarkan performa historis.
* **Risk (Risiko)**: Volatilitas atau fluktuasi harga saham, menunjukkan potensi ketidakpastian nilai modal. Nilai {risk_pct:.1f}% mencerminkan potensi deviasi harga yang harus siap Anda toleransi demi mengejar keuntungan tersebut.
* **Sharpe Ratio**: Ukuran efisiensi portofolio, membandingkan kelebihan return terhadap risiko yang diambil setelah dikompensasikan dengan BI Rate ({bi_rate}%). Nilai Sharpe Ratio sebesar {sharpe:.3f} menunjukkan efisiensi tinggi, di mana setiap unit risiko yang Anda tanggung menghasilkan return tambahan yang sangat optimal.
* **Alpha**: Indikator performa portofolio di atas rata-rata pasar acuan. Alpha positif menandakan strategi alokasi Anda sukses mengalahkan pergerakan rata-rata pasar.
* **Beta**: {beta_desc}
* **Treynor Ratio**: Kinerja kelebihan return portofolio per unit risiko pasar (beta) yang diambil, memberikan perspektif efisiensi risiko sistemik.

━━━━━━━━━━━━━━━━━━
🏦 ALOKASI PORTOFOLIO
━━━━━━━━━━━━━━━━━━
Sebagian besar dana ditempatkan pada saham dengan performa stabil dan potensi return yang baik. Komposisi alokasi saham pilihan Anda adalah:
{alloc_str}
Dengan modal awal sebesar Rp{investment_amount:,.0f}, potensi keuntungan Anda diperkirakan mencapai +Rp{gain_ex:,} dengan potensi penurunan risiko sekitar -Rp{loss_ex:,}.

━━━━━━━━━━━━━━━━━━
📌 PERBANDINGAN METODE LAIN
━━━━━━━━━━━━━━━━━━
Perbandingan skor metode optimasi portofolio Anda:
{comparison_str}

━━━━━━━━━━━━━━━━━━
💡 Beberapa tips yang harus Kamu lakukan:
━━━━━━━━━━━━━━━━━━
👉 Lakukan diversifikasi secara disiplin dan jangan menaruh seluruh dana Anda pada satu saham saja demi mengurangi risiko volatilitas.
👉 Selalu cek dan lakukan rebalancing portofolio secara berkala minimal 3 hingga 6 bulan sekali guna menyesuaikan dengan tren pasar terbaru.
👉 Gunakan dana dingin yang aman dan pastikan dana darurat Anda telah terpenuhi sebelum memulai komitmen investasi jangka panjang.

⚠️ Ini bukan jaminan keuntungan, hanya proyeksi berdasarkan data historis pasar."""

    key = os.getenv("GEMINI_API_KEY_ANALYSIS") or os.getenv("GEMINI_API_KEY")
    if not key or key.strip() == "":
        return fallback_text

    try:
        genai.configure(api_key=key)
        model = genai.GenerativeModel("gemini-2.5-flash")

        prompt = f"""
Kamu adalah AI Financial Assistant SmartInvest 📈
Tugasmu adalah menjelaskan hasil analisis portofolio saham kepada investor pemula menggunakan Bahasa Indonesia yang santai, sederhana, edukatif, dan mudah dipahami.

Gunakan gaya seperti financial advisor modern yang friendly dan sangat membantu, bukan seperti laporan akademik yang kaku. 

━━━━━━━━━━━━━━━━━━
📊 DATA ANALISIS
━━━━━━━━━━━━━━━━━━
Metode terbaik: {best_method}
Indeks acuan: {index_desc}
BI Rate: {bi_rate}%
Kondisi IHSG: {market_trend_str}
Periode historis data: {horizon_yr} tahun
Alokasi Modal Awal: Rp {investment_amount:,.0f}

━━━━━━━━━━━━━━━━━━
🏆 HASIL PORTOFOLIO TERBAIK
━━━━━━━━━━━━━━━━━━
Expected Return: {ret_pct:.1f}% per tahun
Risk / Volatilitas: {risk_pct:.1f}% per tahun
Sharpe Ratio: {sharpe:.3f}
Beta: {f'{beta:.2f}' if beta is not None else 'N/A'}

Simulasi Investasi:
Modal Rp {investment_amount:,.0f}
Potensi keuntungan: +Rp{gain_ex:,}
Potensi penurunan: -Rp{loss_ex:,}
Komposisi saham:
{alloc_str}

━━━━━━━━━━━━━━━━━━
📌 PERBANDINGAN METODE
━━━━━━━━━━━━━━━━━━
{comparison_str}

━━━━━━━━━━━━━━━━━━
🎯 FORMAT OUTPUT WAJIB
━━━━━━━━━━━━━━━━━━
1. Awali dengan persis:
   👋 Hallo Sobat SmartInvest!

2. Gunakan emoji agar lebih menarik, bersahabat, dan modern.

3. WAJIB tulis bagian pendahuluan dalam tepat 4 paragraf yang sangat panjang, padat, mendalam, dan kaya informasi (masing-masing paragraf minimal 5-6 kalimat panjang):
   - Paragraf 1: Sambutan hangat dan kasual. Sebutkan modal awal Rp {investment_amount:,.0f}, BI Rate {bi_rate}%, data historis {horizon_yr} tahun, indeks acuan {index_desc} beserta penjelasan singkat apa itu indeks tersebut dan mengapa saham-sahamnya berkualitas, serta metode terbaik ({best_method}) yang terpilih untuk kondisi IHSG ({market_trend_str}).
   - Paragraf 2: Analisis mendalam tentang input pengguna. Jelaskan mengapa modal Rp {investment_amount:,.0f} adalah langkah awal yang luar biasa, apa peran BI Rate {bi_rate}% sebagai risk-free rate, dan bagaimana data historis {horizon_yr} tahun menguji keandalan portofolio ini.
   - Paragraf 3: Kupas tuntas metode {best_method} yang terpilih. Jelaskan secara detail cara kerja algoritmanya, kelebihan metode ini dibanding metode lain, dan mengapa ia paling cocok untuk kondisi pasar {market_trend_str} saat ini. Sertakan penjelasan edukatif tentang apa itu metode {best_method} agar investor pemula paham.
   - Paragraf 4: Bedah metrik utama: Expected Return ({ret_pct:.1f}%), Risiko ({risk_pct:.1f}%), dan Sharpe Ratio ({sharpe:.3f}). JIKA ada bobot negatif (short selling), jelaskan secara mendalam dan edukatif bagaimana mekanisme short selling bekerja (meminjam saham → menjual → membeli kembali lebih murah → profit dari selisih), potensi keuntungannya, dan peringatan risiko tingginya (potensi kerugian tak terbatas jika harga naik).
   - Jangan mencantumkan confidence score AI!

4. Tampilkan bagian angka penting secara persis seperti format di bawah ini (WAJIB SATU BARIS SATU ITEM):

━━━━━━━━━━━━━━━━━━
📊 DATA PENTING
━━━━━━━━━━━━━━━━━━
💰 Expected Return: {ret_pct:.1f}% per tahun

📉 Risiko: {risk_pct:.1f}% per tahun

🎯 Sharpe Ratio: {sharpe:.3f}

💸 Simulasi:
potensi untung +Rp{gain_ex:,}
potensi turun -Rp{loss_ex:,}

5. Tampilkan bagian glosarium istilah secara terperinci dan edukatif di bawah ini (WAJIB FORMAT SEPERTI INI):

━━━━━━━━━━━━━━━━━━
🎯 ISTILAH INVESTASI
━━━━━━━━━━━━━━━━━━
* **Return**: Potensi keuntungan atau tingkat pengembalian yang diharapkan dari dana investasi Anda setiap tahunnya. Nilai {ret_pct:.1f}% menunjukkan proyeksi pertumbuhan portofolio Anda berdasarkan performa historis.
* **Risk (Risiko)**: Tingkat volatilitas atau fluktuasi pergerakan harga saham, menunjukkan potensi ketidakpastian nilai modal. Nilai {risk_pct:.1f}% mencerminkan potensi deviasi harga yang harus siap Anda toleransi demi mengejar keuntungan tersebut.
* **Sharpe Ratio**: Ukuran efisiensi portofolio, membandingkan kelebihan return terhadap risiko yang diambil setelah dikompensasikan dengan BI Rate ({bi_rate}%). Nilai Sharpe Ratio sebesar {sharpe:.3f} menunjukkan tingkat efisiensi alokasi Anda.
* **Alpha**: Indikator performa portofolio di atas rata-rata pasar acuan. Alpha positif menandakan strategi alokasi Anda sukses mengalahkan pergerakan rata-rata pasar.
* **Beta**: Tingkat sensitivitas pergerakan nilai portofolio Anda terhadap indeks pasar IHSG secara keseluruhan (Beta = {f'{beta:.2f}' if beta is not None else 'N/A'}). JIKA ada posisi short selling di portofolio, jelaskan efeknya terhadap sensitivitas pasar.
* **Treynor Ratio**: Kinerja kelebihan return portofolio per unit risiko pasar (beta) yang diambil.

6. Tampilkan bagian alokasi portofolio secara terperinci di bawah ini:

━━━━━━━━━━━━━━━━━━
🏦 ALOKASI PORTOFOLIO
━━━━━━━━━━━━━━━━━━
Sebagian besar dana ditempatkan pada saham dengan performa stabil dan potensi return yang baik. Komposisi alokasi saham pilihan Anda adalah:
{alloc_str}
Dengan modal awal sebesar Rp{investment_amount:,.0f}, potensi keuntungan Anda diperkirakan mencapai +Rp{gain_ex:,} dengan potensi penurunan risiko sekitar -Rp{loss_ex:,}.

7. Tampilkan bagian perbandingan metode secara terperinci di bawah ini:

━━━━━━━━━━━━━━━━━━
📌 PERBANDINGAN METODE LAIN
━━━━━━━━━━━━━━━━━━
Perbandingan skor metode optimasi portofolio Anda:
{comparison_str}

8. Tampilkan bagian tips secara persis seperti format di bawah ini:

━━━━━━━━━━━━━━━━━━
💡 Beberapa tips yang harus Kamu lakukan:
━━━━━━━━━━━━━━━━━━
👉 Lakukan diversifikasi secara disiplin dan jangan menaruh seluruh dana Anda pada satu saham saja demi mengurangi risiko volatilitas.
👉 Selalu cek dan lakukan rebalancing portofolio secara berkala minimal 3 hingga 6 bulan sekali guna menyesuaikan dengan tren pasar terbaru.
👉 Gunakan dana dingin yang aman dan pastikan dana darurat Anda telah terpenuhi sebelum memulai komitmen investasi jangka panjang.

9. Tutup dengan disclaimer berikut secara persis:

⚠️ Ini bukan jaminan keuntungan, hanya proyeksi berdasarkan data historis pasar.
"""
        response = model.generate_content(prompt)
        return response.text
    except Exception:
        return fallback_text


# ==============================================================================
# 3. PORTFOLIO INTERPRETATION / ANALYSIS (DIREKTUR OLEH ANALYSIS PAGE)
# ==============================================================================
def generate_analysis_summary(
    market_condition,
    confidence,
    historical_period,
    portfolio_allocation,
    stock_details,
    model_choice="CAPM",
    investment_amount=10000000,
    index_choice="LQ45"  # ⚡ PARAMETER BARU
):
    has_short = "-" in portfolio_allocation

    # ==========================
    # DESKRIPSI INDEX
    # ==========================
    index_upper = index_choice.upper() if index_choice else "LQ45"
    if index_upper == "LQ45":
        index_desc = "LQ45"
        index_full_desc = (
            "LQ45 adalah indeks yang terdiri dari 45 saham paling likuid dan berkapitalisasi pasar terbesar "
            "di Bursa Efek Indonesia (BEI). Saham-saham dalam indeks ini dipilih berdasarkan volume transaksi "
            "harian tertinggi, kapitalisasi pasar terbesar, dan memiliki rekam jejak fundamental yang kuat. "
            "Dengan memilih universe LQ45, portofoliomu hanya berinvestasi pada saham-saham blue-chip kelas satu "
            "yang paling diminati investor institusional maupun ritel di Indonesia."
        )
    elif index_upper in ["IDX30", "IDX 30"]:
        index_desc = "IDX30"
        index_full_desc = (
            "IDX30 adalah indeks yang terdiri dari 30 saham terpilih dengan likuiditas tertinggi dan fundamental "
            "paling solid di Bursa Efek Indonesia (BEI). Indeks ini merupakan representasi terbaik dari saham-saham "
            "blue-chip Indonesia yang secara konsisten menjadi pilihan utama investor besar. "
            "Dengan memilih universe IDX30, portofoliomu terkonsentrasi pada 30 emiten terkuat di bursa, "
            "sehingga setiap saham yang masuk ke portofolio merupakan pilihan premium berkualitas tinggi."
        )
    else:
        index_desc = index_upper
        index_full_desc = (
            f"Indeks {index_upper} digunakan sebagai universe saham kandidat portofolio, "
            "memastikan hanya saham-saham terpilih dengan kriteria ketat yang masuk ke dalam perhitungan alokasi."
        )

    # ==========================
    # DESKRIPSI MODEL/METODE
    # ==========================
    if model_choice == "SIM":
        model_desc = (
            "SIM (Single Index Model) adalah metode optimasi portofolio yang mengukur hubungan antara return "
            "setiap saham dengan return indeks pasar (IHSG). Model ini menghitung nilai Beta (sensitivitas saham "
            "terhadap pasar) dan Alpha (excess return di atas pasar) untuk setiap emiten, lalu mengoptimalkan "
            "bobot alokasi agar portofolio mendapatkan rasio Sharpe tertinggi. SIM sangat efektif di kondisi "
            "pasar Bullish karena mampu memaksimalkan return sambil mengelola risiko sistematis secara presisi."
        )
    elif model_choice == "MVEP":
        model_desc = (
            "MVEP (Minimum Variance Efficient Portfolio) adalah metode optimasi yang berfokus pada meminimalkan "
            "risiko (volatilitas) portofolio secara keseluruhan. Algoritma ini menggunakan matriks kovarians antar "
            "saham untuk menemukan kombinasi bobot yang menghasilkan volatilitas paling rendah sambil tetap "
            "mempertahankan potensi return yang wajar. MVEP sangat cocok untuk kondisi pasar Sideways atau tidak "
            "pasti karena strategi utamanya adalah melindungi modal dari fluktuasi harga yang berlebihan."
        )
    elif model_choice == "CAPM":
        model_desc = (
            "CAPM (Capital Asset Pricing Model) adalah model klasik yang menghitung expected return setiap saham "
            "berdasarkan hubungannya dengan risiko pasar (Beta) dan BI Rate sebagai risk-free rate. Model ini "
            "memilih saham-saham yang memberikan kompensasi return paling optimal untuk setiap unit risiko yang "
            "ditanggung investor. CAPM sangat defensif dan cocok untuk kondisi pasar Bearish karena berfokus pada "
            "saham-saham dengan profil risiko terukur dan valuasi yang wajar berdasarkan teori pasar efisien."
        )
    else:
        model_desc = (
            f"Model {model_choice} digunakan sebagai algoritma optimasi portofolio untuk menyusun bobot alokasi "
            "saham secara matematis berdasarkan data historis return dan risiko masing-masing emiten."
        )

    # ==========================
    # SHORT SELLING DESCRIPTIONS
    # ==========================
    if has_short:
        short_selling_intro = (
            "Strategi Short Selling (Posisi Jual Kosong) Terdeteksi di Portofolio Ini! "
            "Short selling adalah strategi investasi canggih di mana investor meminjam saham dari broker, "
            "langsung menjualnya di harga pasar saat ini, kemudian menunggu harga saham turun untuk "
            "membelinya kembali di harga yang lebih murah. Keuntungan diperoleh dari selisih harga jual "
            "dan harga beli kembali tersebut. Misalnya: saham A dijual di harga Rp 5.000, lalu dibeli "
            "kembali di harga Rp 4.000 — keuntungan Rp 1.000 per lembar saham diraih tanpa memiliki "
            "sahamnya sama sekali! Namun perlu diingat, strategi ini memiliki risiko kerugian yang secara "
            "teoritis tidak terbatas karena harga saham bisa naik tanpa batas, sehingga wajib dilengkapi "
            "dengan stop-loss yang ketat dan manajemen risiko aktif setiap saat."
        )
        p4_text = (
            f"Hasil analisis performa portofolio ini dirancang secara taktis untuk memberikan tingkat efisiensi "
            f"yang maksimal bagi modal kerja investasimu dengan memanfaatkan peluang dari segala arah pergerakan pasar. "
            f"Melalui integrasi strategi **short-selling** (bobot negatif), dana awalmu tidak hanya diposisikan untuk "
            f"meraup untung saat pasar naik, tetapi juga siap memanfaatkan koreksi harga saham tertentu guna melindungi "
            f"nilai portofoliomu. Mekanismenya adalah: sistem meminjam saham dari broker → menjualnya di harga tinggi saat "
            f"ini → menunggu harga turun → membeli kembali di harga lebih murah → keuntungan berasal dari selisih harga "
            f"tersebut. Dengan kombinasi dinamis posisi long dan short ini, portofoliomu lebih tahan terhadap berbagai "
            f"skenario pergerakan pasar! ⚠️ Ingat: short selling memiliki risiko kerugian tak terbatas jika harga saham "
            f"justru naik, sehingga sangat disarankan hanya untuk investor berpengalaman dengan toleransi risiko tinggi. 💸🔥"
        )
        p3_bullet = (
            "* **Strategi Posisi & Karakter Portofolio**: Portofoliomu kali ini terdeteksi menggunakan strategi "
            "**Short Selling** (posisi bobot negatif) pada beberapa emiten pilihan. 😉 Short selling bekerja dengan "
            "cara meminjam saham dari broker dan langsung menjualnya, dengan harapan harga akan turun sehingga bisa "
            "dibeli kembali lebih murah dan selisihnya menjadi keuntungan. Strategi ini sangat taktis dan cocok "
            "untuk menghasilkan profit di tengah tren penurunan harga saham tertentu. Namun perlu diwaspadai: "
            "risiko short selling bersifat asimetris — potensi keuntungan terbatas (harga hanya bisa turun ke nol) "
            "sementara potensi kerugian teoritis tidak terbatas (harga bisa naik tanpa batas). Karena itu, strategi "
            "ini **hanya direkomendasikan untuk investor berpengalaman** yang memahami manajemen risiko secara aktif, "
            "menggunakan stop-loss, dan memantau posisi secara real-time. 📈🔥"
        )
    else:
        short_selling_intro = ""
        p4_text = (
            f"Hasil analisis performa portofolio ini dirancang secara taktis untuk memberikan tingkat efisiensi "
            f"yang maksimal bagi modal kerja investasimu. Dana awalmu didistribusikan ke berbagai sektor industri "
            f"utama secara proporsional guna menciptakan pertahanan portofolio yang seimbang terhadap guncangan "
            f"sektoral mendadak. Seluruh posisi menggunakan strategi long position standar, di mana keuntungan "
            f"diraih ketika harga saham naik seiring waktu. Kamu bisa berinvestasi dengan tenang dan penuh "
            f"keyakinan karena portofoliomu didukung oleh analisis kuantitatif modern yang tangguh dan profesional! 💸🔥"
        )
        p3_bullet = (
            "* **Strategi Posisi & Karakter Portofolio**: Seluruh portofolio Anda dikelola dengan strategi "
            "**long position** standar, yang berarti keuntungan didapatkan secara alami ketika harga saham "
            "naik seiring pertumbuhan fundamental perusahaan dan ekonomi makro Indonesia. Profil portofolio "
            "Anda dikategorikan sebagai **moderat-stabil**, karena berfokus pada saham-saham berkinerja "
            "konsisten dengan pertumbuhan terarah dari indeks {index_desc}. Kombinasi ini memberikan "
            "keseimbangan yang ideal antara potensi imbal hasil dengan tingkat volatilitas pasar jangka menengah, "
            "sangat cocok untuk investor yang menginginkan pertumbuhan modal terukur tanpa eksposur risiko ekstrem."
        ).format(index_desc=index_desc)

    fallback_text = f"""👋 Hallo Sobat SmartInvest! 🚀

Wah, seru banget nih! Berdasarkan parameter input gokil yang baru saja kamu tentukan, kamu sedang menganalisis optimasi portofolio dengan total modal investasi sebesar **Rp {investment_amount:,.0f}** menggunakan model alokasi **{model_choice}**! 🎯 AI kita langsung gercep menarik dan memproses data bursa historis komprehensif selama rentang periode **{historical_period}** biar pembagian bobot aset sahammu terpetakan secara optimal dan anti-boncos! 📈

Kamu memilih indeks **{index_desc}** sebagai universe kandidat saham portofoliomu. {index_full_desc} Hal ini memastikan setiap saham yang masuk ke portofoliomu telah melewati seleksi ketat berdasarkan likuiditas, kapitalisasi, dan rekam jejak fundamental di bursa! 🏆

{model_desc} Model ini bekerja keras di balik layar untuk memastikan setiap rupiah modalmu dialokasikan pada proporsi yang paling efisien secara matematis! 🛡️💼

{p4_text}

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
* **Analisis Alokasi & Dominasi Bobot**: Alokasi bobot portofolio Anda dihitung menggunakan model matematis kuantitatif ({model_choice}) guna menyeimbangkan porsi risiko secara optimal. Saham dengan fundamental kokoh dan tren harga stabil cenderung diberikan porsi bobot yang lebih dominan guna bertindak sebagai penyangga (buffer) utama portofolio. Hal ini membantu meminimalisasi potensi guncangan modal Anda ketika pasar saham mengalami koreksi mendadak, sehingga dana investasi Anda tetap berkembang secara sehat.
* **Diversifikasi Sektor & Risiko Konsentrasi**: Portofolio Anda didistribusikan secara taktis di berbagai sektor industri berbeda (seperti keuangan, energi, komoditas, infrastruktur, atau barang konsumsi) untuk mengurangi risiko konsentrasi yang berlebihan pada satu emiten tunggal. Seluruh saham kandidat berasal dari universe indeks **{index_desc}** yang merupakan emiten-emiten terpilih berkualitas tinggi. Ketika terjadi fluktuasi pada satu sektor industri tertentu, sektor lain yang tetap kokoh atau tumbuh akan menyeimbangkan kinerja keseluruhan aset investasi Anda secara efisien.
{p3_bullet}

━━━━━━━━━━━━━━━━━━
💡 Strategi yang Bisa Dipertimbangkan
━━━━━━━━━━━━━━━━━━
👉 Tetap tenang dan hindari keputusan impulsif saat pasar berfluktuasi jangka pendek.
👉 Lakukan diversifikasi ke sektor-sektor non-komoditas lainnya untuk mengurangi ekspresi risiko pasar.
👉 Evaluasi berkala bobot saham terbesar Anda dan sesuaikan kembali (rebalancing) bila ada berita industri terbaru.

⚠️ Analisis ini merupakan proyeksi berdasarkan data historis dan bukan jaminan keuntungan investasi."""

    key = os.getenv("GEMINI_API_KEY_ANALYSIS") or os.getenv("GEMINI_API_KEY")
    if not key or key.strip() == "":
        return fallback_text

    try:
        genai.configure(api_key=key)
        model = genai.GenerativeModel("gemini-2.5-flash")

        prompt = f"""
Kamu adalah AI Portfolio Advisor SmartInvest 📊
Tugasmu adalah menjelaskan kondisi dan struktur portofolio saham menggunakan Bahasa Indonesia yang santai, profesional, mendalam, mudah dipahami investor pemula, dan terasa seperti analisis dari financial advisor modern berpengalaman.

Jangan terlalu fokus menjelaskan model AI atau teknikal machine learning, melainkan fokuslah pada edukasi finansial dan analisis saham praktis.

━━━━━━━━━━━━━━━━━━
📊 DATA PORTOFOLIO
━━━━━━━━━━━━━━━━━━
Model Alokasi: {model_choice}
Indeks Acuan: {index_desc} — {index_full_desc}
Alokasi Modal Awal: Rp {investment_amount:,.0f}
Periode data historis: {historical_period}
Komposisi portofolio: {portfolio_allocation}
Detail saham: {stock_details}

━━━━━━━━━━━━━━━━━━
📌 INFORMASI TAMBAHAN
━━━━━━━━━━━━━━━━━━
* Deskripsi metode {model_choice}: {model_desc}
* Saham dapat memiliki label: 📈 Bullish, 📉 Bearish, ➖ Stabil / Sideways
* Bobot negatif berarti sistem menggunakan strategi short selling (jual kosong).
{f"* INFO SHORT SELLING: {short_selling_intro}" if has_short else ""}

━━━━━━━━━━━━━━━━━━
🎯 FORMAT OUTPUT WAJIB
━━━━━━━━━━━━━━━━━━
1. Awali dengan persis:
👋 Hallo Sobat SmartInvest!

2. Tulis tepat 4 paragraf pembuka yang sangat panjang, padat, mendalam, dan kaya informasi (masing-masing paragraf minimal 5-6 kalimat panjang):
   - Paragraf 1: Sambutan hangat dan kasual. Sebutkan modal investasi Rp {investment_amount:,.0f}, model alokasi {model_choice}, dan rentang periode historis data {historical_period}. Perkenalkan indeks {index_desc} dan jelaskan mengapa saham-sahamnya berkualitas tinggi sebagai universe investasi.
   - Paragraf 2: Analisis mendalam tentang input pengguna. Jelaskan mengapa modal Rp {investment_amount:,.0f} merupakan basis modal kerja yang kuat, dan bagaimana rentang data historis {historical_period} memberikan keandalan statistik yang kokoh untuk memetakan alokasi portofolio.
   - Paragraf 3: Kupas tuntas metode {model_choice} secara mendalam dan edukatif. Gunakan deskripsi berikut sebagai referensi: {model_desc}. Jelaskan cara kerja algoritma ini step-by-step, kelebihan utamanya, dan mengapa ia paling optimal untuk menyusun portofolio dari universe {index_desc}.
   - Paragraf 4: Analisis efisiensi alokasi risiko portofolio secara menyeluruh. Terangkan bahwa portofolio ini terdistribusi taktis ke berbagai sektor industri utama dari universe {index_desc}. JIKA ada bobot negatif (strategi short selling), jelaskan secara sangat gamblang dan mendalam bagaimana mekanisme short selling bekerja (meminjam saham → menjual di harga tinggi → menunggu turun → beli kembali lebih murah → profit dari selisih), jelaskan potensi keuntungan dan peringatan risiko tak terbatasnya agar investor pemula benar-benar paham.
   - DILARANG mencantumkan prediksi IHSG, kondisi makro IHSG, trend pasar, atau confidence score AI di halaman ini!

3. Tampilkan bagian daftar komposisi portofolio secara persis seperti format di bawah ini:

━━━━━━━━━━━━━━━━━━
📊 KOMPOSISI PORTOFOLIO
━━━━━━━━━━━━━━━━━━
Portofolio Anda saat ini dialokasikan pada saham-saham pilihan sebagai berikut:
{portfolio_allocation}

Detail saham yang menyusun portofolio Anda beserta sektor dan status tren teknikalnya:
{stock_details}

4. Tampilkan bagian analisis finansial secara mendalam (WAJIB FORMAT INI, POIN-POIN SANGAT PANJANG & DETAIL):

━━━━━━━━━━━━━━━━━━
🛡️ ANALISIS FINANSIAL
━━━━━━━━━━━━━━━━━━
* **Analisis Alokasi & Dominasi Bobot**: Jelaskan dengan sangat detail (minimal 4 kalimat panjang) mengenai porsi pembobotan saham. Analisis mengapa saham dengan bobot terbesar menjadi dominan, apa dampaknya terhadap stabilitas modal, dan bagaimana model {model_choice} menentukan bobot tersebut secara matematis.
* **Diversifikasi Sektor & Risiko Konsentrasi**: Jelaskan dengan sangat detail (minimal 4 kalimat panjang) bagaimana dana didistribusikan di berbagai sektor dari universe {index_desc}. Sebutkan sektor-sektor yang ada di portofolio dan jelaskan mengapa kombinasi ini memberikan keamanan tambahan ketika terjadi guncangan sektoral.
* **Strategi Posisi & Karakter Portofolio**: Jelaskan dengan sangat detail (minimal 5 kalimat panjang) tentang strategi posisi yang digunakan. JIKA ada bobot negatif, berikan analisis mendalam mengenai mekanisme short selling step-by-step (pinjam saham → jual → tunggu turun → beli kembali → profit dari selisih), potensi keuntungannya, dan peringatan risiko kerugian tak terbatas yang wajib dipahami investor. Tentukan juga apakah portofolio ini tergolong agresif, moderat, atau defensif.

5. Tampilkan bagian strategi rekomendasi secara persis seperti format di bawah ini:

━━━━━━━━━━━━━━━━━━
💡 Strategi yang Bisa Dipertimbangkan
━━━━━━━━━━━━━━━━━━
👉 Tetap tenang dan hindari keputusan impulsif saat pasar berfluktuasi jangka pendek.
👉 Lakukan diversifikasi ke sektor-sektor non-komoditas lainnya untuk mengurangi ekspresi risiko pasar.
👉 Evaluasi berkala bobot saham terbesar Anda dan sesuaikan kembali bila ada berita industri terbaru.

6. Tutup dengan disclaimer berikut secara persis:

⚠️ Analisis ini merupakan proyeksi berdasarkan data historis dan bukan jaminan keuntungan investasi.
"""
        response = model.generate_content(prompt)
        return response.text
    except Exception:
        return fallback_text