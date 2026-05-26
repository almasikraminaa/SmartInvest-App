

// ─────────────────────────────────────────────────────────────────────
// src/pages/HomePage.jsx  (FULL FILE — sudah dipatch)
// ─────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MarketChart from "../components/MarketChart";
import StockHighlights from "../components/StockHighlights";
import AllStocksPage from "../components/AllStocksPage";
import TopMarketCap from "../components/TopMarketCap";
import bannerImage from "../assets/images/banner-images.jpg";

export default function HomePage({ setIsAnalysisModalOpen }) {
  const navigate = useNavigate();
  const [showAllStocks,  setShowAllStocks]  = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [visible,        setVisible]        = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(() => {
    return localStorage.getItem('hideSmartInvestBanner') !== 'true';
  });

  const handleDismissBanner = () => {
    setIsBannerVisible(false);
    localStorage.setItem('hideSmartInvestBanner', 'true');
  };

  const handleShowBanner = () => {
    setIsBannerVisible(true);
    localStorage.setItem('hideSmartInvestBanner', 'false');
  };

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

        {/* ── 1. Hero (Dismissible Banner) ── */}
        {isBannerVisible ? (
        <section className="relative bg-smart-navy rounded-2xl overflow-hidden flex items-center min-h-[240px]">
          {/* Background Image Area */}
          <div className="absolute inset-y-0 right-0 w-full md:w-2/3 lg:w-[60%] z-0 pointer-events-none">
            <img src={bannerImage} alt="SmartInvest Banner Illustration" className="w-full h-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-smart-navy via-smart-navy/70 to-transparent"></div>
          </div>
          {/* Tombol Close */}
          <button
            onClick={handleDismissBanner}
            className="absolute top-4 right-4 text-white/60 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors z-20"
            title="Sembunyikan Banner"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          {/* Text Content */}
          <div className="relative z-10 w-full md:w-[60%] p-8 lg:p-10 flex flex-col justify-center gap-5 text-white">

            {/* Posisi 1: Judul Utama */}
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
              Smart Allocation for <br/>
              <span className="text-smart-green">Maximum Returns</span>
            </h1>

            {/* Posisi 2: Label Tentang Kami */}
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Tentang Kami</span>

            {/* Posisi 3: Paragraf Deskripsi */}
            <p className="text-gray-300 text-sm leading-relaxed max-w-xl">
              Tinggalkan tebak-tebakan dalam berinvestasi, mulailah ambil keputusan berbasis data.
              SmartInvest memadukan AI dan metode teruji (MVEP, SIM, CAPM) untuk memastikan portofolio Anda minim risiko dengan profit maksimal.{' '}
            </p>

            {/* Posisi 5: Tombol Akses */}
            <div className="flex items-center gap-4 mt-2">
              <button onClick={() => setShowAboutModal(true)} className="text-smart-green hover:underline font-medium"
                className="bg-smart-green text-white px-7 py-3 rounded-xl font-bold text-sm hover:bg-[#00b86a] transition-colors flex items-center gap-2">
                baca selengkapnya...
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </button>
              
            </div>

          </div>
        </section>
        ) : (
        <div className="flex justify-end mb-4">
          <button onClick={handleShowBanner}
            className="flex items-center gap-2 text-sm font-medium text-smart-navy bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition-colors border border-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </button>
        </div>
        )}

       
       {/* ── Kontainer Card Analisis (Dynamic Visual Hierarchy) ── */}
        <div 
          className={`relative w-full rounded-2xl shadow-sm overflow-hidden transition-all duration-500 ease-in-out ${
            isBannerVisible 
              ? 'bg-blue-50/40 border border-blue-100 text-smart-navy' // Tampilan saat Banner ADA (Soft, mengalah)
              : 'bg-smart-navy border border-slate-700/50 text-white' // Tampilan saat Banner DICLOSE (Gelap, mencolok)
          }`}
        >
          
          {/* Layer Motif Pattern HANYA muncul kalau banner ditutup (!isBannerVisible) */}
          {!isBannerVisible && (
            <div 
              className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-500"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1.5px, transparent 1.5px)',
                backgroundSize: '24px 24px',
              }}
            ></div>
          )}

          {/* Layer Konten Utama */}
          <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between min-h-[160px] gap-6">
            
            {/* Bagian Kiri: Ikon & Teks Penjelasan */}
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 md:gap-6">
              
              {/* Ikon SVG Custom (Monitor & Chart) */}
              <div className={`flex-shrink-0 transition-colors duration-500 ${isBannerVisible ? 'text-smart-navy' : 'text-white'}`}>
                <svg 
                  className="w-16 h-16 md:w-20 md:h-20 drop-shadow-sm" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 17V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8m-4-2v2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 14v-3m4 3V9m4 5v-2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 10l3-3 3 3 4-4" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 6h3v3" />
                </svg>
              </div>
              
              {/* Teks Judul & Deskripsi */}
              <div className="flex flex-col justify-center mt-1">
                <h3 className={`text-xl md:text-2xl font-extrabold mb-2 uppercase transition-colors duration-500 ${isBannerVisible ? 'text-smart-navy' : 'text-white'}`}>
                  Bingung Meracik Saham?
                </h3>
                <p className={`text-sm md:text-base max-w-lg transition-colors duration-500 ${isBannerVisible ? 'text-gray-600' : 'text-gray-300'}`}>
                  Biarkan AI dan algoritma teruji dengan metode MVEP, SIM, CAPM menyusun alokasi portofolio investasi terbaik untuk Anda.
                </p>
              </div>
            </div>

            {/* Bagian Kanan: Tombol Call-to-Action */}
            <div className="w-full md:w-auto flex-shrink-0 mt-2 md:mt-0">
              <button 
                onClick={handleStartAnalysis}
                className={`w-full md:w-auto px-8 py-3.5 rounded-xl font-bold tracking-wide transition-all duration-300 shadow-md border ${
                  isBannerVisible 
                    ? 'bg-smart-navy text-white px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-sm' 
                    : 'bg-smart-green text-white px-7 py-3 rounded-xl font-bold text-sm hover:bg-[#00b86a] transition-colors flex items-center gap-2'
                }`}
              >
                MULAI ANALISIS
              </button>
            </div>

          </div>
        </div>

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