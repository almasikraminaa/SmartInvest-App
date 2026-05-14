import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import FloatingAIButton from './components/ui/FloatingAIButton';
import AnalysisModal from './components/features/analysis/AnalysisModal';
import HomePage from './pages/HomePage';
import MethodPage from './pages/MethodPage';
import AnalysisPage from './pages/AnalysisPage';
import HistoryPage from './pages/HistoryPage';
import RecommendationPage from './pages/RecommendationPage';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [user, setUser] = useState({ name: 'User', avatar: null });

  const handleAnalysisComplete = () => {
    setAnalysisCompleted(true);
    setIsAnalysisModalOpen(false);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 font-sans text-gray-900 flex">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          isLoggedIn={isLoggedIn}
          user={user}
          onLoginClick={() => setIsLoggedIn(true)}
        />
        <main className={`flex-1 flex flex-col p-8 pt-8 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/method" element={<MethodPage />} />
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
              <Route path="/recommendation" element={<RecommendationPage />} />
            </Routes>
          </div>
        </main>

        {analysisCompleted && (
          <FloatingAIButton onClick={() => setIsAnalysisModalOpen(true)} />
        )}

        <AnalysisModal
          isOpen={isAnalysisModalOpen}
          onClose={() => setIsAnalysisModalOpen(false)}
          onAnalysisComplete={handleAnalysisComplete}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
