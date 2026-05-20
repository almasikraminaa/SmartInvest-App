// src/pages/MethodPage.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function MethodPage({ setIsAnalysisModalOpen, setPreSelectedMethod }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeMethod, setActiveMethod] = useState('MVEP');

  // Baca hash dari URL untuk set tab aktif
  useEffect(() => {
    const hash = location.hash.replace('#', '').toUpperCase();
    if (['MVEP', 'SIM', 'CAPM'].includes(hash)) {
      setActiveMethod(hash);
    }
  }, [location.hash]);

  const handleSimulate = (method) => {
    setPreSelectedMethod(method);
    navigate('/analysis');
    setIsAnalysisModalOpen(true);
  };

  const methodData = {
    MVEP: {
      title: "Minimum Variance Efficient Portfolio (MVEP)",
      target: "Cocok untuk: Risiko Rendah - Menengah",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
      ),
      concept: "Mengoptimalkan bobot Aset anda untuk meminimalkan risiko pada tingkat return tertentu.",
      howItWorks: "Metode ini mencari titik keseimbangan di mana fluktuasi harga antar saham saling menetralkan secara optimal. Algoritma mencari kombinasi pembobotan aset dengan varians portofolio yang paling minimal berdasarkan data pergerakan harga historis.",
      education: {
        definition: "MVEP didefinisikan sebagai portofolio yang memiliki variansi minimum diantara keseluruhan kemungkinan portofolio yang dapat dibentuk.",
        detail: "Jika diasumsikan preferensi investor terhadap risiko adalah risk averse (menghindari risiko), maka portofolio yang memiliki mean variance efisien adalah portofolio yang memiliki variansi minimum dari mean returnnya.",
        formula: "Optimalisasi bobot w = [w₁  w₂  ...  wₙ]ᵀ berdasarkan maksimum mean return dari variansi yang diberikan.",
      },
      pros: [
        "Menghasilkan portofolio dengan risiko relatif rendah melalui diversifikasi saham berkorelasi rendah.",
        "Sangat baik untuk menekan risiko saat pasar bergejolak.",
        "Pergerakan nilai portofolio menjadi jauh lebih stabil."
      ],
      cons: [
        "Return mungkin tidak semaksimal metode agresif di kondisi bull market.",
        "Sangat bergantung pada keakuratan data historis."
      ]
    },
    SIM: {
      title: "Single Index Model (SIM)",
      target: "Cocok untuk: Risiko Menengah - Tinggi",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
      ),
      concept: "Mengukur return masing-masing saham berdasarkan pergerakan pasar (IHSG).",
      howItWorks: "Metode ini membandingkan return ekspektasi saham tunggal dengan return ekspektasi pasar yang diukur menggunakan beta (β). Saham dengan excess return to beta (ERB) tertinggi yang dimasukkan ke portofolio sebagai pendorong utama growth.",
      education: {
        definition: "Single Index Model membagi return sekuritas ke dalam dua komponen: komponen return yang unik dan independen terhadap return pasar (αᵢ), dan komponen return yang berhubungan dengan return pasar (βᵢ).",
        formula: "rᵢ = αᵢ + βᵢ * rₘ + eᵢ",
        formulaDesc: "eᵢ ~ NID(0, σ²)",
        expectedReturn: "E(rᵢ) = αᵢ + βᵢ * E(rₘ)",
        variables: [
          { symbol: "rᵢ", desc: "return sekuritas ke-i" },
          { symbol: "αᵢ", desc: "bagian return yang tidak dipengaruhi return pasar" },
          { symbol: "βᵢ", desc: "ukuran kepekaan return terhadap kinerja pasar" },
          { symbol: "rₘ", desc: "return Indeks Pasar" },
          { symbol: "eᵢ", desc: "residual" },
        ],
      },
      pros: [
        "Menghasilkan performa return tertinggi dengan Sharpe Ratio terbaik pada periode simulasi.",
        "Sangat efektif mengidentifikasi saham yang mampu mengalahkan pergerakan pasar (alpha positif).",
        "Lebih ringkas dibandingkan proses kalkulasi korelasi Markowitz yang kompleks."
      ],
      cons: [
        "Sangat bergantung pada kondisi IHSG secara keseluruhan (risiko sistematis).",
        "Volatilitas lebih tinggi dibandingkan portofolio terproteksi."
      ]
    },
    CAPM: {
      title: "Capital Asset Pricing Model (CAPM)",
      target: "Cocok untuk: Analisis Risiko Sistematis",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
      ),
      concept: "Menghubungkan tingkat return yang diharapkan dari suatu aset berisiko dengan risiko dari aset tersebut pada keadaan pasar yang seimbang.",
      howItWorks: "CAPM mengukur hubungan antara risiko sistematis (beta) dan expected return. Model ini membantu menentukan apakah suatu saham memberikan kompensasi yang cukup atas risiko yang ditanggung investor, relatif terhadap return pasar dan risk-free rate.",
      education: {
        definition: "Capital Asset Pricing Model (CAPM) merupakan suatu model yang menghubungkan tingkat return yang diharapkan dari suatu aset berisiko dengan risiko dari aset tersebut pada keadaan pasar yang seimbang.",
        detail: "Konsep CAPM pada umumnya berguna untuk menguantifikasi hubungan antara risiko dan return.",
        formula: "E(rᵢ) = rꜰ + βᵢ * (E(rₘ) - rꜰ)",
        betaFormula: "βᵢ = σᵢₘ / σₘ²",
        variables: [
          { symbol: "rꜰ", desc: "rata-rata return bebas risiko" },
          { symbol: "rᵢ", desc: "return saham" },
          { symbol: "rₘ", desc: "rata-rata return pasar" },
          { symbol: "βᵢ", desc: "ukuran risiko setiap surat berharga" },
        ],
      },
      pros: [
        "Menghasilkan portofolio yang lebih seimbang dengan mempertimbangkan expected return dan risiko sistematis pasar.",
        "Memberikan kerangka teoritis yang kuat untuk menilai apakah saham undervalued atau overvalued.",
        "Cocok untuk analisis defensif di kondisi pasar menurun."
      ],
      cons: [
        "Mengasumsikan pasar efisien sempurna (tidak selalu realistis).",
        "Hanya mempertimbangkan risiko sistematis, mengabaikan risiko spesifik perusahaan."
      ]
    }
  };

  const currentMethod = methodData[activeMethod];

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 min-h-[85vh]">
    <div className="flex flex-col gap-6 pb-10 w-full">

      {/* 1. Header */}
      <div>
        <h1 className="text-2xl font-bold text-smart-navy mb-2">Metode Portofolio</h1>
        <p className="text-gray-500 text-sm">
          Pelajari algoritma dan model matematis di balik rekomendasi SmartInvest.
        </p>
      </div>

      {/* 2. Tab Navigation — melebar rata */}
      <div className="flex w-full border-b border-gray-200 mt-2">
        {['MVEP', 'SIM', 'CAPM'].map((methodKey) => (
          <button
            key={methodKey}
            onClick={() => setActiveMethod(methodKey)}
            className={`flex-1 pb-3 text-sm font-bold text-center transition-all border-b-2 -mb-[2px] ${
              activeMethod === methodKey
                ? 'text-smart-navy border-smart-navy'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            {methodKey}
          </button>
        ))}
      </div>

      {/* 3. Konten Metode (Dibungkus dalam Card Elevated/Menonjol) */}
      <div className="w-full bg-white p-8 rounded-3xl border border-gray-100 shadow-md flex flex-col gap-6 animate-fade-in mt-6 relative overflow-hidden">

        {/* Aksen visual background transparan di pojok card agar tidak terlalu sepi */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-smart-navy opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        {/* Title & Target Area */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-50 text-smart-navy rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
              {currentMethod.icon}
            </div>
            <h2 className="text-2xl font-bold text-smart-navy">{currentMethod.title}</h2>
          </div>
          <div className="bg-gray-50 border border-gray-200 text-gray-600 text-xs font-bold px-4 py-2.5 rounded-xl">
            {currentMethod.target}
          </div>
        </div>

        {/* Konsep & Cara Kerja Area */}
        <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-100 relative z-10">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-smart-navy mb-2">Konsep Dasar</h3>
            <p className="text-gray-600 font-medium italic text-sm">"{currentMethod.concept}"</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-smart-navy mb-2">Cara Kerja Algoritma:</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{currentMethod.howItWorks}</p>
          </div>
        </div>

        {/* Materi Edukasi */}
        {currentMethod.education && (
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 relative z-10">
            <h3 className="text-sm font-bold text-smart-navy mb-3 flex items-center gap-2">
              <span>📐</span> Dasar Matematis
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">{currentMethod.education.definition}</p>
            {currentMethod.education.detail && (
              <p className="text-gray-500 text-sm leading-relaxed mb-3">{currentMethod.education.detail}</p>
            )}
            {currentMethod.education.formula && (
              <div className="bg-white rounded-xl px-4 py-3 border border-gray-200 font-mono text-sm text-smart-navy mb-3">
                <p className="font-semibold">{currentMethod.education.formula}</p>
                {currentMethod.education.formulaDesc && (
                  <p className="text-xs text-gray-400 mt-1">{currentMethod.education.formulaDesc}</p>
                )}
              </div>
            )}
            {currentMethod.education.betaFormula && (
              <div className="bg-white rounded-xl px-4 py-3 border border-gray-200 font-mono text-sm text-smart-navy mb-3">
                <p className="font-semibold">{currentMethod.education.betaFormula}</p>
              </div>
            )}
            {currentMethod.education.expectedReturn && (
              <div className="bg-white rounded-xl px-4 py-3 border border-gray-200 font-mono text-sm text-smart-navy mb-3">
                <p className="text-xs text-gray-400 mb-1">Ekspektasi Return:</p>
                <p className="font-semibold">{currentMethod.education.expectedReturn}</p>
              </div>
            )}
            {currentMethod.education.variables && (
              <div className="mt-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Keterangan Variabel:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {currentMethod.education.variables.map((v) => (
                    <div key={v.symbol} className="flex items-start gap-2 text-xs text-gray-600">
                      <span className="font-mono font-bold text-smart-navy bg-white px-1.5 py-0.5 rounded border border-gray-200 shrink-0">{v.symbol}</span>
                      <span>{v.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Kelebihan & Kekurangan Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full relative z-10">

          {/* Box Kelebihan */}
          <div className="border border-green-100 bg-green-50/50 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-green-600 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16" className="text-green-600"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>
              </div>
              Kelebihan
            </h3>
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-2.5">
              {currentMethod.pros.map((pro, index) => (
                <li key={index} className="leading-relaxed">{pro}</li>
              ))}
            </ul>
          </div>

          {/* Box Kekurangan */}
          <div className="border border-red-100 bg-red-50/50 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-red-500 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              </div>
              Kekurangan
            </h3>
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-2.5">
              {currentMethod.cons.map((con, index) => (
                <li key={index} className="leading-relaxed">{con}</li>
              ))}
            </ul>
          </div>

        </div>

        {/* Action Button */}
        <div className="mt-2 relative z-10 flex justify-end">
          <button onClick={() => handleSimulate(activeMethod)} className="bg-smart-navy text-white px-7 py-3.5 rounded-xl font-bold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
            Simulasikan dengan {activeMethod}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </div>

      </div>
    </div>
    </div>
  );
}
