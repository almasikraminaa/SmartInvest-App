// src/pages/AnalysisPage.jsx
import { useState } from 'react';

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex flex-col lg:flex-row gap-6 pb-10">

      {/* KOLOM KIRI: Form Kalkulasi */}
      <aside className="w-full lg:w-1/3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
        <h2 className="text-xl font-bold text-smart-navy mb-1">Calculation</h2>
        <p className="text-gray-500 text-sm mb-6">Configure parameters for analysis</p>

        <form className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Method</label>
            <select className="border border-gray-200 rounded-xl p-3 text-sm text-gray-700 outline-none focus:border-smart-navy focus:ring-1 focus:ring-smart-navy bg-white">
              <option>MVEP (Minimum Variance)</option>
              <option>SIM (Single Index Model)</option>
              <option>CAF (Constant Allocation Fund)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Target Index</label>
            <select className="border border-gray-200 rounded-xl p-3 text-sm text-gray-700 outline-none focus:border-smart-navy focus:ring-1 focus:ring-smart-navy bg-white">
              <option>LQ45</option>
              <option>IDX30</option>
              <option>JII</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Historical Period</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-gray-400 mb-1 block">Start Date</span>
                <input type="date" className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-700 outline-none focus:border-smart-navy" />
              </div>
              <div>
                <span className="text-xs text-gray-400 mb-1 block">End Date</span>
                <input type="date" className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-700 outline-none focus:border-smart-navy" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <label className="text-sm font-medium text-gray-700">Capital Allocation (Modal)</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-500 text-sm font-medium">Rp</span>
              <input type="text" placeholder="200.000" className="w-full border border-gray-200 rounded-xl p-3 pl-10 text-sm text-gray-700 outline-none focus:border-smart-navy font-medium" />
            </div>
            <span className="text-xs text-gray-400">ℹ Format in Rupiah</span>
          </div>

          <button type="button" className="w-full bg-smart-navy text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
            Run Analysis
          </button>
        </form>
      </aside>

      {/* KOLOM KANAN: Dashboard & AI Report */}
      <section className="flex-1 flex flex-col gap-6">

        {/* Top Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-200 pb-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`text-sm pb-2 -mb-[9px] transition-colors ${activeTab === 'dashboard' ? 'font-bold text-smart-navy border-b-2 border-smart-navy' : 'font-medium text-gray-400 hover:text-gray-600'}`}
          >
            📊 Dashboard Overview
          </button>
          <button
            onClick={() => setActiveTab('ai_report')}
            className={`text-sm pb-2 -mb-[9px] transition-colors ${activeTab === 'ai_report' ? 'font-bold text-smart-navy border-b-2 border-smart-navy' : 'font-medium text-gray-400 hover:text-gray-600'}`}
          >
            🤖 AI Executive Report
          </button>
        </div>

        {activeTab === 'dashboard' ? (

          /* TAB 1: DASHBOARD OVERVIEW */
          <div className="flex flex-col gap-6">

            {/* AI Banner Prediction (Empty State) */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex justify-between items-center text-gray-400">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-300 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-500">[ Menunggu Analisis AI... ]</h3>
                  <p className="text-sm font-medium">Input parameter di sebelah kiri untuk memulai</p>
                </div>
              </div>
              <div className="font-bold">Confidence: --%</div>
            </div>

            {/* 6 Stats Grid (Empty State) */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <span className="text-xs text-gray-400 font-semibold mb-2 uppercase flex items-center gap-1">🎯 Metode Terbaik</span>
                <span className="text-2xl font-extrabold text-gray-300">--</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <span className="text-xs text-gray-400 font-semibold mb-2 uppercase flex items-center gap-1">📈 Expected Return</span>
                <span className="text-2xl font-extrabold text-gray-300">--%</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <span className="text-xs text-gray-400 font-semibold mb-2 uppercase flex items-center gap-1">📉 Risk (Volatilitas)</span>
                <span className="text-2xl font-extrabold text-gray-300">--%</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <span className="text-xs text-gray-400 font-semibold mb-2 uppercase flex items-center gap-1">⚖ Sharpe Ratio</span>
                <span className="text-2xl font-extrabold text-gray-300">--</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <span className="text-xs text-gray-400 font-semibold mb-2 uppercase flex items-center gap-1">⚡ Beta</span>
                <span className="text-2xl font-extrabold text-gray-300">--</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <span className="text-xs text-gray-400 font-semibold mb-2 uppercase flex items-center gap-1">🛡 Alpha</span>
                <span className="text-2xl font-extrabold text-gray-300">--%</span>
              </div>
            </div>

            {/* Charts Grid Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                <h3 className="font-bold text-smart-navy mb-4">Return Chart</h3>
                <div className="flex-1 flex items-center justify-center text-gray-300 font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  [ Area Line Chart Return ]
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                <h3 className="font-bold text-smart-navy mb-4">Alokasi Portofolio</h3>
                <div className="flex-1 flex items-center justify-center text-gray-300 font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  [ Area Donut Chart Alokasi ]
                </div>
              </div>
            </div>

          </div>

        ) : (

          /* TAB 2: AI EXECUTIVE REPORT */
          <div className="flex flex-col gap-6">

            {/* 1. Interpretasi Rekomendasi */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-smart-navy mb-4 flex items-center gap-2">
                <span className="text-purple-500">✨</span> Interpretasi Rekomendasi
              </h3>
              <ul className="list-disc list-inside text-gray-400 text-sm space-y-2">
                <li>[ Menunggu Hasil Analisis AI... ]</li>
                <li>[ Menunggu Hasil Analisis AI... ]</li>
              </ul>
            </div>

            {/* 2. Analisis Strategis Eksekutif */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-smart-navy mb-4">Analisis Strategis Eksekutif</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-1">Kondisi Pasar</h4>
                  <p className="text-gray-400 text-sm">[ Menunggu Data Teks AI... ]</p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-1">Evaluasi Kinerja</h4>
                  <p className="text-gray-400 text-sm">[ Menunggu Data Teks AI... ]</p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-1">Rekomendasi Strategis</h4>
                  <p className="text-gray-400 text-sm">[ Menunggu Data Teks AI... ]</p>
                </div>
              </div>
            </div>

            {/* 3. Tabel Rekomendasi Final Action */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
              <h3 className="font-bold text-smart-navy mb-4">Tabel Rekomendasi Final Action</h3>
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">TICKER</th>
                    <th className="px-4 py-3">BOBOT</th>
                    <th className="px-4 py-3">ALOKASI</th>
                    <th className="px-4 py-3">AI PRED</th>
                    <th className="px-4 py-3">CONF.</th>
                    <th className="px-4 py-3">TEKNIKAL (MA)</th>
                    <th className="px-4 py-3">SEKTOR</th>
                    <th className="px-4 py-3 rounded-r-lg">FINAL ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                      [ Menunggu Data Tabel AI... ]
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. Perbandingan Metode */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
              <h3 className="font-bold text-smart-navy mb-4">Perbandingan Metode</h3>
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">METODE</th>
                    <th className="px-4 py-3 text-right">EXPECTED RETURN</th>
                    <th className="px-4 py-3 text-right">RISK (VOLATILITAS)</th>
                    <th className="px-4 py-3 text-right rounded-r-lg">SHARPE RATIO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-400">
                      [ Menunggu Data Komparasi... ]
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 5. Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 flex items-start gap-4">
              <div className="text-yellow-600 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              </div>
              <div>
                <h4 className="font-bold text-yellow-800 mb-1 text-sm">Disclaimer</h4>
                <p className="text-yellow-700 text-sm leading-relaxed">
                  Laporan ini dihasilkan oleh mesin AI berdasarkan pemrosesan data historis dan algoritma kuantitatif. Hasil analisis tidak menjamin kinerja masa depan. Keputusan investasi sepenuhnya berada di tangan Anda. Silakan berkonsultasi dengan penasihat keuangan profesional sebelum mengeksekusi strategi investasi.
                </p>
              </div>
            </div>

          </div>
        )}

      </section>
    </div>
  );
}
