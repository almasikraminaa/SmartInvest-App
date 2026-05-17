// src/pages/HomePage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MarketChart from "../components/MarketChart";
import StockHighlights from "../components/StockHighlights";
import AllStocksPage from "../components/AllStocksPage";

export default function HomePage({ setIsAnalysisModalOpen }) {
  const navigate = useNavigate();
  const [showAllStocks, setShowAllStocks] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [visible, setVisible]            = useState(false);

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

      {/* Modal All Stocks */}
      {showAllStocks && (
        <div className={`fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-10 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}>
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAllStocks(false)} />
          <div className={`relative w-full max-w-2xl max-h-[88vh] overflow-y-auto shadow-2xl rounded-2xl transition-all duration-200 ${visible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}>
            <AllStocksPage onBack={() => setShowAllStocks(false)} />
          </div>
        </div>
      )}

      {/* 1. Hero */}
      <section className="bg-smart-navy rounded-3xl p-10 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-extrabold mb-4 leading-tight tracking-tight">
            Smart Allocation for <br />
            <span className="text-smart-green">Maximum Returns</span>
          </h1>
          <p className="text-gray-300 text-sm leading-relaxed mb-8 max-w-xl">
            Leverage the power of the Minimum Variance Efficient Portfolio (MVEP) method to build a robust, data-driven investment strategy tailored for the Indonesian stock market.
          </p>
          <div className="flex items-center gap-4">
            <button onClick={handleStartAnalysis} className="bg-smart-green text-white px-7 py-3 rounded-xl font-bold text-sm hover:bg-[#00b86a] transition-colors flex items-center gap-2">
              Start Analysis
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </button>
            <button onClick={() => navigate('/method')} className="bg-white/10 text-white px-7 py-3 rounded-xl font-bold text-sm hover:bg-white/20 transition-colors border border-white/10 backdrop-blur-sm">
              Learn Our Method
            </button>
          </div>
        </div>
      </section>

      {/* 2. Chart + Stock Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart IHSG */}
        <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <MarketChart />
        </div>
        {/* Stock Highlights */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <StockHighlights onViewAll={() => setShowAllStocks(true)} />
        </div>
      </div>

      {/* 3. About Us */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row gap-8 items-center justify-between mt-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-smart-navy mb-2">About Us</h2>
          <p className="text-gray-500 text-sm font-medium mb-4">Revolusi Teknologi Keuangan untuk Generasi Muda.</p>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            SmartInvest hadir untuk menjembatani tingginya minat investasi saham dengan analisis berbasis data yang solid. Kami menggabungkan teori portofolio kuantitatif (seperti MVEP) dengan Kecerdasan Buatan (AI) untuk membantu Anda mengambil keputusan finansial yang rasional dan terukur, bukan sekadar spekulasi.
          </p>
          <button onClick={() => setShowAboutModal(true)} className="bg-smart-navy text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
            Baca Selengkapnya...
          </button>
        </div>
        <div className="w-full md:w-[40%] aspect-video bg-[#2A2D34] rounded-xl flex items-center justify-center overflow-hidden">
          <span className="text-white opacity-50 text-sm font-medium">[ Area Gambar / Logo ]</span>
        </div>
      </section>

      {/* 4. Method Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div onClick={() => navigate('/method#mvep')} className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-5 cursor-pointer hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
          </div>
          <h3 className="text-lg font-bold text-smart-navy mb-3">MVEP</h3>
          <p className="text-gray-500 text-sm leading-relaxed">Minimum Variance Efficient Portfolio: Mengoptimalkan bobot aset Anda untuk meminimalkan risiko pada tingkat return tertentu.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div onClick={() => navigate('/method#sim')} className="w-14 h-14 bg-green-50 text-smart-green rounded-2xl flex items-center justify-center mb-5 cursor-pointer hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          </div>
          <h3 className="text-lg font-bold text-smart-navy mb-3">SIM</h3>
          <p className="text-gray-500 text-sm leading-relaxed">Single Index Model: Mengukur risiko dan return saham berdasarkan pergerakan pasar secara keseluruhan untuk mendapatkan portofolio optimal.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div onClick={() => navigate('/method#caf')} className="w-14 h-14 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-5 cursor-pointer hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <h3 className="text-lg font-bold text-smart-navy mb-3">CAF</h3>
          <p className="text-gray-500 text-sm leading-relaxed">Constant Allocation Fund: Memfokuskan pembagian dana secara konstan pada aset untuk menjaga profil keseimbangan risiko secara otomatis.</p>
        </div>
      </section>

      {/* Modal About Us (kosong) */}
      {showAboutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-smart-navy/60 backdrop-blur-md p-6 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl border border-gray-100 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-smart-navy">About SmartInvest</h2>
            <div className="min-h-[200px] flex items-center justify-center text-gray-300 text-sm">
              {/* Konten akan ditambahkan nanti */}
              <p>Konten selengkapnya akan ditampilkan di sini.</p>
            </div>
            <button
              onClick={() => setShowAboutModal(false)}
              className="self-end bg-gray-100 text-gray-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

    </div>
    </div>
  );
}