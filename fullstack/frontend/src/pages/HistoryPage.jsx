import { useState, useRef, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import toast from "react-hot-toast";
import AnalysisPage from "./AnalysisPage";

const ITEMS_PER_PAGE = 10;

export default function HistoryPage() {
  const [historyData, setHistoryData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const filterRef = useRef(null);

  const [activeAnalysis, setActiveAnalysis] = useState(null);

  const [filterIndex, setFilterIndex] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [filterCapital, setFilterCapital] = useState("");

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("investment_histories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mappedData = data.map((item) => ({
        id: item.id,
        analysisId: `ANLS-${item.id.toString().slice(0, 6).toUpperCase()}`,

        date: item.created_at,
        target: item.target_index || "LQ45",
        method: item.method || "MVEP",

        capital: Number(item.capital || 0),
        return: item.expected_return,
        risk: item.risk,

        bi_rate: item.bi_rate != null ? item.bi_rate : 5.8,

        sharpe: item.sharpe_ratio,
        sentiment: item.market_sentiment || "Sideways",

        portfolio_allocation: item.portfolio_allocation,

        ai_interpretation: item.ai_interpretation,

        start_date: item.start_date,
        end_date: item.end_date,

        // ⭐ NEW
        analysis_form: item.analysis_form,

        analysis_result: item.analysis_result,
      }));

      setHistoryData(mappedData);
    } catch (err) {
      console.error("Failed to fetch history from Supabase:", err);
      toast.error("Gagal memuat riwayat analisis.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target))
        setShowFilterPanel(false);
    }
    if (showFilterPanel)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilterPanel]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterIndex, filterMethod, filterCapital]);

  const filteredData = historyData.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.analysisId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndex = filterIndex === "" || item.target === filterIndex;
    const matchesMethod = filterMethod === "" || item.method === filterMethod;

    let matchesCapital = true;
    if (filterCapital === "micro") matchesCapital = item.capital < 5000000;
    else if (filterCapital === "medium")
      matchesCapital = item.capital >= 5000000 && item.capital <= 25000000;
    else if (filterCapital === "large")
      matchesCapital = item.capital > 25000000;

    return matchesSearch && matchesIndex && matchesMethod && matchesCapital;
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedRows(paginatedData.map((i) => i.id));
    else setSelectedRows([]);
  };

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id))
      setSelectedRows(selectedRows.filter((r) => r !== id));
    else setSelectedRows([...selectedRows, id]);
  };

  const handleDeleteConfirm = async () => {
    try {
      const { error } = await supabase
        .from("investment_histories")
        .delete()
        .in("id", selectedRows);
      if (error) throw error;
      setHistoryData(
        historyData.filter((item) => !selectedRows.includes(item.id)),
      );
      toast.success("Riwayat terpilih berhasil dihapus.");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus data.");
    }
    setSelectedRows([]);
    setIsDeleteOpen(false);
  };

  const handleOpenDetails = (item) => {
    setActiveAnalysis({
      result: item.analysis_result,

      metaForm: item.analysis_form,
    });
  };

  const fmtPersen = (val) => {
    if (val == null) return "N/A";
    if (Math.abs(val) > 1) return Number(val).toFixed(2) + "%";
    return (val * 100).toFixed(2) + "%";
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 min-h-[85vh] overflow-hidden flex flex-col justify-between">
      {isLoading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <svg
            className="animate-spin h-7 w-7 text-smart-navy"
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
      ) : (
        <div className="flex flex-col gap-6 w-full flex-1">
          <div>
            <h1 className="text-2xl font-bold text-smart-navy mb-2">
              Analysis History
            </h1>
            <p className="text-gray-500 text-sm font-medium">
              Review and track your previous portfolio optimizations
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex items-start gap-3">
            <div className="text-blue-500 mt-0.5 text-sm">ℹ️</div>

            <p className="text-xs text-blue-700 leading-relaxed">
              Riwayat analisis dibatasi hingga
              <span className="font-bold"> 20 data</span>. Saat batas tercapai,
              riwayat paling lama akan otomatis dihapus untuk menghemat
              penyimpanan.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history..."
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-11 pr-4 text-sm text-gray-700 outline-none focus:border-smart-navy shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (selectedRows.length > 0) setIsDeleteOpen(true);
                }}
                disabled={selectedRows.length === 0}
                className="bg-white border border-red-200 text-red-500 px-3 py-2.5 rounded-xl text-sm hover:bg-red-50 transition-colors shadow-sm disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>

              <div className="w-px h-8 bg-gray-200 mx-1"></div>

              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className="bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 text-gray-600 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                  Filter Panel
                </button>
                {showFilterPanel && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 w-80 p-5 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                        Target Index
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {["", "LQ45", "IDX30"].map((val) => (
                          <button
                            key={val}
                            onClick={() => setFilterIndex(val)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${filterIndex === val ? "bg-smart-navy text-white" : "bg-gray-100 text-gray-600"}`}
                          >
                            {val || "Semua"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                        Metode
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {["", "MVEP", "SIM", "CAPM"].map((val) => (
                          <button
                            key={val}
                            onClick={() => setFilterMethod(val)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${filterMethod === val ? "bg-smart-navy text-white" : "bg-gray-100 text-gray-600"}`}
                          >
                            {val || "Semua"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                        Skala Dana
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { v: "", l: "Semua" },
                          { v: "micro", l: "< 5Juta" },
                          { v: "medium", l: "5-25 Juta" },
                          { v: "large", l: "> 25 Juta" },
                        ].map((t) => (
                          <button
                            key={t.v}
                            onClick={() => setFilterCapital(t.v)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${filterCapital === t.v ? "bg-smart-navy text-white" : "bg-gray-100 text-gray-600"}`}
                          >
                            {t.l}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {selectedRows.length > 0 && (
            <div className="text-xs text-smart-navy font-bold bg-blue-50 px-4 py-2 rounded-xl self-start">
              {selectedRows.length} item dipilih
            </div>
          )}

          {/* Table Element */}
          <div className="rounded-2xl shadow-sm border border-gray-100 overflow-hidden bg-white">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap min-w-[700px]">
                <thead className="bg-gray-50/80 text-gray-500 uppercase text-xs font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 w-12">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={
                          selectedRows.length === paginatedData.length &&
                          paginatedData.length > 0
                        }
                        className="w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-4">Analysis ID</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Target Index</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Expected Return</th>
                    <th className="px-6 py-4">Risk</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-600">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr
                        key={item.id}
                        className={`transition-colors ${selectedRows.includes(item.id) ? "bg-blue-50/30" : "hover:bg-gray-50/40"}`}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(item.id)}
                            onChange={() => handleSelectRow(item.id)}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4 font-mono text-gray-400 text-xs">
                          {item.analysisId}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {formatDate(item.date)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold">
                            {item.target}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-smart-navy font-bold">
                          {item.method}
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-600">
                          {fmtPersen(item.return)}
                        </td>
                        <td className="px-6 py-4 font-bold text-rose-500">
                          {fmtPersen(item.risk)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleOpenDetails(item)}
                            className="bg-gray-50 text-smart-navy hover:bg-blue-50 hover:text-blue-600 p-2 rounded-xl border border-gray-100 transition-all shadow-sm"
                            title="Lihat Detail Hasil Analisis"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="8"
                        className="text-center py-12 text-gray-400 text-xs"
                      >
                        Tidak ada data riwayat optimasi portofolio.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-4 px-2">
              <span className="text-xs font-semibold text-gray-400">
                Halaman {currentPage} dari {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 disabled:opacity-40 hover:bg-gray-100 transition-colors"
                >
                  Sebelumnya
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 disabled:opacity-40 hover:bg-gray-100 transition-colors"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-smart-navy/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl flex flex-col items-center text-center">
            <h3 className="text-lg font-bold text-smart-navy mb-2">
              Hapus Riwayat Analisis?
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Apakah Anda yakin ingin menghapus {selectedRows.length} item
              riwayat analisis?
            </p>
            <div className="flex justify-end gap-3 w-full">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="flex-1 bg-gray-100 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-bold"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal View Popup Detail Arsip */}
      {activeAnalysis && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-smart-navy/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full h-[90vh] shadow-2xl relative flex flex-col animate-fade-in overflow-hidden">
            {/* Header Modal - Sticky */}
            <div className="shrink-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
              <div>
                <h3 className="text-lg font-bold text-smart-navy">
                  Arsip Hasil Analisis Kuantitatif
                </h3>
                <p className="text-gray-400 text-xs">
                  ID Catatan:{" "}
                  <span className="font-mono font-bold text-slate-600">
                    {activeAnalysis.metaForm.analysisId}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setActiveAnalysis(null)}
                className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-200/70 p-2 rounded-xl transition-all"
                title="Tutup Detil"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Body Modal — scroll di sini, bukan di dalam AnalysisPage */}
            <div className="flex-1 overflow-y-auto">
              <AnalysisPage
                analysisCompleted={true}
                result={activeAnalysis.result}
                metaForm={activeAnalysis.metaForm}
                setIsAnalysisModalOpen={() => {}}
                isArchiveMode={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
