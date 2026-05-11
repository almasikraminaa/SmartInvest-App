// src/pages/HomePage.jsx

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      
      {/*  highlights */}
      <section className="bg-smart-navy rounded-3xl p-10 text-white shadow-md relative overflow-hidden">
        {/* Aksen kilau transparan di background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-extrabold mb-4 leading-tight tracking-tight">
            Smart Allocation for <br />
            <span className="text-smart-green">Maximum Returns</span>
          </h1>
          
          <p className="text-gray-300 text-sm leading-relaxed mb-8 max-w-xl">
            Leverage the power of the Minimum Variance Efficient Portfolio (MVEP) method to build a robust, data-driven investment strategy tailored for the Indonesian stock market.
          </p>
          
          <div className="flex items-center gap-4">
            {/* Tombol Start Analysis (Hijau) */}
            <button className="bg-smart-green text-white px-7 py-3 rounded-xl font-bold text-sm hover:bg-[#00b86a] transition-colors flex items-center gap-2">
              Start Analysis
              {/* Ikon Panah */}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </button>
            
            {/* Tombol Learn Our Method (Transparan/Outline) */}
            <button className="bg-white/10 text-white px-7 py-3 rounded-xl font-bold text-sm hover:bg-white/20 transition-colors border border-white/10 backdrop-blur-sm">
              Learn Our Method
            </button>
          </div>
        </div>
      </section>

      {/* 2. Area Grid untuk Chart dan Stock Highlight (Kerangka Dasar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Tempat Chart IHSG (Nanti diganti komponen sungguhan) */}
         <div className="col-span-2 bg-white min-h-[320px] rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center justify-center text-gray-400">
            [ Area Chart IHSG ]
         </div>
         
         {/* Tempat Stock Highlights */}
         <div className="bg-white min-h-[320px] rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center justify-center text-gray-400">
            [ Area Stock Highlights ]
         </div>
      </div>

{/* 3. SECTION BARU: About Us */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row gap-8 items-center justify-between mt-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-smart-navy mb-2">About Us</h2>
          <p className="text-gray-500 text-sm font-medium mb-4">Revolusi Teknologi Keuangan untuk Generasi Muda.</p>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            SmartInvest hadir untuk menjembatani tingginya minat investasi saham dengan analisis berbasis data yang solid. Kami menggabungkan teori portofolio kuantitatif (seperti MVEP) dengan Kecerdasan Buatan (AI) untuk membantu Anda mengambil keputusan finansial yang rasional dan terukur, bukan sekadar spekulasi.
          </p>
          <button className="bg-smart-navy text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
            Baca Selengkapnya...
          </button>
        </div>
        {/* Placeholder Gambar Kucing/Logo di Kanan */}
        <div className="w-full md:w-[40%] aspect-video bg-[#2A2D34] rounded-xl flex items-center justify-center overflow-hidden">
          {/* Kamu bisa ganti dengan <img> sungguhan nanti */}
          <span className="text-white opacity-50 text-sm font-medium">[ Area Gambar / Logo ]</span>
        </div>
      </section>

      {/* 4. SECTION BARU: 3 Methods Card */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        
        {/* Card 1: MVEP */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
          </div>
          <h3 className="text-lg font-bold text-smart-navy mb-3">MVEP</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Minimum Variance Efficient Portfolio: Mengoptimalkan bobot aset Anda untuk meminimalkan risiko pada tingkat return tertentu.
          </p>
        </div>

        {/* Card 2: SIM */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-green-50 text-smart-green rounded-2xl flex items-center justify-center mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          </div>
          <h3 className="text-lg font-bold text-smart-navy mb-3">SIM</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Single Index Model: Mengukur risiko dan return saham berdasarkan pergerakan pasar secara keseluruhan untuk mendapatkan portofolio optimal.
          </p>
        </div>

        {/* Card 3: CAF */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <h3 className="text-lg font-bold text-smart-navy mb-3">CAF</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Constant Allocation Fund: Memfokuskan pembagian dana secara konstan pada aset untuk menjaga profil keseimbangan risiko secara otomatis.
          </p>
        </div>

      </section>

    </div>
  );
}