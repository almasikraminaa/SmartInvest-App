import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Header';
import HomePage from './pages/HomePage';
import MethodPage from './pages/MethodPage';
import AnalysisPage from './pages/AnalysisPage';
import HistoryPage from './pages/HistoryPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 font-sans text-gray-900 flex">
        <Sidebar />
        <main className="ml-64 flex-1 flex flex-col p-8">
          <Navbar />
          <div className="flex-1 mt-2">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/method" element={<MethodPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/history" element={<HistoryPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
