// src/pages/MethodPage.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function MethodPage({ setIsAnalysisModalOpen, setPreSelectedMethod }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMethod, setExpandedMethod] = useState(null);

  useEffect(() => {
    const hash = location.hash.replace('#', '').toUpperCase();
    if (['MVEP', 'SIM', 'CAPM'].includes(hash)) {
      setExpandedMethod(hash);
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
      problem: "Takut risiko besar saat menyusun portofolio?",
      shortDesc: "MVEP (Mean Variance Efficient Portfolio) — membantu menemukan kombinasi portofolio dengan risiko minimum.",
      concept: "Mengoptimalkan bobot aset untuk meminimalkan risiko pada tingkat return tertentu.",
      howItWorks: "Metode ini mencari titik keseimbangan di mana fluktuasi harga antar saham saling menetralkan secara optimal. Algoritma mencari kombinasi pembobotan aset dengan varians portofolio yang paling minimal.",
      education: {
        definition: "MVEP didefinisikan sebagai portofolio yang memiliki variansi minimum diantara keseluruhan kemungkinan portofolio yang dapat dibentuk.",
        detail: "Jika diasumsikan preferensi investor terhadap risiko adalah risk averse, maka portofolio yang memiliki mean variance efisien adalah portofolio yang memiliki variansi minimum dari mean returnnya.",
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
      problem: "Bingung membaca pergerakan tren pasar?",
      shortDesc: "SIM (Single Index Model) — menganalisis hubungan saham terhadap pergerakan pasar.",
      concept: "Mengukur return masing-masing saham berdasarkan pergerakan pasar (IHSG).",
      howItWorks: "Metode ini membandingkan return ekspektasi saham tunggal dengan return ekspektasi pasar yang diukur menggunakan beta (β). Saham dengan excess return to beta (ERB) tertinggi dimasukkan ke portofolio.",
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
        "Sangat efektif mengidentifikasi saham yang mampu mengalahkan pergerakan pasar.",
        "Lebih ringkas dibandingkan proses kalkulasi korelasi Markowitz yang kompleks."
      ],
      cons: [
        "Sangat bergantung pada kondisi IHSG secara keseluruhan (risiko sistematis).",
        "Volatilitas lebih tinggi dibandingkan portofolio terproteksi."
      ]
    },
    CAPM: {
      title: "Capital Asset Pricing Model (CAPM)",
      problem: "Ingin tahu apakah keuntungan sebanding dengan risiko?",
      shortDesc: "CAPM (Capital Asset Pricing Model) — mengukur hubungan antara risiko saham dan potensi keuntungannya.",
      concept: "Menghubungkan tingkat return yang diharapkan dari suatu aset berisiko dengan risiko dari aset tersebut pada keadaan pasar yang seimbang.",
      howItWorks: "CAPM mengukur hubungan antara risiko sistematis (beta) dan expected return. Model ini membantu menentukan apakah suatu saham memberikan kompensasi yang cukup atas risiko yang ditanggung investor.",
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

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 min-h-[85vh]">
      <div className="flex flex-col gap-8 w-full">

        {/* ── HERO: Narasi Tentang Kami ── */}
        <div className="w-full flex flex-col gap-1">
          {/* Header Judul dengan Decorative Bar */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-smart-navy">
              Tiga Pilar Utama Analisis SmartInvest
            </h1>
            <br />
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-12 bg-smart-navy/30"></div>
              <span className="text-smart-navy/60 uppercase tracking-widest text-xs font-bold">***</span>
              <div className="h-px w-12 bg-smart-navy/30"></div>
            </div>
          
          </div>
         
          <p className="text-600 mb-2 leading-relaxed text-justify">
            Di tengah gempuran informasi pasar modal, SmartInvest hadir sebagai platform investasi berbasis AI yang mempersonalisasi strategi untuk investor pemula. Kami mengubah cara Anda memandang investasi: dari yang semula membingungkan menjadi sebuah perjalanan yang sistematis, modern, dan penuh kendali. Kami memahami tantangan nyata yang sering dihadapi pemula—mulai dari kebingungan dalam menginterpretasikan chart, keraguan dalam menakar risiko, hingga kebimbangan dalam menentukan pemilihan saham yang tepat.
          </p>
          <p className="text-600 mb-2 leading-relaxed text-justify">
            Sering kali, tantangan ini membuat investor pemula hanya menjadi pengikut tren yang berisiko tinggi. SmartInvest hadir untuk memutus rantai tersebut, membantu Anda bertransformasi dari sekadar pengikut tren menjadi investor cerdas yang paham sepenuhnya akan setiap langkah yang Anda ambil.
          </p>
          <p className="text-600 mb-2 leading-relaxed font-medium">
            "SmartInvest membantu mengubah proses tersebut menjadi pengalaman investasi yang lebih mudah dipahami dan lebih nyaman digunakan."
          </p>
          <h3 className="text-lg font-semibold text-smart-navy mt-8">Pilih tantangan terbesarmu di bawah ini:</h3>
        </div>

        {/* ── PROBLEM-DRIVEN CARDS ── */}
        <div className="flex flex-col gap-4 max-w-3xl mx-auto mb-12">
          {Object.keys(methodData).map((key) => {
            const method = methodData[key];
            const isExpanded = expandedMethod === key;
            return (
              <div key={key} className="w-full bg-white border rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
                {/* Card Header (Clickable) */}
                <div
                  onClick={() => setExpandedMethod(isExpanded ? null : key)}
                  className="cursor-pointer p-6 hover:bg-slate-50 transition-colors"
                >
                  <p className="font-bold text-smart-navy text-lg">{method.problem}</p>
                  <p className="text-xs text-400 mt-1">{key} — klik untuk detail</p>
                </div>

                {/* Card Body (Collapsible) */}
                <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6">
                      <p className="text-blue-600 font-medium mb-4 text-sm">{method.shortDesc}</p>

                      {/* Konsep */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4">
                        <p className="text-xs font-bold text-400 uppercase tracking-wide mb-1">Konsep Dasar</p>
                        <p className="text-gray-600 text-sm italic">"{method.concept}"</p>
                      </div>

                      {/* Rumus */}
                      {method.education && (
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4">
                          <p className="text-xs font-bold text-400 uppercase tracking-wide mb-2">📐 Dasar Matematis</p>
                          <p className="text-600 text-xs leading-relaxed mb-2">{method.education.definition}</p>
                          {method.education.formula && (
                            <div className="bg-white rounded-lg px-3 py-2 border border-gray-200 font-mono text-xs text-smart-navy mb-2">
                              <p className="font-semibold">{method.education.formula}</p>
                              {method.education.formulaDesc && <p className="text-gray-400 mt-0.5">{method.education.formulaDesc}</p>}
                            </div>
                          )}
                          {method.education.betaFormula && (
                            <div className="bg-white rounded-lg px-3 py-2 border border-gray-200 font-mono text-xs text-smart-navy mb-2">
                              <p className="font-semibold">{method.education.betaFormula}</p>
                            </div>
                          )}
                          {method.education.expectedReturn && (
                            <div className="bg-white rounded-lg px-3 py-2 border border-gray-200 font-mono text-xs text-smart-navy mb-2">
                              <p className="text-400 text-[10px] mb-0.5">Ekspektasi Return:</p>
                              <p className="font-semibold">{method.education.expectedReturn}</p>
                            </div>
                          )}
                          {method.education.variables && (
                            <div className="mt-2 space-y-1">
                              {method.education.variables.map((v) => (
                                <div key={v.symbol} className="flex items-start gap-2 text-[11px] text-gray-600">
                                  <span className="font-mono font-bold text-smart-navy bg-white px-1 py-0.5 rounded border border-gray-200 shrink-0">{v.symbol}</span>
                                  <span>{v.desc}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Kelebihan & Kekurangan */}
                      <div className="grid grid-cols-1 gap-3 mb-4">
                        <div className="border border-green-100 bg-green-50/50 rounded-xl p-3">
                          <p className="text-xs font-bold text-green-600 mb-2">✓ Kelebihan</p>
                          <ul className="space-y-1">
                            {method.pros.map((pro, i) => (
                              <li key={i} className="text-xs text-600 leading-relaxed">• {pro}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="border border-red-100 bg-red-50/50 rounded-xl p-3">
                          <p className="text-xs font-bold text-red-500 mb-2">✗ Kekurangan</p>
                          <ul className="space-y-1">
                            {method.cons.map((con, i) => (
                              <li key={i} className="text-xs text-600 leading-relaxed">• {con}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Tombol Simulasi */}
                      <button
                        onClick={() => handleSimulate(key)}
                        className="w-full bg-smart-navy text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity mt-2"
                      >
                        Simulasikan Metode Ini
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── FOOTER: Yang Bisa SmartInvest Bantu ── */}
        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
          <h4 className="text-sm font-bold text-500 mb-4 tracking-wider uppercase">YANG BISA SMARTINVEST BANTU</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            {[
              "Menganalisis performa saham",
              "Menghitung risiko dan potensi return",
              "Memprediksi tren pasar",
              "Memperoleh rekomendasi portofolio optimal secara otomatis"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-600">
                <span className="text-green-500 font-bold">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <hr className="border-slate-200 mb-8" />

          <p className="text-600 mb-4 leading-relaxed">
            Setiap analisis dirancang dengan tampilan yang interaktif, intuitif, dan beginner-friendly agar pengguna dapat memahami proses investasi tanpa harus memiliki latar belakang finansial atau data science.
          </p>
          <p className="text-600 mb-4 leading-relaxed font-medium">
            SmartInvest bukan hanya tempat melakukan perhitungan investasi. SmartInvest adalah tempat untuk belajar memahami pasar, mengenali risiko, dan membangun keputusan finansial yang lebih cerdas berbasis data.
          </p>
          <p className="text-500 italic mb-4 leading-relaxed">
            Karena investasi yang baik bukan tentang ikut-ikutan. Investasi yang baik dimulai dari keputusan yang dipahami dengan baik.
          </p>

          <p className="text-xl font-bold text-smart-navy text-center mt-8">
            Analyze smarter. Invest better. Grow confidently. 🚀
          </p>
        </div>

      </div>
    </div>
  );
}
