// src/services/analysisService.js
// Service layer untuk semua operasi terkait Analysis
import apiClient from './apiClient';

/**
 * Jalankan analisis portofolio
 * @param {object} params - Parameter analisis
 * @param {string} params.method - Metode (MVEP, SIM, CAF)
 * @param {string} params.targetIndex - Target index (LQ45, IDX30)
 * @param {string} params.periodStart - Tanggal mulai (ISO string)
 * @param {string} params.periodEnd - Tanggal akhir (ISO string)
 * @param {number} params.capitalAllocation - Modal investasi (Rp)
 * @returns {Promise<object>} Hasil analisis dari backend
 */
export async function runAnalysis(params) {
  const response = await apiClient.post('/analysis', {
    method: params.method,
    targetIndex: params.targetIndex,
    periodStart: params.periodStart,
    periodEnd: params.periodEnd,
    capitalAllocation: Number(params.capitalAllocation),
  });
  return response.data;
}

/**
 * Ambil semua riwayat analisis
 * @returns {Promise<Array>} Daftar riwayat analisis
 */
export async function getHistory() {
  const response = await apiClient.get('/history');
  return response.data;
}

/**
 * Simpan hasil analisis ke history
 * @param {object} entry - Data history entry
 * @returns {Promise<object>} Record yang tersimpan
 */
export async function saveHistory(entry) {
  const response = await apiClient.post('/history', entry);
  return response.data;
}

/**
 * Hapus riwayat analisis berdasarkan array ID
 * @param {Array<number>} ids - Array ID yang akan dihapus
 * @returns {Promise<object>} Konfirmasi penghapusan
 */
export async function deleteHistory(ids) {
  const response = await apiClient.delete('/history', { data: { ids } });
  return response.data;
}
