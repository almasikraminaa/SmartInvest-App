import { useState } from "react";

export default function RecommendationPage({ analysisCompleted, result, metaForm, setIsAnalysisModalOpen }) {
  const onOpenAnalysisModal = () => setIsAnalysisModalOpen(true);

  // Ambil objek utama dari response /api/predict-ihsg
  const iData = result?.ihsg_data; 

  if (!analysisCompleted || !iData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 transition-all">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 border border-gray-200/40">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-smart-navy mb-2">Halaman Belum Tersedia</h2>
        <p className="text-gray-400 text-sm font-medium text-center max-w-sm mb-6 px-4">
          Lakukan analisis terlebih dahulu di halaman Analysis untuk membuka konten dashboard rekomendasi AI.
        </p>
        <button
          onClick={onOpenAnalysisModal}
          className="bg-smart-navy text-white px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/>
          </svg>
          Mulai Analysis
        </button>
      </div>
    );
  }

  // Helper Formatter Pintar
  const fmtPersen = (val) => {
    if (val == null) return "N/A";
    if (Math.abs(val) > 1) return Number(val).toFixed(2) + "%";
    return (val * 100).toFixed(2) + "%";
  };
  const fmtNum = (val) => (val != null ? Number(val).toFixed(4) : "N/A");
  const fmtRupiah = (val) => val != null ? "Rp " + Number(val).toLocaleString("id-ID") : "Rp 0";

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* HEADER UTAMA */}
      <div className="bg-smart-navy px-8 py-6 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-xl font-bold text-white">SmartInvest Portfolio Dashboard</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-3 py-1 rounded-full ${
              iData?.ihsg_analysis?.market_trend === "Bullish" ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
            }`}>
              Market Sentiment: {iData?.ihsg_analysis?.market_trend || "N/A"}
            </span>
            <span className="inline-flex items-center gap-1 bg-white/10 text-blue-200 text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded-full border border-white/5">
              Confidence: {fmtPersen(iData?.ihsg_analysis?.confidence)}
            </span>
          </div>
        </div>
        <div className="text-left sm:text-right relative z-10">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Periode Analisis Historis</p>
          <p className="text-sm font-bold text-white mt-0.5">
            {iData?.metadata?.start_date || "N/A"} — {iData?.metadata?.end_date || "N/A"}
          </p>
        </div>
      </div>

      {/* Kontainer 1: Grid Metrik Utama (4 Kolom) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50/60 border border-gray-100 rounded-xl p-4 text-center flex flex-col justify-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-smart-green">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Metode Terbaik</p>
            </div>
            <p className="text-xl font-black text-smart-navy">{iData?.decision_engine?.best_method || "N/A"}</p>
          </div>
          <div className="bg-emerald-50/40 border border-emerald-100/60 rounded-xl p-4 text-center flex flex-col justify-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-smart-green">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
              </svg>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Expected Return</p>
            </div>
            <p className="text-xl font-black text-smart-green">{fmtPersen(iData?.best_method_metrics?.expected_return)}</p>
          </div>
          <div className="bg-rose-50/40 border border-rose-100/60 rounded-xl p-4 text-center flex flex-col justify-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Risiko Tahunan</p>
            </div>
            <p className="text-xl font-black text-rose-500">{fmtPersen(iData?.best_method_metrics?.annual_risk)}</p>
          </div>
          <div className="bg-blue-50/30 border border-blue-100/50 rounded-xl p-4 text-center flex flex-col justify-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Sharpe Ratio</p>
            </div>
            <p className="text-xl font-black text-smart-navy">{fmtNum(iData?.best_method_metrics?.sharpe_ratio)}</p>
          </div>
        </div>
      </div>

      {/* Kontainer 2: Grid Metrik Sekunder (3 Kolom) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Beta Terhadap IHSG</p>
            <p className="text-lg font-bold text-gray-800">{fmtNum(iData?.best_method_metrics?.beta)}</p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Alpha Penyesuaian</p>
            <p className="text-lg font-bold text-gray-800">{fmtNum(iData?.best_method_metrics?.alpha)}</p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Rasio Treynor</p>
            <p className="text-lg font-bold text-gray-800">{fmtNum(iData?.best_method_metrics?.treynor_ratio)}</p>
          </div>
        </div>
      </div>

      {/* Kontainer 3: Alokasi Portofolio Dinamik */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-base font-bold text-smart-navy mb-4 flex items-center gap-2"><span>📊</span> Pembagian Porsi Dana Investasi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="flex items-center justify-center py-4">
            <div className="w-48 h-48 rounded-full border-4 border-dashed border-smart-green/30 flex flex-col items-center justify-center bg-emerald-50/10 relative">
              <span className="text-2xl font-black text-smart-navy">{iData?.portfolio_allocation?.length || 0}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Saham Terpilih</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
            {iData?.portfolio_allocation?.map((stock, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 px-4 bg-gray-50/70 border border-gray-50 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-smart-green" />
                  <span className="text-sm font-bold text-smart-navy shrink-0">{stock.ticker?.replace(".JK", "")}</span>
                  <span className="text-xs text-gray-400 truncate font-normal">{stock.fullname}</span>
                </div>
                <span className="text-sm font-bold text-gray-700 ml-4">{fmtPersen(stock.weight)}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs font-semibold text-gray-400 mt-5 text-center bg-gray-50 py-2 rounded-xl border border-gray-100">
          Total Alokasi Modal Kerja: <span className="font-bold text-blue-600">{fmtRupiah(iData?.investment_simulation?.initial_amount)}</span>
        </p>
      </div>

      {/* Kontainer 4: Tabel Perbandingan Metode Ganda */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-base font-bold text-smart-navy mb-4">Perbandingan Hasil 3 Metode Analisis</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 text-xs uppercase tracking-wider">
                <th className="p-4">Nama Metode</th>
                <th className="p-4 text-center">Return</th>
                <th className="p-4 text-center">Risiko</th>
                <th className="p-4 text-center">Sharpe</th>
                <th className="p-4 text-center">Beta</th>
                <th className="p-4 text-center">Alpha</th>
                {/* DITAMBAHKAN ACUAN KOLOM BI RATE */}
                <th className="p-4 text-center">BI Rate Acuan</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium text-gray-600">
              {iData?.method_comparison?.map((m, idx) => (
                <tr key={idx} className="hover:bg-gray-50/40 transition-colors">
                  <td className="p-4 font-bold text-smart-navy">{m.method}</td>
                  <td className="p-4 text-center text-emerald-600 font-bold">{fmtPersen(m.return)}</td>
                  <td className="p-4 text-center text-rose-500 font-bold">{fmtPersen(m.risk)}</td>
                  <td className="p-4 text-center text-gray-700 font-bold">{fmtNum(m.sharpe)}</td>
                  <td className="p-4 text-center text-gray-600">{fmtNum(m.beta)}</td>
                  <td className="p-4 text-center text-gray-600">{fmtNum(m.alpha)}</td>
                  {/* MENAMPILKAN DATA METADATA BI RATE SECARA DINAMIS */}
                  <td className="p-4 text-center font-semibold text-gray-500">{iData?.metadata?.bi_rate != null ? iData.metadata.bi_rate + "%" : "N/A"}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide ${
                      m.is_best ? "bg-smart-green text-white shadow-sm" : "bg-gray-100 text-gray-400"
                    }`}>
                      {m.is_best ? "TERBAIK" : "PEMBANDING"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-gray-400 mt-3 leading-relaxed px-1">
          * Return dan Risiko dihitung secara tahunan. Sharpe Ratio menggunakan risk-free rate BI terkini sebesar {iData?.metadata?.bi_rate || 5.8}%. Beta & Alpha dihitung terhadap volatilitas pergerakan pasar (IHSG).
        </p>
      </div>

      {/* Kontainer 5: Interpretasi AI */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-2">
          <h2 className="text-base font-bold text-smart-navy">Interpretasi Rekomendasi Pintar AI</h2>
        </div>
        {iData?.ai_interpretation && (
          <div className="text-sm text-gray-600 whitespace-pre-line leading-relaxed bg-gray-50/60 border border-gray-100 p-5 rounded-xl">
            {iData.ai_interpretation}
          </div>
        )}
      </div>

      {/* DISCLAIMER */}
      <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-4 flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 shrink-0 mt-0.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <p className="text-xs text-amber-800 font-medium leading-relaxed">
          Disclaimer: Hasil analisis ini dihasilkan oleh mesin AI berdasarkan data historis dan model statistik kuantitatif bursa efek dari endpoint predict-ihsg.
        </p>
      </div>

    </div>
  );
}