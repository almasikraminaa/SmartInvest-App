// src/components/features/analysis/AnalysisModal.jsx
import { useState } from 'react';
import { validateAnalysisForm } from '../../../utils/validateAnalysisForm';

const METHODS = [
  { value: '', label: 'Select method...' },
  { value: 'MVEP', label: 'MVEP (Minimum Variance)' },
  { value: 'SIM', label: 'SIM (Single Index Model)' },
  { value: 'CAF', label: 'CAF (Constant Allocation)' },
];

const TARGET_INDICES = [
  { value: '', label: 'Select index...' },
  { value: 'LQ45', label: 'LQ45' },
  { value: 'IDX30', label: 'IDX30' },
  { value: 'JII', label: 'JII' },
];

export default function AnalysisModal({ isOpen, onClose, onAnalysisComplete }) {
  const [formData, setFormData] = useState({
    method: '',
    targetIndex: '',
    periodStart: '',
    periodEnd: '',
    capitalAllocation: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear field-level error when user edits the field
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    // Prevent double-submit
    if (isLoading) return;

    // Clear previous submit error
    setSubmitError(null);

    // Validate form
    const validation = validateAnalysisForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Clear field errors and start loading
    setErrors({});
    setIsLoading(true);

    // Set up 30-second timeout with AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: formData.method,
          targetIndex: formData.targetIndex,
          periodStart: formData.periodStart,
          periodEnd: formData.periodEnd,
          capitalAllocation: Number(formData.capitalAllocation),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        // Success: call onAnalysisComplete and close modal
        onAnalysisComplete();
        onClose();
      } else {
        // HTTP error response
        const errorData = await response.json().catch(() => null);
        const message = errorData?.message || `Analysis failed (HTTP ${response.status})`;
        setSubmitError(message);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        setSubmitError('Request timed out. Please try again.');
      } else {
        setSubmitError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-smart-navy/60 backdrop-blur-md p-6 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl border border-gray-100 flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold text-smart-navy mb-1">Configuration</h2>
          <p className="text-gray-400 text-sm font-medium">Set your portfolio parameters</p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
          {/* Method */}
          <div className={`bg-gray-50/80 p-4 rounded-2xl border flex flex-col gap-1 ${errors.method ? 'border-red-400' : 'border-gray-100'}`}>
            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
              Method
            </label>
            <select
              value={formData.method}
              onChange={handleChange('method')}
              disabled={isLoading}
              className="bg-transparent text-sm font-bold text-smart-navy outline-none disabled:opacity-50"
            >
              {METHODS.map((m) => (
                <option key={m.value} value={m.value} disabled={m.value === ''}>
                  {m.label}
                </option>
              ))}
            </select>
            {errors.method && (
              <span className="text-xs text-red-500 mt-1">{errors.method}</span>
            )}
          </div>

          {/* Target Index */}
          <div className={`bg-gray-50/80 p-4 rounded-2xl border flex flex-col gap-1 ${errors.targetIndex ? 'border-red-400' : 'border-gray-100'}`}>
            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
              Target Index
            </label>
            <select
              value={formData.targetIndex}
              onChange={handleChange('targetIndex')}
              disabled={isLoading}
              className="bg-transparent text-sm font-bold text-smart-navy outline-none disabled:opacity-50"
            >
              {TARGET_INDICES.map((idx) => (
                <option key={idx.value} value={idx.value} disabled={idx.value === ''}>
                  {idx.label}
                </option>
              ))}
            </select>
            {errors.targetIndex && (
              <span className="text-xs text-red-500 mt-1">{errors.targetIndex}</span>
            )}
          </div>

          {/* Period */}
          <div className={`bg-gray-50/80 p-4 rounded-2xl border flex flex-col gap-1 ${errors.periodStart || errors.periodEnd ? 'border-red-400' : 'border-gray-100'}`}>
            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
              Period
            </label>
            <div className="flex gap-4 mt-1">
              <div className="flex-1 flex flex-col">
                <input
                  type="date"
                  value={formData.periodStart}
                  onChange={handleChange('periodStart')}
                  disabled={isLoading}
                  className="bg-transparent text-xs font-bold text-smart-navy outline-none border-b border-gray-200 pb-1 disabled:opacity-50"
                />
                {errors.periodStart && (
                  <span className="text-xs text-red-500 mt-1">{errors.periodStart}</span>
                )}
              </div>
              <div className="flex-1 flex flex-col">
                <input
                  type="date"
                  value={formData.periodEnd}
                  onChange={handleChange('periodEnd')}
                  disabled={isLoading}
                  className="bg-transparent text-xs font-bold text-smart-navy outline-none border-b border-gray-200 pb-1 disabled:opacity-50"
                />
                {errors.periodEnd && (
                  <span className="text-xs text-red-500 mt-1">{errors.periodEnd}</span>
                )}
              </div>
            </div>
          </div>

          {/* Capital Allocation */}
          <div className={`bg-gray-50/80 p-4 rounded-2xl border flex flex-col gap-1 ${errors.capitalAllocation ? 'border-red-400' : 'border-gray-100'}`}>
            <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
              Capital Allocation
            </label>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold text-gray-400">Rp</span>
              <input
                type="number"
                min="1"
                max="999999999999"
                value={formData.capitalAllocation}
                onChange={handleChange('capitalAllocation')}
                disabled={isLoading}
                placeholder="2000000"
                className="bg-transparent text-sm font-bold text-smart-navy outline-none w-full disabled:opacity-50"
              />
            </div>
            {errors.capitalAllocation && (
              <span className="text-xs text-red-500 mt-1">{errors.capitalAllocation}</span>
            )}
          </div>

          {/* Error Banner */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-medium">
              {submitError}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-[2] bg-smart-navy text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-smart-navy/20 hover:opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Run Analysis'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
