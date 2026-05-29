import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginUser } from "../services/authService";
import heroVideo from "../assets/videos/bg.mp4";
import { supabase } from "../services/supabaseClient";

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [isGoogleLoading,
    setIsGoogleLoading] =
    useState(false);

  // ======================
  // HANDLE INPUT
  // ======================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  // ======================
  // LOGIN EMAIL
  // ======================
  const handleSubmit =
    async (e) => {
      e.preventDefault();

      if (
        !form.email ||
        !form.password
      ) {
        toast.error(
          "Email dan kata sandi wajib diisi."
        );
        return;
      }

      setIsLoading(true);

      try {
        await loginUser(
          form.email,
          form.password
        );

        toast.success(
          "Login berhasil!"
        );

        navigate("/");
      } catch (error) {
        toast.error(
          error.message
        );
      } finally {
        setIsLoading(false);
      }
    };

  // ======================
  // GOOGLE LOGIN
  // ======================
  const handleGoogleLogin =
    async () => {
      try {
        setIsGoogleLoading(
          true
        );

        const { error } =
          await supabase.auth.signInWithOAuth(
            {
              provider:
                "google",

              options: {
                redirectTo:
                  window.location.origin,
              },
            }
          );

        if (error)
          throw error;
      } catch (error) {
        console.error(
          error
        );

        toast.error(
          "Gagal login dengan Google"
        );

        setIsGoogleLoading(
          false
        );
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
          <source
            src={heroVideo}
            type="video/mp4"
          />
        </video>

        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/70 to-blue-950/40 pointer-events-none" />
      </div>

      {/* Back button */}
      <button
        type="button"
        onClick={() =>
          navigate("/")
        }
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-900/40 hover:bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-full border border-slate-800 transition-all active:scale-95"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line
            x1="19"
            y1="12"
            x2="5"
            y2="12"
          />
          <polyline points="12 19 5 12 12 5" />
        </svg>

        <span>
          Kembali ke Beranda
        </span>
      </button>

      {/* Card */}
      <div className="relative z-10 max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">

        {/* Branding */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3">

            {/* Logo */}
            <div className="w-10 h-10 bg-smart-navy rounded-xl flex items-center justify-center shadow-md shadow-blue-900/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>

            <div className="text-2xl font-black text-slate-950 tracking-tight">
              Smart
              <span className="text-blue-600">
                Invest.
              </span>
            </div>
          </div>

          <h1 className="text-xl font-bold text-slate-900 text-center mt-6">
            Masuk ke Akun Anda
          </h1>

          <p className="text-xs text-slate-400 text-center mt-1.5 mb-2 max-w-[280px] leading-relaxed">
            Kelola dan optimasikan alokasi investasi Anda secara cerdas.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-4 mt-6"
        >

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Email
            </label>

            <input
              type="email"
              name="email"
              autoComplete="email"
              value={
                form.email
              }
              onChange={
                handleChange
              }
              placeholder="nama@email.com"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Kata Sandi
            </label>

            <div className="relative">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                autoComplete="current-password"
                value={
                  form.password
                }
                onChange={
                  handleChange
                }
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-700 outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-colors"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                👁
              </button>
            </div>
          </div>

          {/* Forgot */}
          <div className="flex justify-end text-xs">
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/forgot-password"
                )
              }
              className="text-blue-600 hover:underline"
            >
              Lupa Password?
            </button>
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={
              isLoading
            }
            className="w-full mt-3 bg-blue-900 text-white font-semibold py-3 rounded-lg hover:bg-blue-950 transition-all"
          >
            {isLoading
              ? "Memproses..."
              : "Masuk"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 py-2">
            <div className="h-px bg-gray-200 flex-1" />

            <span className="text-xs text-slate-400">
              atau
            </span>

            <div className="h-px bg-gray-200 flex-1" />
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={
              handleGoogleLogin
            }
            disabled={
              isGoogleLoading
            }
            className="w-full border border-gray-200 bg-white hover:bg-gray-50 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-3 transition-all shadow-sm"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />

            {isGoogleLoading
              ? "Mengarahkan..."
              : "Masuk dengan Google"}
          </button>
        </form>

        {/* Register */}
        <p className="text-xs text-slate-500 text-center mt-6">
          Belum memiliki akun?{" "}
          <button
            type="button"
            onClick={() =>
              navigate(
                "/register"
              )
            }
            className="text-blue-600 hover:underline font-medium"
          >
            Daftar Sekarang
          </button>
        </p>
      </div>
    </div>
  );
}