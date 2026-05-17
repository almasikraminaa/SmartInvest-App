import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import AnalysisModal from './components/features/analysis/AnalysisModal';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HomePage from './pages/HomePage';
import MethodPage from './pages/MethodPage';
import AnalysisPage from './pages/AnalysisPage';
import HistoryPage from './pages/HistoryPage';
import RecommendationPage from './pages/RecommendationPage';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [analysisCompleted, setAnalysisCompleted] = useState(true); // preview
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [preSelectedMethod, setPreSelectedMethod] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const handleAnalysisComplete = () => {
    setAnalysisCompleted(true);
    setIsAnalysisModalOpen(false);
  };

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser({
      name: userData.full_name || 'N/A',
      avatar: userData.avatar_url || null,
      email: userData.email || 'user@email.com',
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setAnalysisCompleted(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Layout — tanpa Sidebar */}
        <Route
          path="/login"
          element={
            isLoggedIn ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />
          }
        />
        <Route
          path="/register"
          element={
            isLoggedIn ? <Navigate to="/" replace /> : <RegisterPage />
          }
        />
        <Route
          path="/forgot-password"
          element={
            isLoggedIn ? <Navigate to="/" replace /> : <ForgotPasswordPage />
          }
        />

        {/* Private Layout — dengan Sidebar (Protected) */}
        <Route
          path="/*"
          element={
            isLoggedIn ? (
              <div className="min-h-screen bg-gray-100 font-sans text-gray-900 flex overflow-hidden">
                <Sidebar
                  isOpen={sidebarOpen}
                  onToggle={() => setSidebarOpen(!sidebarOpen)}
                  isLoggedIn={isLoggedIn}
                  user={user}
                  onLoginClick={() => {}}
                  onLogout={handleLogout}
                  onProfileUpdate={(updatedUser) => setUser(updatedUser)}
                />
                <main className={`flex-1 flex flex-col py-10 px-6 overflow-hidden transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
                  <div className="flex-1 w-full overflow-hidden">
                    <Routes>
                      <Route path="/" element={<HomePage setIsAnalysisModalOpen={setIsAnalysisModalOpen} />} />
                      <Route path="/method" element={<MethodPage setIsAnalysisModalOpen={setIsAnalysisModalOpen} setPreSelectedMethod={setPreSelectedMethod} />} />
                      <Route
                        path="/analysis"
                        element={
                          <AnalysisPage
                            analysisCompleted={analysisCompleted}
                            setAnalysisCompleted={setAnalysisCompleted}
                            setIsAnalysisModalOpen={setIsAnalysisModalOpen}
                          />
                        }
                      />
                      <Route path="/history" element={<HistoryPage />} />
                      <Route path="/recommendation" element={<RecommendationPage analysisCompleted={analysisCompleted} setIsAnalysisModalOpen={setIsAnalysisModalOpen} />} />
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
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
