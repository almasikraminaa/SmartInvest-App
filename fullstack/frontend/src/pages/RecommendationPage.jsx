// src/pages/RecommendationPage.jsx

export default function RecommendationPage({ analysisCompleted, setIsAnalysisModalOpen }) {
  const onOpenAnalysisModal = () => setIsAnalysisModalOpen(true);

  if (!analysisCompleted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-smart-navy mb-2">Halaman Belum Tersedia</h2>
        <p className="text-gray-400 text-sm font-medium text-center max-w-sm mb-6">
          Lakukan analisis terlebih dahulu di halaman Analysis untuk membuka konten rekomendasi AI.
        </p>
        <button
          onClick={onOpenAnalysisModal}
          className="bg-smart-navy text-white px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/>
          </svg>
          Mulai Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      {/* HEADER UTAMA (Biru Tema) */}
      <div className="bg-smart-navy px-8 py-6 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">SmartInvest Portfolio Dashboard</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-300 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
              Market Sentiment: <span data-slot="sentiment">N/A</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-white/10 text-blue-200 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
              Confidence: <span data-slot="confidence">N/A</span>
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider font-bold text-blue-300">Periode Analisis</p>
          <p className="text-sm font-bold text-white mt-0.5">
            <span data-slot="period-start">N/A</span> — <span data-slot="period-end">N/A</span>
          </p>
        </div>
      </div>

      {/* ============================================ */}
      {/* BODI — kartu-kartu mengapung langsung        */}
      {/* ============================================ */}

        {/* ========================================== */}
        {/* Kontainer 1: Grid Metrik Utama (4 Kolom)   */}
        {/* ========================================== */}
        <div className="bg-white p-8 rounded-xl border border-slate-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Metode Terbaik */}
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Metode Terbaik</p>
              </div>
              <p className="text-xl font-bold text-smart-navy" data-slot="best-method">N/A</p>
            </div>
            {/* Expected Return */}
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Expected Return</p>
              </div>
              <p className="text-xl font-bold text-green-600" data-slot="expected-return">N/A</p>
            </div>
            {/* Risk */}
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Risk (Volatilitas)</p>
              </div>
              <p className="text-xl font-bold text-red-500" data-slot="risk">N/A</p>
            </div>
            {/* Sharpe Ratio */}
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Sharpe Ratio</p>
              </div>
              <p className="text-xl font-bold text-gray-800" data-slot="sharpe-ratio">N/A</p>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* Kontainer 2: Grid Metrik Sekunder (3 Kolom)*/}
        {/* ========================================== */}
        <div className="bg-white p-8 rounded-xl border border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Beta (vs IHSG)</p>
              <p className="text-lg font-bold text-gray-800" data-slot="beta">N/A</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Alpha (vs IHSG)</p>
              <p className="text-lg font-bold text-gray-800" data-slot="alpha">N/A</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Treynor Ratio</p>
              <p className="text-lg font-bold text-gray-800" data-slot="treynor-ratio">N/A</p>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* Kontainer 3: Alokasi Portofolio (Doughnut) */}
        {/* ========================================== */}
        <div className="bg-white p-8 rounded-xl border border-slate-100">
          <h2 className="text-lg font-bold text-smart-navy mb-4">Alokasi Portofolio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sisi Kiri: Doughnut Chart Slot */}
            <div className="flex items-center justify-center">
              <div className="w-56 h-56 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50/50">
                <span className="text-sm text-gray-300 font-medium text-center px-4">Doughnut Chart<br/>Alokasi Saham</span>
              </div>
            </div>
            {/* Sisi Kanan: Legend */}
            <div className="flex flex-col justify-center gap-3">
              {['SAHAM A', 'SAHAM B', 'SAHAM C', 'SAHAM D', 'SAHAM E'].map((saham, i) => (
                <div key={saham} className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${['bg-blue-500','bg-green-500','bg-yellow-500','bg-red-500','bg-purple-500'][i]}`} />
                    <span className="text-sm font-medium text-gray-700">{saham}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800" data-slot={`alokasi-${i + 1}`}>N/A%</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center">
            Total alokasi: <span className="font-bold text-gray-600" data-slot="total-alokasi">Rp N/A</span>
          </p>
        </div>

        {/* ========================================== */}
        {/* Kontainer 4: Tabel Perbandingan Metode     */}
        {/* ========================================== */}
        <div className="bg-white p-8 rounded-xl border border-slate-100">
          <h2 className="text-lg font-bold text-smart-navy mb-4">Perbandingan 3 Metode Portofolio</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Metode</th>
                  <th className="text-center py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Return</th>
                  <th className="text-center py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Risiko</th>
                  <th className="text-center py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Sharpe</th>
                  <th className="text-center py-3 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Alpha</th>
                </tr>
              </thead>
              <tbody>
                {['MVEP', 'SIM', 'CAPM'].map((metode) => (
                  <tr key={metode} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-smart-navy">{metode}</td>
                    <td className="py-3 px-4 text-center font-bold text-green-600" data-slot={`${metode.toLowerCase()}-return`}>N/A</td>
                    <td className="py-3 px-4 text-center font-bold text-red-500" data-slot={`${metode.toLowerCase()}-risk`}>N/A</td>
                    <td className="py-3 px-4 text-center font-bold text-gray-800" data-slot={`${metode.toLowerCase()}-sharpe`}>N/A</td>
                    <td className="py-3 px-4 text-center font-bold text-gray-800" data-slot={`${metode.toLowerCase()}-alpha`}>N/A</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-gray-400 mt-3 leading-relaxed">
            * Return dan Risiko dihitung secara tahunan (annualized). Sharpe Ratio menggunakan risk-free rate BI 7-Day Repo Rate terkini.
          </p>
        </div>

        {/* ========================================== */}
        {/* Kontainer 5: Interpretasi Rekomendasi (AI) */}
        {/* ========================================== */}
        <div className="bg-white p-8 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/>
              </svg>
            </div>
            <h2 className="text-lg font-bold text-smart-navy">Interpretasi Rekomendasi</h2>
          </div>

          <div className="space-y-4" style={{ lineHeight: '1.6' }}>
            {/* Poin 1: Tren */}
            <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
              <div className="w-7 h-7 rounded-md bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed" data-slot="ai-point-1">N/A</p>
            </div>

            {/* Poin 2: Risiko */}
            <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
              <div className="w-7 h-7 rounded-md bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed" data-slot="ai-point-2">N/A</p>
            </div>

            {/* Poin 3: Kesimpulan */}
            <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
              <div className="w-7 h-7 rounded-md bg-yellow-100 flex items-center justify-center shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed" data-slot="ai-point-3">N/A</p>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* DISCLAIMER (Mengapung di atas grey base)    */}
        {/* ========================================== */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600 shrink-0 mt-0.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <p className="text-xs text-yellow-800 font-medium leading-relaxed">
            Disclaimer: Hasil analisis ini dihasilkan oleh mesin AI berdasarkan data historis dan model statistik.
            Tidak merupakan saran investasi. Batasan maksimal periode analisis adalah 5 tahun terakhir.
          </p>
        </div>

    </div>
  );
}
