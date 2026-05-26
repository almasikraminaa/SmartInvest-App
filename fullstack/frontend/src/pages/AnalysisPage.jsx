import { useState } from "react";

export default function AnalysisPage({
  analysisCompleted,
  result,
  metaForm,
  setIsAnalysisModalOpen,
}) {
  // Memecah objek dual API hasil kiriman state global App.jsx
  const pData = result?.portfolio_data;
  const iData = result?.ihsg_data;

  // Helper format persen pintar
  const fmtPersen = (val) => {
    if (val == null) return "N/A";
    if (Math.abs(val) > 1) return Number(val).toFixed(2) + "%";
    return (val * 100).toFixed(2) + "%";
  };

  const fmtRupiah = (val) =>
    val != null ? "Rp " + Number(val).toLocaleString("id-ID") : "Rp 0";

  // Helper: Parse GenAI text into styled sections
  const renderGenAISections = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    const sections = [];
    let currentSection = { lines: [] };

    lines.forEach((line) => {
      const trimmed = line.trim();
      // Detect section headers (lines with emoji at start + bold-like text)
      if (
        (trimmed.match(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u) && trimmed.length > 3 && !trimmed.startsWith('👉') && !trimmed.startsWith('⚠️')) ||
        trimmed.startsWith('## ') ||
        trimmed.startsWith('**') && trimmed.endsWith('**')
      ) {
        if (currentSection.lines.length > 0) {
          sections.push(currentSection);
        }
        currentSection = { header: trimmed.replace(/^##\s*/, '').replace(/\*\*/g, ''), lines: [] };
      } else if (trimmed.length > 0) {
        currentSection.lines.push(trimmed);
      }
    });
    if (currentSection.lines.length > 0 || currentSection.header) {
      sections.push(currentSection);
    }

    return sections.map((section, idx) => {
      const isTips = section.lines.some(l => l.startsWith('👉'));
      const isWarning = section.lines.some(l => l.startsWith('⚠️'));

      return (
        <div key={idx} className={`rounded-xl p-4 ${
          isWarning ? 'bg-amber-50/60 border border-amber-200/50' :
          isTips ? 'bg-emerald-50/40 border border-emerald-100/60' :
          idx === 0 ? 'bg-gradient-to-r from-blue-50/60 to-indigo-50/40 border border-blue-100/50' :
          'bg-gray-50/50 border border-gray-100/60'
        }`}>
          {section.header && (
            <p className={`font-bold text-sm mb-2 ${
              isWarning ? 'text-amber-700' :
              isTips ? 'text-emerald-700' :
              'text-smart-navy'
            }`}>{section.header}</p>
          )}
          {section.lines.map((line, li) => {
            if (line.startsWith('👉')) {
              return (
                <div key={li} className="flex items-start gap-2 py-1.5">
                  <span className="text-sm shrink-0">👉</span>
                  <span className="text-sm text-gray-700 leading-relaxed">{line.replace('👉', '').trim()}</span>
                </div>
              );
            }
            if (line.startsWith('⚠️')) {
              return (
                <div key={li} className="flex items-start gap-2 py-1">
                  <span className="text-sm shrink-0">⚠️</span>
                  <span className="text-xs text-amber-700 leading-relaxed font-medium">{line.replace('⚠️', '').trim()}</span>
                </div>
              );
            }
            if (line.startsWith('- ') || line.startsWith('• ')) {
              return (
                <div key={li} className="flex items-start gap-2 py-0.5 pl-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-smart-green shrink-0 mt-1.5"></span>
                  <span className="text-sm text-gray-700 leading-relaxed">{line.replace(/^[-•]\s*/, '').trim()}</span>
                </div>
              );
            }
            return <p key={li} className="text-sm text-gray-600 leading-relaxed mb-1">{line}</p>;
          })}
        </div>
      );
    });
  };

  // ── HITUNG TOTAL SECARA DINAMIS UNTUK BAGIAN FOOTER TABEL ──
  const totalWeight =
    pData?.portfolio?.reduce((sum, stock) => sum + (stock.weight || 0), 0) || 0;
  const totalAllocation =
    pData?.portfolio?.reduce(
      (sum, stock) => sum + (stock.allocation || 0),
      0,
    ) || 0;

  const initialAmount =
    iData?.investment_simulation?.initial_amount ||
    metaForm?.investment_amount ||
    0;
  const sisaDanaTunai = initialAmount - totalAllocation;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 min-h-[85vh]">
      <main className="w-full mx-auto flex flex-col gap-6">
        {/* HEADER HALAMAN */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-smart-navy">
              Analisis Kuantitatif Portofolio & IHSG
            </h1>
            <p className="text-400 text-sm mt-0.5">
              Sinkronisasi Alokasi Kuantitatif Terpilih dengan Prediksi Arah AI
              Makro bursa.
            </p>
          </div>
          {analysisCompleted && result && (
            <button
              onClick={() => setIsAnalysisModalOpen(true)}
              className="bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-all text-center shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Hitung Ulang Analisis
            </button>
          )}
        </div>

        {!analysisCompleted || !result ? (
          /* ── STATE MENUNGGU JIKA BELUM ADA DATA ANALISIS ── */
          <section className="flex flex-col items-center justify-center py-24 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 transition-all">
            <button
              onClick={() => setIsAnalysisModalOpen(true)}
              className="group w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-smart-green mb-6 shadow-inner hover:scale-105 hover:bg-emerald-100/70 transition-all border border-emerald-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:rotate-12 transition-transform"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <rect x="9" y="9" width="6" height="6" />
                <line x1="9" y1="1" x2="9" y2="4" />
                <line x1="15" y1="1" x2="15" y2="4" />
                <line x1="9" y1="20" x2="9" y2="23" />
                <line x1="15" y1="20" x2="15" y2="23" />
                <line x1="20" y1="9" x2="23" y2="9" />
                <line x1="20" y1="15" x2="23" y2="15" />
                <line x1="1" y1="9" x2="4" y2="9" />
                <line x1="1" y1="15" x2="4" y2="15" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-smart-navy mb-1">
              Optimasi Portofolio Anda
            </h2>
            <p className="text-400 text-sm font-medium mb-6 text-center max-w-sm px-4">
              Tentukan target indeks bursa dan model perhitungan manajemen
              risiko yang Anda inginkan.
            </p>
            <button
              onClick={() => setIsAnalysisModalOpen(true)}
              className="bg-smart-navy text-white font-bold px-6 py-3 rounded-xl text-sm transition-opacity hover:opacity-90 shadow-sm"
            >
              Konfigurasi Parameter Perhitungan
            </button>
          </section>
        ) : (
          /* ── LAYOUT UTAMA: VERTIKAL SATU KOLOM PENUH (FULL WIDTH) ── */
          <div className="flex flex-col gap-6 animate-fade-in w-full">
            
            {/* Info strip ringkas: metode, indeks, periode */}
            <div className="bg-smart-navy text-white rounded-2xl px-6 py-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative overflow-hidden w-full">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-smart-green/20 flex items-center justify-center">
                  <span className="text-lg">🧮</span>
                </div>
                <div>
                  <p className="text-sm font-black tracking-wide">Metode: {metaForm?.model_choice}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Indeks {iData?.metadata?.index_choice} • BI Rate {iData?.metadata?.bi_rate}%</p>
                </div>
              </div>
              <div className="text-left sm:text-right relative z-10">
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Periode Historis</p>
                <p className="text-xs font-bold text-white mt-0.5">{iData?.metadata?.start_date || metaForm?.start_date} — {iData?.metadata?.end_date || metaForm?.end_date}</p>
              </div>
            </div>

            {/* Bagian Tengah: Tabel Komposisi */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <h3 className="font-bold text-smart-navy text-base flex items-center gap-2">
                  <span>📊</span> Komposisi Alokasi Saham Pilihan (
                  {metaForm?.model_choice})
                </h3>
                <span className="text-[11px] font-semibold px-2.5 py-1 bg-gray-50 text-gray-500 rounded-lg border border-gray-100 self-start sm:self-center">
                  {metaForm?.model_choice === "CAPM"
                    ? "📌 Top 10 Saham Terbesar"
                    : "⚡ Seleksi Otomatis via Cut-Off Market"}
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50/70 text-gray-500 font-bold border-b border-gray-100 text-xs uppercase tracking-wider">
                      <th className="p-4">Ticker</th>
                      <th className="p-4">Sektor</th>
                      <th className="p-4">Bobot</th>
                      <th className="p-4 text-right">Alokasi Dana</th>
                      <th className="p-4 text-center">Tren</th>
                      <th className="p-4 text-center">Rekomendasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-600 font-medium">
                    {(() => {
                      const isCAPM = metaForm?.model_choice === "CAPM";
                      const stocksToRender = isCAPM
                        ? pData?.portfolio?.slice(0, 10)
                        : pData?.portfolio;

                      return stocksToRender?.map((stock, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-gray-50/30 transition-colors"
                        >
                          <td className="p-4">
                            <span className="font-bold text-smart-navy block">
                              {stock.ticker?.replace(".JK", "")}
                            </span>
                            <span className="text-[10px] text-gray-400 font-normal block max-w-[150px] truncate">
                              {stock.fullname}
                            </span>
                          </td>
                          <td className="p-4 text-gray-700">
                            {stock.sector}
                          </td>
                          <td className="p-4 text-gray-700">
                            {fmtPersen(stock.weight)}
                          </td>
                          <td className="p-4 text-right text-smart-green">
                            {fmtRupiah(stock.allocation)}
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                stock.trend === "Bullish"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                  : stock.trend === "Bearish"
                                    ? "bg-rose-50 text-rose-700 border border-rose-100"
                                    : "bg-amber-50 text-amber-700 border border-amber-100"
                              }`}
                            >
                              {stock.trend || "Sideways"}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide ${
                                stock.recommendation === "BUY"
                                  ? "bg-smart-green text-white"
                                  : stock.recommendation === "HOLD"
                                    ? "bg-amber-500 text-white"
                                    : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {stock.recommendation || "HOLD"}
                            </span>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>  
            </div>

            {/* Bagian Paling Bawah: Narasi AI Interpretasi (Premium Card Layout) */}
            {pData?.portfolio_summary && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col w-full overflow-hidden">
                {/* Gradient Header */}
                <div className="bg-gradient-to-r from-smart-navy via-[#1a2740] to-smart-navy px-6 py-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-smart-green/20 flex items-center justify-center">
                    <span className="text-base">💡</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Interpretasi Pintar AI</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Analisis Naratif oleh SmartInvest AI • {metaForm?.model_choice}</p>
                  </div>
                </div>
                {/* Body: Parsed sections */}
                <div className="p-6 flex flex-col gap-3">
                  {renderGenAISections(pData?.portfolio_summary)}
                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}

