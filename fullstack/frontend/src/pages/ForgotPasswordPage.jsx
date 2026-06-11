// src/pages/ForgotPasswordPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/images/bg.jpg';
import heroVideo from '../assets/videos/bg.mp4'; 

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Alamat email wajib diisi.');
      return;
    }

    setIsLoading(true);
    // Mock 
    // const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    //   redirectTo: 'http://localhost:3000/update-password',
    // })
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-950 p-4">
      {/* Background Cinematic */}
      <div className="absolute inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-30 scale-105 filter blur-[2px]">
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/70 to-blue-950/40" />
      </div>

      <div className="relative z-10 max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
        {/* Branding Konsisten */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-smart-navy rounded-xl flex items-center justify-center shadow-md shadow-blue-900/10">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <div className="text-2xl font-black text-slate-950 tracking-tight">Smart<span className="text-blue-600">Invest.</span></div>
          </div>
          <h1 className="text-xl font-bold text-slate-900 text-center">Pulihkan Kata Sandi</h1>
          <p className="text-xs text-slate-400 text-center mt-2">Masukkan email Anda, kami akan mengirimkan instruksi pemulihan.</p>
        </div>

        {!isSent ? (
          /* Form State */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Alamat Email</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Error */}
            {error && <p className="text-xs text-red-500 font-medium bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-blue-900 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-950 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                  Mengirim...
                </>
              ) : 'Kirim Link Pemulihan'}
            </button>
          </form>
        ) : (
          /* Success State */
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Email Terkirim!</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Kami telah mengirimkan link pemulihan ke <span className="font-semibold text-slate-700">{email}</span>. Silakan cek kotak masuk atau folder spam Anda.
            </p>
          </div>
        )}

        {/* Footer link */}
        <p className="text-xs text-slate-500 text-center mt-6">
          <button type="button" onClick={() => navigate('/login')} className="text-blue-600 hover:underline font-medium">
            ← Kembali ke Halaman Masuk
          </button>
        </p>

      </div>
    </div>
  );
}
