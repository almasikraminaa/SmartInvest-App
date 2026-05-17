// src/pages/AnalysisPage.jsx

export default function AnalysisPage({ analysisCompleted, setIsAnalysisModalOpen }) {
  const onOpenAnalysisModal = () => setIsAnalysisModalOpen(true);

  return (
    <div className="flex flex-col h-full relative">

      {/* AREA UTAMA */}
      <main className="flex-1 flex flex-col gap-6 relative z-10">

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
            <h2 className="text-2xl font-bold text-smart-navy mb-2">Mulai Analysis</h2>
            <p className="text-gray-400 text-sm font-medium">Klik logo AI di atas untuk mengatur parameter analisis Anda.</p>
          </section>
        ) : (
          /* ============================================ */
          /* OUTPUT: Rekomendasi Portofolio               */
          /* ============================================ */
          <section className="flex-1 flex flex-col">

            {/* Run Again button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={onOpenAnalysisModal}
                className="bg-white border border-gray-200 text-smart-navy px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                Run Analysis Again
              </button>
            </div>

            {/* Card Container */}
            <div className="w-full rounded-xl overflow-hidden border border-slate-100 z-10">

              {/* 1. Header (Smart Navy) */}
              <div className="bg-smart-navy px-7 py-6 flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Rekomendasi Portofolio Anda</h1>
                  <p className="text-blue-200 text-sm mt-0.5">Metode terbaik: <span data-slot="metode">N/A</span></p>
                </div>
              </div>

              {/* Body (bg putih) */}
              <div className="bg-white px-8 py-8 flex flex-col gap-6">

                {/* 2. Grid 4 Kolom — dibungkus warna muda sesuai angka */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Return — bg hijau muda */}
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">Return</p>
                    <p className="text-2xl font-bold text-green-600" data-slot="return">N/A</p>
                  </div>
                  {/* Risiko — bg merah muda */}
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">Risiko</p>
                    <p className="text-2xl font-bold text-red-500" data-slot="risiko">N/A</p>
                  </div>
                  {/* Sharpe — bg slate muda */}
                  <div className="bg-slate-50 rounded-lg p-4 text-center">
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">Sharpe</p>
                    <p className="text-2xl font-bold text-gray-800" data-slot="sharpe">N/A</p>
                  </div>
                  {/* Beta — bg slate muda */}
                  <div className="bg-slate-50 rounded-lg p-4 text-center">
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">Beta</p>
                    <p className="text-2xl font-bold text-gray-800" data-slot="beta">N/A</p>
                  </div>
                </div>

                {/* 3. Banner Simulasi */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-sm text-gray-600 font-medium">
                    Simulasi Investasi: <span className="font-bold text-smart-navy" data-slot="simulasi">Rp10.000.000</span>
                  </p>
                </div>

                {/* 4. Konten Utama (Narasi AI Placeholder) */}
                <div style={{ lineHeight: '1.6' }}>
                  <p className="text-base text-gray-700 mb-4" data-slot="greeting">
                    👋 Sobat SmartInvest
                  </p>
                  <p className="text-sm text-gray-600 mb-4" data-slot="narasi-intro">
                    Berdasarkan analisis yang telah dilakukan, berikut adalah rekomendasi portofolio optimal untuk Anda.
                    Narasi lengkap akan ditampilkan setelah integrasi dengan output AI selesai.
                  </p>
                  <p className="text-sm text-gray-600" data-slot="narasi-body">
                    Sistem kami telah menganalisis berbagai kombinasi saham untuk menemukan alokasi terbaik
                    berdasarkan parameter yang Anda tentukan. Hasil detail akan muncul di sini setelah
                    proses kalkulasi selesai.
                  </p>
                </div>

                {/* 5. Footer / Disclaimer (Kuning) — di dalam body */}
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg px-5 py-4 flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600 shrink-0 mt-0.5">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <p className="text-xs text-yellow-800 font-medium leading-relaxed">
                    Analisis ini berdasarkan data historis dengan batasan maksimal periode 5 tahun.
                  </p>
                </div>

              </div>

            </div>

          </section>
        )}

      </main>

    </div>
  );
}
