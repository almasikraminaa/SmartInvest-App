

// ─────────────────────────────────────────────────────────────────────
// src/pages/HomePage.jsx  (FULL FILE — sudah dipatch)
// ─────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MarketChart from "../components/MarketChart";
import StockHighlights from "../components/StockHighlights";
import AllStocksPage from "../components/AllStocksPage";
import TopMarketCap from "../components/TopMarketCap";

export default function HomePage({ setIsAnalysisModalOpen }) {
  const navigate = useNavigate();
  const [showAllStocks,  setShowAllStocks]  = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [visible,        setVisible]        = useState(false);

  const handleStartAnalysis = () => {
    navigate('/analysis');
    setIsAnalysisModalOpen(true);
  };

  useEffect(() => {
    if (showAllStocks) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      const t = setTimeout(() => { document.body.style.overflow = ""; }, 200);
      return () => clearTimeout(t);
    }
  }, [showAllStocks]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 min-h-[85vh]">
      <div className="flex flex-col gap-8">

        {/* ── Modal All Stocks ── */}
        {showAllStocks && (
          <div className={`fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-10 transition-opacity duration-200 ${visible?"opacity-100":"opacity-0"}`}>
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={()=>setShowAllStocks(false)}/>
            <div className={`relative w-full max-w-2xl max-h-[88vh] overflow-y-auto shadow-2xl rounded-2xl transition-all duration-200 ${visible?"scale-100 translate-y-0":"scale-95 translate-y-4"}`}>
              <AllStocksPage onBack={()=>setShowAllStocks(false)}/>
            </div>
          </div>
        )}

        {/* ── 1. Hero ── */}
        <section className="bg-smart-navy rounded-3xl p-10 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4 pointer-events-none"/>
          <div className="relative z-10 max-w-2xl flex flex-col gap-5">

            {/* Posisi 1: Judul Utama */}
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
              Smart Allocation for <br/>
              <span className="text-smart-green">Maximum Returns</span>
            </h1>

            {/* Posisi 2: Label Tentang Kami */}
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Tentang Kami</span>

            {/* Posisi 3: Paragraf Deskripsi */}
            <p className="text-gray-300 text-sm leading-relaxed max-w-xl">
              SmartInvest adalah platform analisis portofolio modern yang dirancang untuk membantu Anda menentukan alokasi investasi optimal secara ilmiah. Dengan memanfaatkan data historis pasar saham dan kecerdasan buatan, sistem kami mengintegrasikan tiga metode finansial teruji—MVEP, SIM, dan CAPM—untuk mereduksi risiko sekaligus memaksimalkan potensi keuntungan portofolio Anda.{' '}
              <button onClick={() => setShowAboutModal(true)} className="text-smart-green hover:underline font-medium">(baca selengkapnya...)</button>
            </p>

            {/* Posisi 5: Tombol Akses */}
            <div className="flex items-center gap-4 mt-2">
              <button onClick={handleStartAnalysis}
                className="bg-smart-green text-white px-7 py-3 rounded-xl font-bold text-sm hover:bg-[#00b86a] transition-colors flex items-center gap-2">
                Mulai Analisis
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </button>
              <button onClick={() => navigate('/method')}
                className="bg-white/10 text-white px-7 py-3 rounded-xl font-bold text-sm hover:bg-white/20 transition-colors border border-white/10 backdrop-blur-sm">
                Pelajari Metode Kami
              </button>
            </div>

          </div>
        </section>

        {/* ── 2. Market Data ── */}
        {/*
          FIX: Kolom kiri (MarketChart) TIDAK boleh punya max-height atau overflow-y-auto.
          Biarkan tingginya mengikuti konten secara alami agar tidak ada ruang kosong.
          Kolom kanan (StockHighlights + TopMarketCap) dibuat sticky agar tetap terlihat
          saat user scroll ke bawah membaca chart.
        */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* ── MarketChart: tinggi mengikuti konten, TIDAK dibatasi ── */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <MarketChart/>
          </div>

          {/* ── Kolom kanan: sticky saat scroll ── */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <StockHighlights onViewAll={()=>setShowAllStocks(true)}/>
            </div>
            <TopMarketCap/>
          </div>
        </div>

        {/* ── Modal About Us ── */}
        {showAboutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-smart-navy/60 backdrop-blur-md p-6 animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) setShowAboutModal(false); }}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-8 shadow-2xl border border-gray-100 flex flex-col gap-5">
              <h2 className="text-xl font-bold text-smart-navy">Tentang Kami — SmartInvest</h2>

              <p className="text-sm text-gray-600 leading-relaxed">
                <span className="font-semibold text-smart-navy">SmartInvest</span> adalah platform investasi berbasis AI yang dirancang khusus untuk <em>beginner investor</em> yang ingin memahami dunia saham dengan cara yang lebih sederhana, modern, dan terarah.
              </p>

              <p className="text-sm text-gray-600 leading-relaxed">
                Banyak orang ingin mulai investasi, tetapi bingung membaca chart, memahami risiko, atau menentukan saham yang layak dipilih. Tidak sedikit yang akhirnya hanya mengikuti tren tanpa mengetahui alasan di balik keputusan investasinya.
              </p>

              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                SmartInvest membantu mengubah proses tersebut menjadi pengalaman investasi yang lebih mudah dipahami dan lebih nyaman digunakan.
              </p>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Metode Portofolio Modern</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span><span><span className="font-semibold">MVEP</span> (Mean Variance Efficient Portfolio) — membantu menemukan kombinasi portofolio dengan risiko minimum.</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">•</span><span><span className="font-semibold">SIM</span> (Single Index Model) — menganalisis hubungan saham terhadap pergerakan pasar.</span></li>
                  <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">•</span><span><span className="font-semibold">CAPM</span> (Capital Asset Pricing Model) — mengukur hubungan antara risiko saham dan potensi keuntungannya.</span></li>
                </ul>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Yang Bisa SmartInvest Bantu</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  <li className="flex items-center gap-2"><span className="text-smart-green">✓</span> Menganalisis performa saham</li>
                  <li className="flex items-center gap-2"><span className="text-smart-green">✓</span> Menghitung risiko dan potensi return</li>
                  <li className="flex items-center gap-2"><span className="text-smart-green">✓</span> Memprediksi tren pasar</li>
                  <li className="flex items-center gap-2"><span className="text-smart-green">✓</span> Memperoleh rekomendasi portofolio optimal secara otomatis</li>
                </ul>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                Setiap analisis dirancang dengan tampilan yang interaktif, intuitif, dan <em>beginner-friendly</em> agar pengguna dapat memahami proses investasi tanpa harus memiliki latar belakang finansial atau data science.
              </p>

              <div className="border-l-4 border-smart-navy pl-4 py-2">
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                  SmartInvest bukan hanya tempat melakukan perhitungan investasi. SmartInvest adalah tempat untuk belajar memahami pasar, mengenali risiko, dan membangun keputusan finansial yang lebih cerdas berbasis data.
                </p>
              </div>

              <p className="text-sm text-gray-500 italic leading-relaxed">
                Karena investasi yang baik bukan tentang ikut-ikutan. Investasi yang baik dimulai dari keputusan yang dipahami dengan baik.
              </p>

              <p className="text-sm font-bold text-smart-navy">
                Analyze smarter. Invest better. Grow confidently. 🚀
              </p>

              <button onClick={() => setShowAboutModal(false)}
                className="self-end bg-gray-100 text-gray-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all mt-2">
                Tutup
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}