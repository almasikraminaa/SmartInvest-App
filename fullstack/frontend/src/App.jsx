import { useState } from 'react';
import Sidebar from './components/SideBar';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MethodPage from './pages/MethodPage';
import AnalysisPage from './pages/AnalysisPage';
import HistoryPage from './pages/HistoryPage';

function App() {
  const [activePage, setActivePage] = useState('home');

  const renderPage = () => {
    switch (activePage) {
      case 'method':   return <MethodPage />;
      case 'analysis': return <AnalysisPage />;
      case 'history':  return <HistoryPage />;
      default:         return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900 flex">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="ml-64 flex-1 p-8">
        <Navbar />
        <div className="flex-1 mt-2">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;
