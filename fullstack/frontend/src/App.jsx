// src/App.jsx
import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { supabase } from "./services/supabaseClient";
import Sidebar from "./components/layout/Sidebar";
import AnalysisModal from "./components/features/analysis/AnalysisModal";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HomePage from "./pages/HomePage";
import MethodPage from "./pages/MethodPage";
import AnalysisPage from "./pages/AnalysisPage";
import HistoryPage from "./pages/HistoryPage";
import RecommendationPage from "./pages/RecommendationPage";
import { Toaster } from "react-hot-toast";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [preSelectedMethod, setPreSelectedMethod] = useState("");
  const [user, setUser] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ══════════════════════════════════════════════════════════════════════════
  // ⚡ SEKSI PERSISTENCE: INISIALISASI STATE UTAMA DARI LOCALSTORAGE ⚡
  // ══════════════════════════════════════════════════════════════════════════
  const [analysisCompleted, setAnalysisCompleted] = useState(() => {
    return localStorage.getItem("smartinvest_analysis_completed") === "true";
  });

  const [analysisResult, setAnalysisResult] = useState(() => {
    const savedResult = localStorage.getItem("smartinvest_analysis_result");
    return savedResult ? JSON.parse(savedResult) : null;
  });

  const [metaForm, setMetaForm] = useState(() => {
    const savedMeta = localStorage.getItem("smartinvest_meta_form");
    return savedMeta ? JSON.parse(savedMeta) : null;
  });

  // ══════════════════════════════════════════════════════════════════════════
  // ⚡ EFFECT: MENGAWASI DAN MENYIMPAN STATE SAAT TERJADI KALKULASI BARU ⚡
  // ══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    localStorage.setItem("smartinvest_analysis_completed", analysisCompleted);

    if (analysisResult) {
      localStorage.setItem(
        "smartinvest_analysis_result",
        JSON.stringify(analysisResult),
      );
    } else {
      localStorage.removeItem("smartinvest_analysis_result");
    }

    if (metaForm) {
      localStorage.setItem("smartinvest_meta_form", JSON.stringify(metaForm));
    } else {
      localStorage.removeItem("smartinvest_meta_form");
    }
  }, [analysisCompleted, analysisResult, metaForm]);

  // Auth Session Handler
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      localStorage.removeItem("smartinvest_analysis_completed");

      localStorage.removeItem("smartinvest_analysis_result");

      localStorage.removeItem("smartinvest_meta_form");

      setAnalysisCompleted(false);

      setAnalysisResult(null);

      setMetaForm(null);

      await supabase.auth.signOut();

      window.location.replace("/login");
    } catch (err) {
      console.error(err);

      setIsLoggingOut(false);
    }
  };

  const formattedUser = user
    ? {
        name:
          user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        avatar: user.user_metadata?.avatar_url || null,
        email: user.email || "user@email.com",
      }
    : null;

  const handleAnalysisComplete = (combinedResult, formParams) => {
    setAnalysisResult(combinedResult);
    setMetaForm(formParams);
    setAnalysisCompleted(true);
    setIsAnalysisModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <svg
          className="animate-spin h-8 w-8 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  const isLoggedIn = !!user;

  if (!isLoggedIn && !isLoggingOut) {
    return (
      <BrowserRouter>
        <Toaster position="top-right" />

        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/login" element={<LoginPage />} />

          <Route path="/register" element={<RegisterPage />} />

          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }
  if (isLoggingOut) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-[9999]">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />

        <h2 className="text-white text-xl font-bold mt-6">Logging out...</h2>

        <p className="text-slate-400 text-sm mt-2">Cleaning your session</p>
      </div>
    );
  }
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-100 font-sans text-gray-900 flex overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          isLoggedIn={isLoggedIn}
          user={formattedUser}
          onLoginClick={() => {}}
          onLogout={handleLogout}
        />

        <main
          className={`flex-1 flex flex-col py-10 px-6 overflow-hidden transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"}`}
        >
          <div className="flex-1 w-full overflow-hidden">
            <Routes>
              <Route
                path="/"
                element={
                  <HomePage setIsAnalysisModalOpen={setIsAnalysisModalOpen} />
                }
              />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/register" element={<Navigate to="/" replace />} />
              <Route
                path="/forgot-password"
                element={<Navigate to="/" replace />}
              />

              <Route
                path="/method"
                element={
                  <MethodPage
                    setIsAnalysisModalOpen={setIsAnalysisModalOpen}
                    setPreSelectedMethod={setPreSelectedMethod}
                  />
                }
              />
              <Route
                path="/analysis"
                element={
                  <AnalysisPage
                    analysisCompleted={analysisCompleted}
                    setIsAnalysisModalOpen={setIsAnalysisModalOpen}
                    result={analysisResult}
                    metaForm={metaForm}
                  />
                }
              />
              <Route path="/history" element={<HistoryPage />} />
              <Route
                path="/recommendation"
                element={
                  <RecommendationPage
                    analysisCompleted={analysisCompleted}
                    setIsAnalysisModalOpen={setIsAnalysisModalOpen}
                    result={analysisResult}
                    metaForm={metaForm}
                  />
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
        {isLoggingOut && (
          <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center animate-fadeIn">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>

              <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
            </div>

            <h2 className="text-white text-xl font-bold mt-6">
              Logging out...
            </h2>

            <p className="text-slate-300 text-sm mt-2">Cleaning your session</p>
          </div>
        )}
        <AnalysisModal
          isOpen={isAnalysisModalOpen}
          onClose={() => setIsAnalysisModalOpen(false)}
          onAnalysisComplete={handleAnalysisComplete}
          preSelectedMethod={preSelectedMethod}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
