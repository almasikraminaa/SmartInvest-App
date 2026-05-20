// src/App.jsx
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabase.js";
import Sidebar from "./components/layout/Sidebar";
import AnalysisModal from "./components/features/analysis/AnalysisModal";
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
  const [analysisCompleted, setAnalysisCompleted] = useState(false); 
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [preSelectedMethod, setPreSelectedMethod] = useState("");
  const [user, setUser] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [metaForm, setMetaForm] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);

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
    await supabase.auth.signOut();
    setUser(null);
    setAnalysisCompleted(false);
    setAnalysisResult(null);
    setMetaForm(null);
  };

  const formattedUser = user
    ? {
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
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
        <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  const isLoggedIn = !!user;

  // Jika belum login, paksa hanya bisa buka halaman Auth
  if (!isLoggedIn) {
    return (
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  //  YANG BENAR: Tata letak utama ketika user sudah resmi Login
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
        
        <main className={`flex-1 flex flex-col py-10 px-6 overflow-hidden transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
          <div className="flex-1 w-full overflow-hidden">
            <Routes>
              <Route path="/" element={<HomePage setIsAnalysisModalOpen={setIsAnalysisModalOpen} />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/register" element={<Navigate to="/" replace />} />
              <Route path="/forgot-password" element={<Navigate to="/" replace />} />
              
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