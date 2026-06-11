import React from 'react';
import { Link } from 'react-router-dom';
import heroVideo from '../assets/videos/bg.mp4'; 

export default function LandingPage() {
  return (
    <div className="font-sans text-slate-800 bg-white antialiased selection:bg-blue-900 selection:text-white">
      
      {/* 1. NAVBAR */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
            {/* Ikon di Landing Page */}
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>

            {/* Teks SmartInvest */}
            <div className="text-2xl font-black text-white tracking-tight">
              Smart<span className="text-blue-400">Invest.</span>
            </div>
          </div>
        <Link 
          to="/login"
          className="bg-blue-900 hover:bg-blue-950 text-white px-8 py-2.5 rounded-full font-semibold transition-all duration-300 shadow-lg shadow-blue-900/30"
        >
          Login
        </Link>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-36 pb-28 px-6 lg:pt-40 lg:pb-36 flex items-center min-h-[85vh]">
        
        {/* === AREA PLACEHOLDER BACKGROUND HERO === */}
        {/* === AREA VIDEO BACKGROUND HERO === */}
        <div className="absolute inset-0 bg-slate-900 z-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-screen"
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
        </div>

        {/* Layer Overlay Gradasi untuk Menjaga Keterbacaan Teks Hero */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/70 to-slate-900 z-10"></div>
        {/* ================================== */}

        {/* Konten Hero */}
        <div className="relative z-20 max-w-7xl mx-auto w-full">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-[2px] bg-blue-500"></span>
              <span className="text-blue-300 font-semibold tracking-wide uppercase text-sm">Platform Analisis Kuantitatif</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-8">
              Bangun Portofolio <br className="hidden md:block" /> Saham Optimal <br className="hidden md:block" /> Tanpa Emosi.
            </h1>
            <p className="text-slate-300 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
              Bukan investasi fomo. Kita pakai AI buat pantau pasar, dan MVEP, SIM, CAPM buat racik portofolio idealmu secara otomatis. Dirancang khusus agar mudah dipahami oleh investor pemula hingga menengah.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login" className="bg-blue-900 hover:bg-blue-950 text-white px-8 py-4 rounded-full font-semibold transition-all flex items-center justify-center gap-2">
                Mulai Analisis 
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </Link>
              <a href="#fitur" className="text-white border border-slate-400 hover:border-white hover:bg-white/10 px-8 py-4 rounded-full font-semibold transition-all text-center">
                Pelajari Metode
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SERVICE STRIP */}
      <div className="bg-blue-900 py-4 px-6 overflow-hidden flex whitespace-nowrap">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between md:justify-around text-white font-semibold text-lg md:text-xl gap-8">
          <span className="flex items-center gap-4"><span className="text-3xl text-blue-400">*</span>Berdasarkan Data Historis</span>
          <span className="flex items-center gap-4 hidden sm:flex"><span className="text-3xl text-blue-400">*</span> Rekomendasi Alokasi Dana</span>
          <span className="flex items-center gap-4 hidden md:flex"><span className="text-3xl text-blue-400">*</span> Optimalisasi Portofolio </span>
        </div>
      </div>

      {/* 4. ABOUT US SECTION (Kenapa Kami) */}
      <section className="py-24 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Sisi Kiri: Kolase Card Kenapa Kami */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 relative z-10">
          <div className="bg-blue-900 w-24 h-24 rounded-full absolute -top-8 -left-8 -z-10 opacity-30 blur-2xl"></div>

          {[
            {
              title: "Akurasi Bobot Aset",
              desc: "Menentukan persentase alokasi modal pada tiap emiten secara presisi demi menekan risiko kerugian ekstrem (variance).",
            },
            {
              title: "Bebas Bias Emosional",
              desc: "Keputusan optimasi portofolio murni dihitung secara kuantitatif berdasarkan pergerakan data historis pasar saham riil.",
            },
            {
              title: "Efisiensi Waktu",
              desc: "Tidak perlu lagi menghitung rumus matriks kovarians yang rumit secara manual. Algoritma kami menyelesaikannya secara instan.",
            },
            {
              title: "Proyeksi Terukur",
              desc: "Membantu Anda melihat ekspektasi return dan tingkat risiko sebelum benar-benar mengalokasikan dana di pasar modal.",
            },
          ].map((it, i) => (
            <div
              key={i}
              className="group relative bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/70 shadow-[0_6px_24px_-8px_rgba(2,6,23,.08)] hover:shadow-[0_18px_40px_-12px_rgba(30,58,138,.12)] transition-all duration-300 hover:-translate-y-1.5 overflow-hidden focus-within:ring-2 focus-within:ring-blue-900/30 flex flex-col justify-center"
            >
              {/* Efek Garis Atas (Hover Effect) Disesuaikan dengan Tema Biru */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-900 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <h3 className="font-extrabold text-blue-900 text-base mb-3">
                {it.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">{it.desc}</p>
            </div>
          ))}

          {/* Badge Bulat di Tengah Kolase Smart AI */}
          <div className="hidden sm:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-900 text-white w-24 h-24 rounded-full items-center justify-center text-center font-bold text-xs border-4 border-white shadow-xl z-20 uppercase tracking-wider">
            Smart<br />AI
          </div>
        </div>

        {/* Sisi Kanan: Teks & Statistik */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-slate-400 font-bold tracking-widest uppercase text-sm">// Kenapa Kami?</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
            Kendalikan Risiko, <br/> <span className="text-blue-900">Maksimalkan Akurasi</span>
          </h2>
          <p className="text-slate-500 mb-10 leading-relaxed text-lg">
            SmartInvest hadir sebagai menjembatani tingginya minat investasi Anda dengan analisis data yang objektif. Melalui integrasi teori portofolio modern dan machine learning, kami mengubah data historis pasar yang rumit menjadi rekomendasi alokasi dana yang rasional, transparan, dan mudah dipahami oleh siapa saja.
          </p>
          
          <div className="grid grid-cols-3 gap-6 mb-10 border-b border-slate-200 pb-10">
            <div>
              <h3 className="text-3xl font-black text-blue-900 mb-1">0%</h3>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">Bias Emosional</p>
            </div>
            <div>
              <h3 className="text-3xl font-black text-blue-900 mb-1">3</h3>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">Metode Global</p>
            </div>
            <div>
              <h3 className="text-3xl font-black text-blue-900 mb-1">100%</h3>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">PROSES OTOMATIS</p>
            </div>
          </div>

          <div>
            <p className="font-serif text-2xl font-bold text-slate-800 mb-1 italic">SmartInvest Engine</p>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Quantitative Analysis Team</p>
          </div>
        </div>
      </section>

      {/* 5. SERVICES GRID (Tiga Pilar) */}
      <section id="fitur" className="relative py-24 bg-slate-50 border-t border-gray-100 px-6 overflow-hidden">
        {/* Efek Mesh Lembut dengan sentuhan Biru/Cyan */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-8 left-1/3 w-[360px] h-[360px] rounded-full bg-blue-300/10 blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[420px] h-[420px] rounded-full bg-cyan-300/10 blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header & Action Button */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <span className="text-slate-400 font-bold tracking-widest uppercase text-sm">// Pilar Analisis</span>
              <h2 className="text-4xl font-bold text-slate-900 leading-tight mt-4">
                3 Engine Utama <br/> <span className="text-blue-900">Berstandar Global</span>
              </h2>
            </div>
            <Link to="/login" className="bg-blue-900 hover:bg-blue-950 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-md shadow-blue-900/20">
              Coba Sekarang
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { code: "MVEP", title: "Minimum Variance", idx: "1" },
              { code: "SIM", title: "Single Index Model", idx: "2" },
              { code: "CAPM", title: "Asset Pricing Model", idx: "3" },
            ].map((p) => (
              <div
                key={p.code}
                className="group relative bg-white p-10 rounded-[2rem] border border-gray-100 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-blue-900/10 overflow-hidden"
              >
                {/* Angka Raksasa di Latar Belakang */}
                <span className="absolute -right-4 -top-6 text-[140px] font-black text-slate-200/50 group-hover:text-blue-500/10 transition-colors duration-500 pointer-events-none">
                  {p.idx}
                </span>
                
                <div className="relative z-10">
                  {/* Efek Hover */}
                  <div className="inline-block px-3 py-1 bg-blue-50 border border-blue-100 shadow-sm rounded-lg text-[10px] font-bold text-blue-900 tracking-wider mb-6 transition-colors duration-300 group-hover:bg-blue-900 group-hover:text-white group-hover:border-blue-900">
                    {p.code}
                  </div>
                  
                  <h3 className="text-xl font-black text-blue-900 mb-3 leading-tight">
                    {p.title}
                  </h3>
                  <p className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors duration-300 leading-relaxed">
                    {p.code === "MVEP" &&
                      "Mencari titik kombinasi saham paling aman dengan tingkat korelasi fluktuasi antar aset terendah untuk menjaga modal Anda dari guncangan ekstrem."}
                    {p.code === "SIM" &&
                      "Menghitung korelasi pergerakan return emiten terhadap IHSG secara otomatis, menyederhanakan perhitungan matriks yang rumit menjadi analisis makro yang efisien."}
                    {p.code === "CAPM" &&
                      "Menganalisis kelayakan investasi dengan membandingkan ekspektasi reward terhadap risiko sistematik pasar yang tidak bisa dihindari."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. WORK PROCESS SECTION */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <span className="text-slate-400 font-bold tracking-widest uppercase text-sm">// Cara Kerja Kami</span>
          <h2 className="text-4xl font-bold text-slate-900 mt-4">
            Proses <span className="text-blue-900">Analisis Portofolio</span>
          </h2>
        </div>

        <div className="relative">
          {/* Garis Penghubung Horizontal (Hanya Desktop) */}
          <div className="hidden md:block absolute top-10 left-0 right-0 h-[2px] bg-slate-200 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
            {/* Step 1 */}
            <div className="text-center bg-white">
              <div className="w-20 h-20 mx-auto bg-blue-900 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-900/20 mb-6 relative">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
                <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 border-white">01</div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Konfigurasi Input</h3>
              <p className="text-slate-500 text-sm leading-relaxed px-4">Tentukan modal investasi, periode data, indeks acuan, serta pilih salah satu metode analisis utama Anda.</p>
            </div>

            {/* Step 2 */}
            <div className="text-center bg-white">
              <div className="w-20 h-20 mx-auto bg-blue-900 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-900/20 mb-6 relative">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 border-white">02</div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Analisis & Tren AI</h3>
              <p className="text-slate-500 text-sm leading-relaxed px-4">Sistem menarik data historis sesuai konfigurasi Anda, lalu menggunakan AI untuk mengklasifikasikan tren pergerakan pasar.</p>
            </div>

            {/* Step 3 */}
            <div className="text-center bg-white">
              <div className="w-20 h-20 mx-auto bg-blue-900 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-900/20 mb-6 relative">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>
                <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 border-white">03</div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Optimasi Sistem</h3>
              <p className="text-slate-500 text-sm leading-relaxed px-4">Menghitung portofolio pilihan Anda sekaligus membandingkannya dengan metode lain untuk menemukan racikan yang paling optimal.</p>
            </div>

            {/* Step 4 */}
            <div className="text-center bg-white">
              <div className="w-20 h-20 mx-auto bg-blue-900 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-900/20 mb-6 relative">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 border-white">04</div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Rekomendasi Final</h3>
              <p className="text-slate-500 text-sm leading-relaxed px-4">Dapatkan rekomendasi persentase alokasi dana terbaik beserta perbandingan proyeksi hasil (expected return) yang objektif.</p>
            </div>
          </div>
        </div>
      </section>

      
      {/* 7. FOOTER */}
      <footer className="bg-blue-950 pt-16 pb-8 px-6 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          
          {/* Teks Disclaimer - Font Kecil & Warna Agak Samar (Muted White/Blue) */}
          <p className="text-[10px] sm:text-xs text-blue-200/60 leading-relaxed mb-8 max-w-2xl">
            <strong className="font-semibold text-blue-200/90">Disclaimer: </strong> 
            SmartInvest adalah platform edukasi dan alat bantu pengambilan keputusan berdasarkan data historis. Seluruh hasil analisis bukan merupakan saran finansial mutlak. Investasi saham mengandung risiko.
          </p>

          {/* Tagline Utama - Font Tegas & Biru Muda Cerah */}
          <h3 className="text-sm sm:text-base font-bold text-blue-300 mb-12 tracking-wide drop-shadow-sm">
            "Analisis Lebih Pintar. Investasi Lebih Terarah. Melangkah Lebih Percaya Diri."
          </h3>

          {/* Hak Cipta - Paling Bawah & Paling Samar */}
          <p className="text-[10px] font-black text-blue-200/40 tracking-widest uppercase">
            © {new Date().getFullYear()} SMARTINVEST. HAK CIPTA DILINDUNGI.
          </p>

        </div>
      </footer>

    </div>
  );
}