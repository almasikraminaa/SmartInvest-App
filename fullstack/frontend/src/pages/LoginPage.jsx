// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginUser } from '../services/authService';
import bgImage from '../assets/images/bg.jpg';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error('Email dan kata sandi wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      await loginUser(form.email, form.password);
      toast.success('Login berhasil!');
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-950 p-4">

      {/* Background */}
      <div className="absolute inset-0 z-0 bg-slate-950 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-35 scale-105 filter blur-[2px]"
        >
          <source src="/src/assets/videos/bg.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/70 to-blue-950/40 pointer-events-none" />
      </div>

      {/* Tombol Kembali ke Beranda (Pojok Kiri Atas) */}
      <button 
        type="button" 
        onClick={() => navigate('/')} 
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-900/40 hover:bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-full border border-slate-800 transition-all active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>Kembali ke Beranda</span>
      </button>

      {/* Card */}
      <div className="relative z-10 max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">

        {/* Branding */}
        <div className="flex flex-col items-center">
          {/* Logo Ikon & Teks Berdampingan */}
          <div className="flex items-center gap-3">
            {/* Logo Ikon  */}
            <div className="w-10 h-10 bg-smart-navy rounded-xl flex items-center justify-center shadow-md shadow-blue-900/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            
            {/* Teks SmartInvest  */}
            <div className="text-2xl font-black text-slate-950 tracking-tight">
              Smart<span className="text-blue-600">Invest.</span>
            </div>
          </div>

          {/* Judul Aksi Form & Deskripsi ( Jarak mt-6 & mb-2) */}
          <h1 className="text-xl font-bold text-slate-900 text-center mt-6">Masuk ke Akun Anda</h1>
          <p className="text-xs text-slate-400 text-center mt-1.5 mb-2 max-w-[280px] leading-relaxed">
            Kelola dan optimasikan alokasi investasi Anda secara cerdas.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="nama@email.com"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Kata Sandi</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-700 outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember & Forgot */}
          <div className="flex justify-between items-center text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
              <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-blue-900 focus:ring-blue-900" />
              Ingat Saya
            </label>
            <button type="button" onClick={() => navigate('/forgot-password')} className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors">Lupa Password?</button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-blue-900 text-white font-semibold py-3 rounded-lg hover:bg-blue-950 transition-all shadow-lg shadow-blue-900/10 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/xl" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <span>Memproses...</span>
              </>
            ) : 'Masuk'}
          </button>
        </form>

        {/* Register link */}
        <p className="text-xs text-slate-500 text-center mt-6">
          Belum memiliki akun?{' '}
          <button type="button" onClick={() => navigate('/register')} className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors">Daftar Sekarang</button>
        </p>

      </div>
    </div>
  );
}