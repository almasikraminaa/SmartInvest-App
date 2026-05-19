import { useState } from "react";

export default function AnalysisPage({ analysisCompleted, result, metaForm, setIsAnalysisModalOpen }) {
  
  // Memecah objek dual API hasil kiriman state global App.jsx
  const pData = result?.portfolio_data; 
  const iData = result?.ihsg_data;      

  // Mencari object di method_comparison yang metodenya cocok dengan pilihan di modal
  const selectedMethodMetrics = iData?.method_comparison?.find(
    (m) => m.method === metaForm?.model_choice
  );

  // Mengambil angka metrik berdasarkan model pilihan dari predict-ihsg (iData)
  const activeReturn = selectedMethodMetrics 
    ? selectedMethodMetrics.return 
    : iData?.best_method_metrics?.expected_return;

  const activeRisk = selectedMethodMetrics 
    ? selectedMethodMetrics.risk 
    : iData?.best_method_metrics?.annual_risk;

  const activeSharpe = selectedMethodMetrics 
    ? selectedMethodMetrics.sharpe 
    : iData?.best_method_metrics?.sharpe_ratio;

  // Helper format persen pintar
  const fmtPersen = (val) => {
    if (val == null) return "N/A";
    if (Math.abs(val) > 1) return Number(val).toFixed(2) + "%";
    return (val * 100).toFixed(2) + "%";
  };
  
  const fmtNum = (val) => (val != null ? Number(val).toFixed(2) : "N/A");
  const fmtRupiah = (val) => val != null ? "Rp " + Number(val).toLocaleString("id-ID") : "Rp 0";

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 min-h-[85vh]">
      <main className="w-full mx-auto flex flex-col gap-6">
        
        {/* HEADER HALAMAN */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-smart-navy">Analisis Kuantitatif Portofolio & IHSG</h1>
            <p className="text-gray-400 text-sm mt-0.5">Sinkronisasi Alokasi Kuantitatif Terpilih dengan Prediksi Arah AI Makro bursa.</p>
          </div>
          {analysisCompleted && (
            <button
              onClick={() => setIsAnalysisModalOpen(true)}
              className="bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-all text-center shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              Hitung Ulang Analisis
            </button>
          )}
        </div>

        {!analysisCompleted ? (
          /* ── STATE MENUNGGU ── */
          <section className="flex flex-col items-center justify-center py-24 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 transition-all">
            <button onClick={() => setIsAnalysisModalOpen(true)} className="group w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-smart-green mb-6 shadow-inner hover:scale-105 hover:bg-emerald-100/70 transition-all border border-emerald-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform">
                <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/>
              </svg>
            </button>
            <h2 className="text-xl font-bold text-smart-navy mb-1">Optimasi Portofolio Anda</h2>
            <p className="text-gray-400 text-sm font-medium mb-6 text-center max-w-sm px-4">Tentukan target indeks bursa dan model perhitungan manajemen risiko yang Anda inginkan.</p>
            <button onClick={() => setIsAnalysisModalOpen(true)} className="bg-smart-navy text-white font-bold px-6 py-3 rounded-xl text-sm transition-opacity hover:opacity-90 shadow-sm">Konfigurasi Parameter Perhitungan</button>
          </section>
        ) : (
          /* ── LAYOUT DASHBOARD UTAMA GANDA ── */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
            
            {/* SEKTOR KIRI: PORTFOLIO & BREAKDOWN METRIK */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Card 4 Metrik Utama */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="bg-emerald-50/40 border border-emerald-100/60 rounded-xl p-3.5 text-center flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Expected Return</p>
                  <p className="text-xl font-black text-smart-green">{fmtPersen(activeReturn)}</p>
                </div>
                <div className="bg-rose-50/40 border border-rose-100/60 rounded-xl p-3.5 text-center flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Risiko Tahunan</p>
                  <p className="text-xl font-black text-rose-500">{fmtPersen(activeRisk)}</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-center flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Sharpe Ratio</p>
                  <p className="text-xl font-black text-smart-navy">{fmtNum(activeSharpe)}</p>
                </div>
                <div className="bg-blue-50/40 border border-blue-100/50 rounded-xl p-3.5 text-center flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Simulasi Dana</p>
                  <p className="text-xs font-bold text-blue-600 truncate">{fmtRupiah(iData?.investment_simulation?.initial_amount || metaForm?.investment_amount)}</p>
                </div>
              </div>

              {/* Tabel Komposisi */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <h3 className="font-bold text-smart-navy text-base flex items-center gap-2">
                    <span>📊</span> Komposisi Alokasi Saham Pilihan ({metaForm?.model_choice})
                  </h3>
                  <span className="text-[11px] font-semibold px-2.5 py-1 bg-gray-50 text-gray-500 rounded-lg border border-gray-100 self-start sm:self-center">
                    Model Perhitungan Aktif
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50/70 text-gray-500 font-bold border-b border-gray-100 text-xs uppercase tracking-wider">
                        <th className="p-4">Ticker</th>
                        <th className="p-4">Bobot</th>
                        <th className="p-4 text-right">Alokasi Dana</th>
                        <th className="p-4 text-right">Jumlah Lot</th>
                        <th className="p-4 text-center">Tren</th>
                        <th className="p-4 text-center">Rekomendasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-gray-600 font-medium">
                      {/* Tampilkan apa adanya tanpa ada penyaringan index / slice di frontend */}
                      {pData?.portfolio?.map((stock, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                          <td className="p-4">
                            <span className="font-bold text-smart-navy block">{stock.ticker?.replace(".JK", "")}</span>
                            <span className="text-[10px] text-gray-400 font-normal block max-w-[150px] truncate">{stock.fullname}</span>
                          </td>
                          <td className="p-4 text-gray-700">{fmtPersen(stock.weight)}</td>
                          <td className="p-4 text-right text-smart-green">{fmtRupiah(stock.allocation)}</td>
                          <td className="p-4 text-right font-bold text-gray-700">{stock.integer_lot || stock.lot?.toFixed(0)} Lot</td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              stock.trend === "Bullish" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : 
                              stock.trend === "Bearish" ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-amber-50 text-amber-700 border border-amber-100"
                            }`}>
                              {stock.trend || "Sideways"}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide ${
                              stock.recommendation === "BUY" ? "bg-smart-green text-white" : 
                              stock.recommendation === "HOLD" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-400"
                            }`}>
                              {stock.recommendation || "HOLD"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* SEKTOR KANAN: PANEL IHSG & AI INTERPRETATION */}
            <div className="flex flex-col gap-6 lg:sticky lg:top-6">
              
              {/* Hasil Prediksi IHSG Engine */}
              <div className="bg-smart-navy text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-smart-green mb-3">Arah Pergerakan IHSG</h3>
                
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">
                    {iData?.ihsg_analysis?.market_trend === "Bullish" ? "📈" : "📉"}
                  </span>
                  <div>
                    <p className="text-lg font-black tracking-wide">{iData?.ihsg_analysis?.description}</p>
                    <p className="text-xs text-gray-400">Model: {iData?.ihsg_analysis?.model_architecture}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-xs border-t border-white/10 pt-3">
                  <div className="flex justify-between"><span className="text-gray-400">Akurasi AI:</span><span className="font-bold text-smart-green">{fmtPersen(iData?.ihsg_analysis?.confidence)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Target Indeks:</span><span className="font-bold text-white uppercase">{iData?.metadata?.index_choice}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">BI Rate Acuan:</span><span className="font-bold text-white">{iData?.metadata?.bi_rate}%</span></div>
                </div>
              </div>

              {/* Proyeksi Untung Rugi Simulasi */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Estimasi 1 Tahun Dana</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center bg-emerald-50/30 p-2.5 rounded-xl border border-emerald-100/50">
                    <span className="text-xs font-medium text-gray-500">Potensi Naik</span>
                    <span className="text-sm font-bold text-smart-green">+{fmtRupiah(iData?.investment_simulation?.potential_gain)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-rose-50/30 p-2.5 rounded-xl border border-rose-100/50">
                    <span className="text-xs font-medium text-gray-500">Potensi Turun</span>
                    <span className="text-sm font-bold text-rose-500">-{fmtRupiah(iData?.investment_simulation?.potential_loss)}</span>
                  </div>
                </div>
              </div>

              {/* Narasi AI Interpretasi */}
              {iData?.ai_interpretation && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-3">
                  <h3 className="font-bold text-smart-navy text-sm flex items-center gap-2 border-b border-gray-50 pb-2">
                    <span>💡</span> Interpretasi Pintar AI
                  </h3>
                  <div className="text-xs text-gray-600 space-y-3 whitespace-pre-line leading-relaxed max-h-[300px] overflow-y-auto pr-1">
                    {iData?.ai_interpretation}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}
      </main>
    </div>
  );
}