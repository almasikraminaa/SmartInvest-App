// src/pages/RecommendationPage.jsx

export default function RecommendationPage() {
  return (
    <div className="flex flex-col gap-6 pb-10">

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-smart-navy mb-1">AI Trend Prediction</h1>
        <p className="text-sm text-gray-400 font-medium">Prediksi tren harga saham menggunakan model LSTM</p>
      </div>

      {/* ============================================ */}
      {/* SLOT 1: Price Prediction Graph               */}
      {/* ============================================ */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-smart-navy">Price Prediction Graph</h2>
            <p className="text-xs text-gray-400 mt-0.5">Perbandingan data historis vs prediksi harga ke depan</p>
          </div>
          {/* Legend placeholder */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-smart-navy" />
              <span className="text-[10px] font-bold text-gray-500">Historis</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-400" />
              <span className="text-[10px] font-bold text-gray-500">Prediksi</span>
            </div>
          </div>
        </div>

        {/* Slot: Line Chart (Historis vs Prediksi) */}
        <div className="w-full h-72 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center bg-gray-50/50">
          <span className="text-sm text-gray-300 font-medium text-center px-4">Line Chart<br/>Harga Historis vs Prediksi LSTM</span>
        </div>
      </section>

      {/* ============================================ */}
      {/* SLOT 2: Trend Indicator                      */}
      {/* ============================================ */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-lg font-bold text-smart-navy mb-4">Trend Indicator</h2>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Trend Status Badge */}
          <div className="flex-1 flex items-center gap-4 bg-gray-50 rounded-2xl p-5">
            {/* Icon placeholder */}
            <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Status Tren</span>
              {/* Slot: Trend label — akan diisi "Bullish", "Bearish", atau "Stable" */}
              <p className="text-xl font-bold text-gray-300 mt-0.5">— Menunggu data</p>
            </div>
          </div>

          {/* Confidence Score */}
          <div className="flex-1 flex items-center gap-4 bg-gray-50 rounded-2xl p-5">
            <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Confidence</span>
              {/* Slot: Confidence percentage */}
              <p className="text-xl font-bold text-gray-300 mt-0.5">—%</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SLOT 3: AI Recommendation Text               */}
      {/* ============================================ */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-start gap-4">
          {/* AI Icon */}
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
              <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/>
            </svg>
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-bold text-smart-navy mb-1">AI Recommendation</h2>
            <p className="text-xs text-gray-400 mb-4">Narasi singkat mengapa metode/saham ini direkomendasikan</p>

            {/* Slot: Recommendation text area — akan diisi narasi dari AI */}
            <div className="bg-gray-50 rounded-2xl p-5 min-h-[120px] border border-gray-100">
              <p className="text-sm text-gray-300 font-medium leading-relaxed italic">
                Menunggu hasil analisis AI...
              </p>
            </div>
          </div>
        </div>
      </section>

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

    </div>
  );
}
