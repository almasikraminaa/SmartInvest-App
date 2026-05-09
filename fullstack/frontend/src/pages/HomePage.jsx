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
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

    </div>
  );
}