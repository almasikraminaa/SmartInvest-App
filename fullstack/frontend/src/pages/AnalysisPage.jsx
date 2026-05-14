// src/pages/AnalysisPage.jsx

export default function AnalysisPage({ analysisCompleted, setIsAnalysisModalOpen }) {
  const onOpenAnalysisModal = () => setIsAnalysisModalOpen(true);

  return (
    <div className="flex flex-col h-full -mt-8 -mx-8 relative">

      {/* AREA UTAMA */}
      <main className="flex-1 p-8 flex flex-col gap-6 relative z-10">

        {!analysisCompleted ? (
          /* Belum analysis — button logo AI dalam kontainer */
          <section className="flex flex-col items-center justify-center py-10 bg-white rounded-3xl border border-gray-100 shadow-sm transition-all">
            <button
              onClick={onOpenAnalysisModal}
              className="group w-28 h-28 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 mb-6 shadow-inner hover:scale-105 hover:bg-blue-100 transition-all active:scale-95"
              aria-label="Start AI Analysis"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform">
                <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/>
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-smart-navy mb-2">Start Analysis</h2>
            <p className="text-gray-400 text-sm font-medium">Klik logo AI di atas untuk mengatur parameter analisis Anda.</p>
          </section>
        ) : (
          /* Sudah analysis — output slots */
          <section className="flex-1 flex flex-col gap-6">

            {/* Header + Run Again */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-smart-navy">Portfolio Optimization</h1>
              <button
                onClick={onOpenAnalysisModal}
                className="bg-white border border-gray-200 text-smart-navy px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                Run Analysis Again
              </button>
            </div>

            {/* ============================================ */}
            {/* SLOT 1: Optimal Weights (Pie/Doughnut Chart) */}
            {/* ============================================ */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <h2 className="text-lg font-bold text-smart-navy mb-1">Optimal Weights</h2>
              <p className="text-xs text-gray-400 mb-6">Alokasi bobot optimal per saham dalam portofolio</p>

              <div className="flex flex-col lg:flex-row gap-8 items-center">
                {/* Slot: Pie/Doughnut Chart */}
                <div className="w-64 h-64 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50/50">
                  <span className="text-sm text-gray-300 font-medium text-center px-4">Pie / Doughnut Chart<br/>Alokasi Saham</span>
                </div>

                {/* Slot: List Saham + Persentase */}
                <div className="flex-1 w-full">
                  <div className="space-y-3">
                    {/* Placeholder rows — akan diganti data real */}
                    {['BBCA', 'BBRI', 'TLKM', 'ASII', 'UNVR'].map((ticker) => (
                      <div key={ticker} className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-xl">
                        <span className="text-sm font-bold text-smart-navy">{ticker}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-400 rounded-full" style={{ width: '0%' }} />
                          </div>
                          <span className="text-xs font-bold text-gray-400 w-10 text-right">—%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================ */}
            {/* SLOT 2: Performance Metrics                  */}
            {/* ============================================ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Expected Annual Return */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">Expected Annual Return</span>
                <span className="text-3xl font-bold text-smart-navy">—%</span>
                <span className="text-xs text-gray-300 mt-1">Menunggu data...</span>
              </div>

              {/* Annual Volatility */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">Annual Volatility</span>
                <span className="text-3xl font-bold text-smart-navy">—%</span>
                <span className="text-xs text-gray-300 mt-1">Menunggu data...</span>
              </div>

              {/* Sharpe Ratio */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">Sharpe Ratio</span>
                <span className="text-3xl font-bold text-smart-navy">—</span>
                <span className="text-xs text-gray-300 mt-1">Menunggu data...</span>
              </div>
            </div>

            {/* ============================================ */}
            {/* SLOT 3: Efficient Frontier (Opsional)        */}
            {/* ============================================ */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <h2 className="text-lg font-bold text-smart-navy mb-1">Efficient Frontier</h2>
              <p className="text-xs text-gray-400 mb-6">Sebaran risiko vs return dari berbagai kombinasi portofolio</p>

              {/* Slot: Scatter/Line Chart */}
              <div className="w-full h-64 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center bg-gray-50/50">
                <span className="text-sm text-gray-300 font-medium text-center px-4">Efficient Frontier Chart<br/>(Risk vs Return)</span>
              </div>
            </div>

            {/* ============================================ */}
            {/* DISCLAIMER                                   */}
            {/* ============================================ */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-xs text-amber-700 font-medium leading-relaxed">
                Berdasarkan batasan sistem, analisis data dibatasi maksimal untuk periode 5 tahun terakhir.
              </p>
            </div>

          </section>
        )}

      </main>

    </div>
  );
}
