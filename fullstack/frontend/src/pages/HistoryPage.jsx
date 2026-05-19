import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 10;

export default function HistoryPage() {
  const [historyData, setHistoryData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const filterRef = useRef(null);

  // Filter states
  const [filterIndex, setFilterIndex] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [filterTimeRange, setFilterTimeRange] = useState('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [filterCapital, setFilterCapital] = useState('');
  const [filterCapitalMin, setFilterCapitalMin] = useState('');
  const [filterCapitalMax, setFilterCapitalMax] = useState('');
  const [sortBy, setSortBy] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('investment_histories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedData = data.map((item) => ({
        id: item.id,
        analysisId: `ANLS-${item.id.toString().slice(0, 6).toUpperCase()}`,
        date: item.created_at,
        target: item.target_index || 'LQ45',
        method: item.method || 'MVEP',
        capital: Number(item.capital || 0),
        return: item.expected_return,
        risk: item.risk,
        // ⚡ MEMBACA KOLOM BARU DARI SUPABASE SECARA AKURAT ⚡
        bi_rate: item.bi_rate != null ? item.bi_rate : 5.8,
        sharpe: item.sharpe_ratio,
        sentiment: item.market_sentiment || 'Sideways'
      }));

      setHistoryData(mappedData);
    } catch (err) {
      console.error('Failed to fetch history from Supabase:', err);
      toast.error('Gagal memuat riwayat analisis.');
    } finally {
      setIsLoading(false);
    }
  };

  // Close filter panel on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilterPanel(false);
    }
    if (showFilterPanel) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterPanel]);

  useEffect(() => { 
    setCurrentPage(1); 
  }, [searchQuery, filterIndex, filterMethod, filterTimeRange, filterDateStart, filterDateEnd, filterCapital, filterCapitalMin, filterCapitalMax, sortBy]);

  const getDateThreshold = (range) => {
    const now = new Date();
    if (range === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (range === '7days') { const d = new Date(); d.setDate(d.getDate() - 7); return d; }
    if (range === '30days') { const d = new Date(); d.setDate(d.getDate() - 30); return d; }
    return null;
  };

  const filteredData = historyData
    .filter((item) => {
      const matchesSearch = searchQuery === '' ||
        item.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.analysisId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesIndex = filterIndex === '' || item.target === filterIndex;
      const matchesMethod = filterMethod === '' || item.method === filterMethod;
      
      let matchesTime = true;
      if (filterTimeRange === 'custom') {
        if (filterDateStart) matchesTime = matchesTime && item.date >= filterDateStart;
        if (filterDateEnd) matchesTime = matchesTime && item.date <= filterDateEnd;
      } else if (filterTimeRange) {
        const threshold = getDateThreshold(filterTimeRange);
        if (threshold) matchesTime = new Date(item.date) >= threshold;
      }

      let matchesCapital = true;
      if (filterCapital === 'micro') matchesCapital = item.capital < 5000000;
      else if (filterCapital === 'medium') matchesCapital = item.capital >= 5000000 && item.capital <= 25000000;
      else if (filterCapital === 'large') matchesCapital = item.capital > 25000000;
      return matchesSearch && matchesIndex && matchesMethod && matchesTime && matchesCapital;
    })
    .sort((a, b) => {
      if (sortBy === 'return-desc') return parseFloat(b.return) - parseFloat(a.return);
      if (sortBy === 'risk-asc') return parseFloat(a.risk) - parseFloat(b.risk);
      return new Date(b.date) - new Date(a.date);
    });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSelectAll = (e) => { if (e.target.checked) setSelectedRows(paginatedData.map(i => i.id)); else setSelectedRows([]); };
  const handleSelectRow = (id) => { if (selectedRows.includes(id)) setSelectedRows(selectedRows.filter(r => r !== id)); else setSelectedRows([...selectedRows, id]); };

  const handleDeleteConfirm = async () => {
    try {
      const { error } = await supabase.from('investment_histories').delete().in('id', selectedRows);
      if (error) throw error;
      setHistoryData(historyData.filter(item => !selectedRows.includes(item.id)));
      toast.success('Riwayat terpilih berhasil dihapus.');
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghapus data.');
    }
    setSelectedRows([]);
    setIsDeleteOpen(false);
  };

  const fmtPersen = (val) => {
    if (val == null) return "N/A";
    if (Math.abs(val) > 1) return Number(val).toFixed(2) + "%";
    return (val * 100).toFixed(2) + "%";
  };
  const fmtNum = (val) => (val != null ? Number(val).toFixed(2) : "N/A");
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const formatCurrency = (num) => 'Rp ' + num.toLocaleString('id-ID');

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 min-h-[85vh] overflow-hidden">
      {isLoading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <svg className="animate-spin h-7 w-7 text-smart-navy" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : (
        <div className="flex flex-col gap-6 pb-10 w-full">
          <div>
            <h1 className="text-2xl font-bold text-smart-navy mb-2">Analysis History</h1>
            <p className="text-gray-500 text-sm font-medium">Review and track your previous portfolio optimizations</p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search history..." className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-11 pr-4 text-sm text-gray-700 outline-none focus:border-smart-navy shadow-sm" />
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={() => setIsPrivate(!isPrivate)} className={`border px-3 py-2.5 rounded-xl text-sm transition-colors shadow-sm ${isPrivate ? 'bg-smart-navy border-smart-navy text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </button>
              <button onClick={() => { if (selectedRows.length > 0) setIsDeleteOpen(true); }} disabled={selectedRows.length === 0} className="bg-white border border-red-200 text-red-500 px-3 py-2.5 rounded-xl text-sm hover:bg-red-50 transition-colors shadow-sm disabled:opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
              
              <div className="w-px h-8 bg-gray-200 mx-1"></div>
              
              <div className="relative" ref={filterRef}>
                <button onClick={() => setShowFilterPanel(!showFilterPanel)} className="bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 text-gray-600 transition-colors flex items-center gap-2 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                  Filter Panel
                </button>
                {showFilterPanel && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 w-80 p-5 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Target Index</p>
                      <div className="flex flex-wrap gap-2">
                        {['', 'LQ45', 'IDX30'].map((val) => (
                          <button key={val} onClick={() => setFilterIndex(val)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${filterIndex === val ? 'bg-smart-navy text-white' : 'bg-gray-100 text-gray-600'}`}>{val || 'Semua'}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Metode</p>
                      <div className="flex flex-wrap gap-2">
                        {['', 'MVEP', 'SIM', 'CAPM'].map((val) => (
                          <button key={val} onClick={() => setFilterMethod(val)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${filterMethod === val ? 'bg-smart-navy text-white' : 'bg-gray-100 text-gray-600'}`}>{val || 'Semua'}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {selectedRows.length > 0 && <div className="text-xs text-smart-navy font-bold bg-blue-50 px-4 py-2 rounded-xl self-start">{selectedRows.length} item dipilih</div>}

          {/* Table Element */}
          <div className="rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap min-w-[1050px]">
                <thead className="bg-gray-50/80 text-gray-500 uppercase text-xs font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 w-12"><input type="checkbox" onChange={handleSelectAll} checked={selectedRows.length === paginatedData.length && paginatedData.length > 0} className="w-4 h-4 cursor-pointer" /></th>
                    <th className="px-6 py-4">Analysis ID</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Target Index</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Modal Kerja</th>
                    <th className="px-6 py-4">Expected Return</th>
                    <th className="px-6 py-4">Risk</th>
                    {/* BERIKUT ADALAH KOLOM DINAMIS TERBARU */}
                    <th className="px-6 py-4">Sharpe Ratio</th>
                    <th className="px-6 py-4">BI Rate</th>
                    <th className="px-6 py-4">Sentiment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-600">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr key={item.id} className={`transition-colors ${selectedRows.includes(item.id) ? 'bg-blue-50/30' : 'hover:bg-gray-50/40'}`}>
                        <td className="px-6 py-4"><input type="checkbox" checked={selectedRows.includes(item.id)} onChange={() => handleSelectRow(item.id)} className="w-4 h-4 cursor-pointer" /></td>
                        <td className="px-6 py-4 font-mono text-gray-400 text-xs">{item.analysisId}</td>
                        <td className="px-6 py-4 text-gray-500">{formatDate(item.date)}</td>
                        <td className="px-6 py-4"><span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold">{item.target}</span></td>
                        <td className="px-6 py-4 text-smart-navy font-bold">{item.method}</td>
                        <td className="px-6 py-4 font-semibold">{isPrivate ? <span className="text-gray-300">Rp •••••••</span> : formatCurrency(item.capital)}</td>
                        <td className="px-6 py-4 font-bold text-emerald-600">{fmtPersen(item.return)}</td>
                        <td className="px-6 py-4 font-bold text-rose-500">{fmtPersen(item.risk)}</td>
                        {/* RENDERING DATA DARI KOLOM BARU */}
                        <td className="px-6 py-4 text-gray-700 font-bold">{fmtNum(item.sharpe)}</td>
                        <td className="px-6 py-4 text-gray-400 font-bold">{item.bi_rate}%</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.sentiment === "Bullish" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                          }`}>{item.sentiment}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="11" className="text-center py-12 text-gray-400 text-xs">Tidak ada data riwayat optimasi portofolio.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-smart-navy/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl flex flex-col items-center text-center">
            <h3 className="text-lg font-bold text-smart-navy mb-2">Hapus Riwayat Analisis?</h3>
            <p className="text-sm text-gray-400 mb-6">Apakah Anda yakin ingin menghapus {selectedRows.length} item riwayat analisis?</p>
            <div className="flex justify-end gap-3 w-full">
              <button onClick={() => setIsDeleteOpen(false)} className="flex-1 bg-gray-100 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-bold">Batal</button>
              <button onClick={handleDeleteConfirm} className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">Hapus Permanen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}