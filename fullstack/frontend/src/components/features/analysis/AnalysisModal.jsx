import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
// Import kedua service sekaligus
import { analyzePortfolio } from '../../../services/portfolioService';
import { predictIHSG } from '../../../services/ihsgService';
import { supabase } from '../../../lib/supabase';

const METHODS = [
  { value: '', label: 'Pilih model...' },
  { value: 'MVEP', label: 'MVEP (Minimum Variance)' },
  { value: 'SIM', label: 'SIM (Single Index Model)' },
  { value: 'CAPM', label: 'CAPM (Capital Asset Pricing)' },
  { value: 'ALL', label: 'ALL (Bandingkan Semua)' },
];

const TARGET_INDICES = [
  { value: '', label: 'Pilih indeks...' },
  { value: 'LQ45', label: 'LQ45' },
  { value: 'IDX30', label: 'IDX30' },
];

export default function AnalysisModal({ isOpen, onClose, onAnalysisComplete, preSelectedMethod = '' }) {
  const [formData, setFormData] = useState({
    model_choice: 'MVEP',
    index_choice: 'LQ45',
    start_date: '2023-01-01',
    end_date: '2024-01-01',
    investment_amount: 10000000,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && preSelectedMethod) {
      setFormData((prev) => ({ ...prev, model_choice: preSelectedMethod }));
    }
  }, [isOpen, preSelectedMethod]);

  const handleChange = (field) => (e) => {
    const value = field === 'investment_amount' ? Number(e.target.value) : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const localErrors = {};
    if (!formData.model_choice) localErrors.model_choice = "Model wajib dipilih";
    if (!formData.index_choice) localErrors.index_choice = "Indeks wajib dipilih";
    if (!formData.start_date) localErrors.start_date = "Tanggal mulai wajib diisi";
    if (!formData.end_date) localErrors.end_date = "Tanggal akhir wajib diisi";
    if (!formData.investment_amount || formData.investment_amount <= 0) {
      localErrors.investment_amount = "Jumlah investasi harus lebih dari 0";
    }
    return localErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    const localErrors = validateForm();
    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      // ⚡ FIX: TEMBAK 2 ENDPOINT SEKALIGUS SECARA PARALEL ⚡
      const [portfolioRes, ihsgRes] = await Promise.all([
        analyzePortfolio(formData),
        predictIHSG(formData)
      ]);

      // Satukan hasilnya ke dalam satu objek gabungan untuk dilempar ke AnalysisPage
      const combinedResponse = {
        portfolio_data: portfolioRes, // Mengandung expectedReturn, risk, sharpeRatio, portfolio, dll dari endpoint lama
        ihsg_data: ihsgRes            // Mengandung ihsg_analysis, decision_engine, ai_interpretation dari endpoint baru
      };

      try {
        const { data: userData } = await supabase.auth.getUser();
        await supabase.from("analysis_history").insert({
          user_id: userData?.user?.id,
          index_choice: formData.index_choice,
          model_choice: formData.model_choice,
          investment_amount: formData.investment_amount,
          result: combinedResponse, // Simpan objek gabungan ke history database
        });
      } catch (dbError) {
        console.error("Gagal menyimpan ke history:", dbError);
      }

      toast.success("Analisis Ganda Berhasil Terintegrasi!");
      onAnalysisComplete(combinedResponse, formData);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Gagal melakukan penembakan data analisis ganda.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-smart-navy/60 backdrop-blur-sm p-6" onClick={(e) => e.target === e.currentTarget && !isLoading && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl border border-gray-100 flex flex-col gap-6 max-h-[88vh] overflow-y-auto relative">
        <div>
          <h2 className="text-2xl font-bold text-smart-navy mb-1">Konfigurasi Ganda AI</h2>
          <p className="text-gray-400 text-sm font-medium">Data Portofolio Kuantitatif + Prediksi IHSG</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Model */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-50 flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Model Analisis</label>
            <select value={formData.model_choice} onChange={handleChange('model_choice')} disabled={isLoading} className="bg-transparent text-sm font-bold text-smart-navy outline-none cursor-pointer">
              {METHODS.map((m) => <option key={m.value} value={m.value} disabled={m.value === ''}>{m.label}</option>)}
            </select>
          </div>

          {/* Target Index */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-50 flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Indeks Target</label>
            <select value={formData.index_choice} onChange={handleChange('index_choice')} disabled={isLoading} className="bg-transparent text-sm font-bold text-smart-navy outline-none cursor-pointer">
              {TARGET_INDICES.map((idx) => <option key={idx.value} value={idx.value} disabled={idx.value === ''}>{idx.label}</option>)}
            </select>
          </div>

          {/* Period */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-50 flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Periode Historis</label>
            <div className="flex gap-4 mt-1">
              <div className="flex-1 flex flex-col">
                <span className="text-[9px] font-bold text-gray-400 mb-0.5">Mulai</span>
                <input type="date" value={formData.start_date} onChange={handleChange('start_date')} min="2018-01-01" max="2026-05-19" disabled={isLoading} className="bg-transparent text-xs font-bold text-smart-navy outline-none border-b border-gray-200 pb-1" />
              </div>
              <div className="flex-1 flex flex-col">
                <span className="text-[9px] font-bold text-gray-400 mb-0.5">Akhir</span>
                <input type="date" value={formData.end_date} onChange={handleChange('end_date')} min="2018-01-01" max="2026-05-19" disabled={isLoading} className="bg-transparent text-xs font-bold text-smart-navy outline-none border-b border-gray-200 pb-1" />
              </div>
            </div>
          </div>

          {/* Investment Amount */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-50 flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Jumlah Investasi</label>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold text-gray-400">Rp</span>
              <input type="number" min="100000" value={formData.investment_amount} onChange={handleChange('investment_amount')} disabled={isLoading} className="bg-transparent text-sm font-bold text-smart-navy outline-none w-full" />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all">Batal</button>
            <button type="submit" disabled={isLoading} className="flex-[2] bg-smart-green text-white py-3 rounded-xl font-bold text-sm hover:bg-[#00b86a] transition-all flex items-center justify-center gap-2 shadow-sm">
              {isLoading ? 'Memproses Dual API...' : 'Mulai Analisis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}