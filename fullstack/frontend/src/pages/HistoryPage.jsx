// src/pages/HistoryPage.jsx
import { useState, useRef, useEffect } from 'react';

// Data simulasi sementara (15 data) — hapus nanti setelah integrasi database
const INITIAL_DATA = [];

const ITEMS_PER_PAGE = 10;

export default function HistoryPage() {
  const [historyData, setHistoryData] = useState(INITIAL_DATA);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const filterRef = useRef(null);

  // Fetch history dari API saat mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistoryData(data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Close filter panel on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilterPanel(false);
    }
    if (showFilterPanel) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterPanel]);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterIndex, filterMethod, filterTimeRange, filterDateStart, filterDateEnd, filterCapital, filterCapitalMin, filterCapitalMax, sortBy]);

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
        item.date.includes(searchQuery) ||
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
      else if (filterCapital === 'custom') {
        if (filterCapitalMin) matchesCapital = matchesCapital && item.capital >= Number(filterCapitalMin);
        if (filterCapitalMax) matchesCapital = matchesCapital && item.capital <= Number(filterCapitalMax);
      }
      return matchesSearch && matchesIndex && matchesMethod && matchesTime && matchesCapital;
    })
    .sort((a, b) => {
      if (sortBy === 'return-desc') return parseFloat(b.return) - parseFloat(a.return);
      if (sortBy === 'return-asc') return parseFloat(a.return) - parseFloat(b.return);
      if (sortBy === 'risk-asc') return parseFloat(a.risk) - parseFloat(b.risk);
      if (sortBy === 'risk-desc') return parseFloat(b.risk) - parseFloat(a.risk);
      if (sortBy === 'capital-desc') return b.capital - a.capital;
      if (sortBy === 'capital-asc') return a.capital - b.capital;
      return new Date(b.date) - new Date(a.date);
    });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const activeFilterCount = [filterIndex, filterMethod, filterTimeRange, filterCapital, sortBy].filter(Boolean).length;

  const handleSelectAll = (e) => { if (e.target.checked) setSelectedRows(paginatedData.map(i => i.id)); else setSelectedRows([]); };
  const handleSelectRow = (id) => { if (selectedRows.includes(id)) setSelectedRows(selectedRows.filter(r => r !== id)); else setSelectedRows([...selectedRows, id]); };

  const handleDeleteConfirm = async () => {
    try {
      const res = await fetch('/api/history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedRows }),
      });
      if (res.ok) {
        setHistoryData(historyData.filter(item => !selectedRows.includes(item.id)));
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    }
    setSelectedRows([]);
    setIsDeleteOpen(false);
  };

  const handleResetFilters = () => {
    setFilterIndex(''); setFilterMethod(''); setFilterTimeRange('');
    setFilterDateStart(''); setFilterDateEnd(''); setFilterCapital('');
    setFilterCapitalMin(''); setFilterCapitalMax(''); setSortBy('');
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatCurrency = (num) => 'Rp ' + num.toLocaleString('id-ID');


  return (
    <div className="bg-white rounded-xl shadow-sm p-6 min-h-[85vh] overflow-hidden">
    <div className="flex flex-col gap-6 pb-10 w-full">
      {/* Header */}
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
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by target, method, or date..." className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-11 pr-4 text-sm text-gray-700 outline-none focus:border-smart-navy shadow-sm" />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsPrivate(!isPrivate)} className={`border px-3 py-2.5 rounded-xl text-sm transition-colors shadow-sm ${isPrivate ? 'bg-smart-navy border-smart-navy text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`} title={isPrivate ? 'Mode Privasi Aktif' : 'Aktifkan Mode Privasi'}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </button>
          <button onClick={() => { if (selectedRows.length > 0) setIsDeleteOpen(true); }} disabled={selectedRows.length === 0} className="bg-white border border-red-200 text-red-500 px-3 py-2.5 rounded-xl text-sm hover:bg-red-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" title="Delete Selected">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
          <div className="w-px h-8 bg-gray-200 mx-1"></div>
          <div className="relative" ref={filterRef}>
            <button onClick={() => setShowFilterPanel(!showFilterPanel)} className={`bg-white border px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm ${activeFilterCount > 0 ? 'border-smart-navy text-smart-navy' : 'border-gray-200 text-gray-600'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filter
              {activeFilterCount > 0 && <span className="bg-smart-navy text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{activeFilterCount}</span>}
            </button>
            {showFilterPanel && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 w-80 p-5 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
                {/* Target Index */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Target Index</p>
                  <div className="flex flex-wrap gap-2">
                    {['', 'LQ45', 'IDX30', 'JII'].map((val) => (
                      <button key={val} onClick={() => setFilterIndex(val)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filterIndex === val ? 'bg-smart-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{val || 'Semua'}</button>
                    ))}
                  </div>
                </div>
                {/* Method */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Metode</p>
                  <div className="flex flex-wrap gap-2">
                    {['', 'MVEP', 'SIM', 'CAF'].map((val) => (
                      <button key={val} onClick={() => setFilterMethod(val)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filterMethod === val ? 'bg-smart-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{val || 'Semua'}</button>
                    ))}
                  </div>
                </div>
                {/* Time Range */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Rentang Waktu</p>
                  <div className="flex flex-wrap gap-2">
                    {[{val:'',label:'Semua'},{val:'today',label:'Hari Ini'},{val:'7days',label:'7 Hari'},{val:'30days',label:'30 Hari'},{val:'custom',label:'Kustom'}].map(({val,label}) => (
                      <button key={val} onClick={() => setFilterTimeRange(val)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filterTimeRange === val ? 'bg-smart-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{label}</button>
                    ))}
                  </div>
                  {filterTimeRange === 'custom' && (
                    <div className="flex gap-2 mt-3">
                      <input type="date" value={filterDateStart} onChange={(e) => setFilterDateStart(e.target.value)} className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 outline-none" />
                      <span className="text-gray-400 text-xs self-center">—</span>
                      <input type="date" value={filterDateEnd} onChange={(e) => setFilterDateEnd(e.target.value)} className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 outline-none" />
                    </div>
                  )}
                </div>
                {/* Capital Range */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Skala Modal</p>
                  <div className="flex flex-wrap gap-2">
                    {[{val:'',label:'Semua'},{val:'micro',label:'< Rp5 Jt'},{val:'medium',label:'Rp5-25 Jt'},{val:'large',label:'> Rp25 Jt'},{val:'custom',label:'Kustom'}].map(({val,label}) => (
                      <button key={val} onClick={() => setFilterCapital(val)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filterCapital === val ? 'bg-smart-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{label}</button>
                    ))}
                  </div>
                  {filterCapital === 'custom' && (
                    <div className="flex gap-2 mt-3">
                      <input type="number" value={filterCapitalMin} onChange={(e) => setFilterCapitalMin(e.target.value)} placeholder="Min (Rp)" className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 outline-none" />
                      <span className="text-gray-400 text-xs self-center">—</span>
                      <input type="number" value={filterCapitalMax} onChange={(e) => setFilterCapitalMax(e.target.value)} placeholder="Max (Rp)" className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 outline-none" />
                    </div>
                  )}
                </div>
                {/* Sorting */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Urutkan</p>
                  <div className="flex flex-wrap gap-2">
                    {[{val:'',label:'Terbaru'},{val:'return-desc',label:'Return ↓'},{val:'return-asc',label:'Return ↑'},{val:'risk-asc',label:'Risk ↑'},{val:'risk-desc',label:'Risk ↓'},{val:'capital-desc',label:'Modal ↓'},{val:'capital-asc',label:'Modal ↑'}].map(({val,label}) => (
                      <button key={val} onClick={() => setSortBy(val)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${sortBy === val ? 'bg-smart-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{label}</button>
                    ))}
                  </div>
                </div>
                <button onClick={handleResetFilters} className="text-xs text-red-500 font-bold hover:underline self-start">Reset Semua Filter</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected info */}
      {selectedRows.length > 0 && <div className="text-xs text-smart-navy font-medium bg-blue-50 px-4 py-2 rounded-lg">{selectedRows.length} item dipilih</div>}


      {/* Table */}
      <div className="rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[900px]">
            <thead className="bg-gray-50/80 text-gray-500 uppercase text-xs font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-12"><input type="checkbox" onChange={handleSelectAll} checked={selectedRows.length === paginatedData.length && paginatedData.length > 0} className="w-4 h-4 text-smart-navy bg-gray-100 border-gray-300 rounded focus:ring-smart-navy cursor-pointer" /></th>
                <th className="px-6 py-4">Analysis ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Target Index</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Modal</th>
                <th className="px-6 py-4">Expected Return</th>
                <th className="px-6 py-4">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <tr key={item.id} className={`transition-colors ${selectedRows.includes(item.id) ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'}`}>
                    <td className="px-6 py-4"><input type="checkbox" checked={selectedRows.includes(item.id)} onChange={() => handleSelectRow(item.id)} className="w-4 h-4 text-smart-navy bg-gray-100 border-gray-300 rounded focus:ring-smart-navy cursor-pointer" /></td>
                    <td className="px-6 py-4 font-mono font-semibold text-gray-500">{item.analysisId}</td>
                    <td className="px-6 py-4 font-medium text-gray-700">{formatDate(item.date)}</td>
                    <td className="px-6 py-4"><span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold">{item.target}</span></td>
                    <td className="px-6 py-4 font-semibold text-smart-navy">{item.method}</td>
                    <td className="px-6 py-4 font-semibold text-gray-700">{isPrivate ? <span className="text-gray-400">Rp •••••••</span> : formatCurrency(item.capital)}</td>
                    <td className="px-6 py-4 font-bold text-green-600">{item.return}</td>
                    <td className="px-6 py-4 font-bold text-red-500">{item.risk}</td>
                  </tr>
                ))
              ) : (
                <tr className="text-gray-300">
                  <td className="px-6 py-4"><input type="checkbox" disabled className="w-4 h-4 bg-gray-100 border-gray-200 rounded opacity-50" /></td>
                  <td className="px-6 py-4 font-mono">-</td><td className="px-6 py-4">-</td><td className="px-6 py-4">-</td><td className="px-6 py-4">-</td><td className="px-6 py-4">-</td><td className="px-6 py-4">-</td><td className="px-6 py-4">-</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} dari {filteredData.length} data</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">← Sebelumnya</button>
              <span className="text-xs font-bold text-smart-navy px-3">{currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Selanjutnya →</button>
            </div>
          </div>
        )}
      </div>

      {/* Privacy banner */}
      {isPrivate && (
        <div className="text-xs text-yellow-700 font-medium bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-lg flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Mode Privasi aktif — data nominal modal disembunyikan
        </div>
      )}

      {/* Empty states */}
      {filteredData.length === 0 && historyData.length > 0 && <p className="text-center text-gray-400 text-xs">Tidak ada hasil yang cocok dengan pencarian atau filter Anda.</p>}
      {historyData.length === 0 && <p className="text-center text-gray-400 text-xs">Belum ada riwayat analisis. Lakukan analisis pertama Anda untuk melihat data di sini.</p>}

      {/* Custom Delete Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6 shadow-2xl flex flex-col items-center text-center">
            {/* Icon */}
            <div className="bg-red-50 text-red-600 p-3 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </div>
            {/* Title */}
            <h3 className="text-lg font-bold text-slate-900 mb-2">Hapus Riwayat Analisis?</h3>
            {/* Description */}
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Apakah Anda yakin ingin menghapus <span className="font-bold text-slate-700">{selectedRows.length}</span> riwayat analisis yang dipilih? Tindakan ini tidak dapat dibatalkan.
            </p>
            {/* Buttons */}
            <div className="flex justify-end gap-3 w-full">
              <button onClick={() => setIsDeleteOpen(false)} className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">Batal</button>
              <button onClick={handleDeleteConfirm} className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">Hapus Permanen</button>
            </div>
          </div>
        </div>
      )}

    </div>
    </div>
  );
}
