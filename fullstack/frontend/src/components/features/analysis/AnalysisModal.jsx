import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { analyzePortfolio } from "../../../services/portfolioService";
import { predictIHSG } from "../../../services/ihsgService";
import { supabase } from "../../../lib/supabase";

const METHODS = [
  { value: "", label: "Pilih model analisis..." },
  { value: "MVEP", label: "MVEP (Minimum Variance)" },
  { value: "SIM", label: "SIM (Single Index Model)" },
  { value: "CAPM", label: "CAPM (Capital Asset Pricing)" },
];

const TARGET_INDICES = [
  { value: "", label: "Pilih indeks target..." },
  { value: "LQ45", label: "LQ45" },
  { value: "IDX30", label: "IDX30" },
];

export default function AnalysisModal({
  isOpen,
  onClose,
  onAnalysisComplete,
  preSelectedMethod = "",
}) {
  // ⚡ DEFAULT STATE KOSONG (TANPA DEFAULT VALUE) ⚡
  const [formData, setFormData] = useState({
    model_choice: "",
    index_choice: "",
    start_date: "",
    end_date: "",
    investment_amount: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (preSelectedMethod) {
        setFormData({
          model_choice: preSelectedMethod,
          index_choice: "",
          start_date: "",
          end_date: "",
          investment_amount: "",
        });
      } else {
        setFormData({
          model_choice: "",
          index_choice: "",
          start_date: "",
          end_date: "",
          investment_amount: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, preSelectedMethod]);

  const handleChange = (field) => (e) => {
    const value =
      field === "investment_amount"
        ? e.target.value === ""
          ? ""
          : Number(e.target.value)
        : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

const handleQuickSelect = (months) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const formatDate = (date) => date.toISOString().split('T')[0];

    setFormData((prev) => ({
      ...prev,
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
    }));
    
    // Opsional: hapus error jika user klik tombol cepat
    setErrors((prev) => ({ ...prev, start_date: null, end_date: null }));
  };

  const validateForm = () => {
    const localErrors = {};
    if (!formData.model_choice)
      localErrors.model_choice = "Model wajib dipilih";
    if (!formData.index_choice)
      localErrors.index_choice = "Indeks wajib dipilih";
    if (!formData.start_date)
      localErrors.start_date = "Tanggal mulai wajib diisi";
    if (!formData.end_date) localErrors.end_date = "Tanggal akhir wajib diisi";
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (end <= start) {
        localErrors.end_date = "Tanggal akhir harus setelah tanggal mulai";
      } else {
        const diffMs = end - start;
        const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
        if (diffYears > 5) {
          localErrors.start_date = "Periode maksimal 5 tahun";
        }
      }
    }
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
      // Tampilkan toast error pertama agar user tahu apa yang kurang
      toast.error(Object.values(localErrors)[0]);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const [portfolioRes, ihsgRes] = await Promise.all([
        analyzePortfolio(formData),
        predictIHSG(formData),
      ]);

      const combinedResponse = {
        portfolio_data: portfolioRes,
        ihsg_data: ihsgRes,
      };

      const selectedMetrics = ihsgRes?.method_comparison?.find(
        (m) => m.method === formData.model_choice,
      );
      const finalReturn = selectedMetrics
        ? selectedMetrics.return
        : ihsgRes?.best_method_metrics?.expected_return ||
          portfolioRes?.expectedReturn ||
          0;
      const finalRisk = selectedMetrics
        ? selectedMetrics.risk
        : ihsgRes?.best_method_metrics?.annual_risk || portfolioRes?.risk || 0;
      const finalSharpe = selectedMetrics
        ? selectedMetrics.sharpe
        : ihsgRes?.best_method_metrics?.sharpe_ratio ||
          portfolioRes?.sharpeRatio ||
          0;

      try {
        const { data: userData } = await supabase.auth.getUser();

        await supabase.from("investment_histories").insert({
          user_id: userData?.user?.id,
          target_index: formData.index_choice,
          method: formData.model_choice,
          capital: Number(formData.investment_amount),
          expected_return: Number(finalReturn),
          risk: Number(finalRisk),
          bi_rate: Number(ihsgRes?.metadata?.bi_rate || 5.8),
          sharpe_ratio: Number(finalSharpe),
          market_sentiment: ihsgRes?.ihsg_analysis?.market_trend || "N/A",
        });
      } catch (dbError) {
        console.error(
          "Gagal menyimpan ke investment_histories Supabase:",
          dbError,
        );
      }

      toast.success("Analisis Ganda Berhasil Terintegrasi!");
      onAnalysisComplete(combinedResponse, formData);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Gagal melakukan proses analisis data.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;


  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-smart-navy/60 backdrop-blur-sm p-6"
      onClick={(e) => e.target === e.currentTarget && !isLoading && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl border border-gray-100 flex flex-col gap-6 max-h-[88vh] overflow-y-auto relative">
        <div>
          <h2 className="text-2xl font-bold text-smart-navy mb-1">
            Konfigurasi AI
          </h2>
          <p className="text-gray-400 text-sm font-medium">
            Masukkan parameter analisis baru Anda
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Model */}
          <div
            className={`bg-gray-50 p-4 rounded-xl border flex flex-col gap-1 ${errors.model_choice ? "border-red-300" : "border-gray-50"}`}
          >
            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
              Model Analisis
            </label>
            <select
              value={formData.model_choice}
              onChange={handleChange("model_choice")}
              disabled={isLoading}
              className="bg-transparent text-sm font-bold text-smart-navy outline-none cursor-pointer"
            >
              {METHODS.map((m) => (
                <option
                  key={m.value}
                  value={m.value}
                  disabled={m.value === "" && formData.model_choice !== ""}
                >
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target Index */}
          <div
            className={`bg-gray-50 p-4 rounded-xl border flex flex-col gap-1 ${errors.index_choice ? "border-red-300" : "border-gray-50"}`}
          >
            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
              Indeks Target
            </label>
            <select
              value={formData.index_choice}
              onChange={handleChange("index_choice")}
              disabled={isLoading}
              className="bg-transparent text-sm font-bold text-smart-navy outline-none cursor-pointer"
            >
              {TARGET_INDICES.map((idx) => (
                <option
                  key={idx.value}
                  value={idx.value}
                  disabled={idx.value === "" && formData.index_choice !== ""}
                >
                  {idx.label}
                </option>
              ))}
            </select>
          </div>

          {/* Period */}
          <div
            className={`bg-gray-50 p-4 rounded-xl border flex flex-col gap-1 ${errors.start_date || errors.end_date ? "border-red-300" : "border-gray-50"}`}
          >
            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
              Periode Historis
            </label>
            <div className="flex gap-4 mt-1">
              <div className="flex-1 flex flex-col">
                <span className="text-[9px] font-bold text-gray-400 mb-0.5">
                  Mulai
                </span>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={handleChange("start_date")}
                  min="2018-01-01"
                  max="2026-05-19"
                  disabled={isLoading}
                  className="bg-transparent text-xs font-bold text-smart-navy outline-none border-b border-gray-200 pb-1"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <span className="text-[9px] font-bold text-gray-400 mb-0.5">
                  Akhir
                </span>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={handleChange("end_date")}
                  min="2018-01-01"
                  max="2026-05-19"
                  disabled={isLoading}
                  className="bg-transparent text-xs font-bold text-smart-navy outline-none border-b border-gray-200 pb-1"
                />
              </div>
            </div>
            {/* radio button */}
           <div className="flex gap-4 mt-3 px-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="period"
                className="accent-smart-navy h-4 w-4"
                onChange={() => handleQuickSelect(6)}
              />
              <span className="text-[10px] font-bold text-gray-500">6 Bulan</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="period"
                className="accent-smart-navy h-4 w-4"
                onChange={() => handleQuickSelect(12)}
              />
              <span className="text-[10px] font-bold text-gray-500">1 Tahun</span>
            </label>
          </div>
        </div>

          {/* Investment Amount */}
          <div
            className={`
    bg-gray-50
    p-4
    rounded-xl
    border
    flex
    flex-col
    gap-1
    ${errors.investment_amount ? "border-red-300" : "border-gray-50"}
  `}
          >
            <label
              className="
      text-[10px]
      uppercase
      tracking-wider
      font-bold
      text-gray-400
    "
            >
              Investment Amount
            </label>

            <div
              className="
      flex
      items-center
      gap-2
      mt-1
    "
            >
              <span
                className="
        text-sm
        font-bold
        text-gray-400
      "
              >
                Rp
              </span>

              <input
                type="text"
                inputMode="numeric"
                min="100000"
                placeholder="10.000.000"
                value={
                  formData.investment_amount
                    ? new Intl.NumberFormat("id-ID").format(
                        formData.investment_amount,
                      )
                    : ""
                }
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, "");

                  setFormData((prev) => ({
                    ...prev,

                    investment_amount: rawValue === "" ? "" : Number(rawValue),
                  }));
                }}
                disabled={isLoading}
                className="
        bg-transparent
        text-sm
        font-bold
        text-smart-navy
        outline-none
        w-full
        placeholder-gray-300
      "
              />
            </div>

            <span
              className="
      text-[10px]
      text-gray-400
      mt-1
    "
            >
              Example: Rp 10.000.000
            </span>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] bg-smart-green text-white py-3 rounded-xl font-bold text-sm hover:bg-[#00b86a] transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {isLoading ? "Memproses Perhitungan..." : "Mulai Analisis"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
