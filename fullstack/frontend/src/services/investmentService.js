import { supabase } from './supabaseClient';

// 1. Fungsi untuk menyimpan riwayat baru setelah user melakukan analisis (⚡ UPDATED ⚡)
export const saveInvestmentHistory = async (
  targetIndex, 
  method, 
  capital, 
  expectedReturn, 
  risk,
  sharpeRatio,       // ⚡ Parameter Baru 1
  marketSentiment,   // ⚡ Parameter Baru 2
  biRate,            // ⚡ Parameter Baru 3
  startDate,         // ⚡ Parameter Baru 4
  endDate,           // ⚡ Parameter Baru 5
  aiInterpretation,  // ⚡ Parameter Baru 6
  portfolioAllocation // ⚡ Parameter Baru 7
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("User tidak terautentikasi.");

    const { data, error } = await supabase
      .from('investment_histories')
      .insert([{
        user_id: user.id,
        target_index: targetIndex,
        method: method,
        capital: capital,
        expected_return: expectedReturn,
        risk: risk,
        
        // ⚡ MAP DATA BARU KE KOLOM SUPABASE ⚡
        sharpe_ratio: sharpeRatio,
        market_sentiment: marketSentiment,
        bi_rate: biRate,
        start_date: startDate,
        end_date: endDate,
        ai_interpretation: aiInterpretation,
        portfolio_allocation: portfolioAllocation
      }])
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Gagal menyimpan riwayat:", error.message);
    return { data: null, error: error.message };
  }
};

// 2. Fungsi untuk mengambil semua daftar riwayat milik user yang sedang login
export const fetchUserHistories = async () => {
  try {
    const { data, error } = await supabase
      .from('investment_histories')
      .select('*')
      .order('created_at', { ascending: false }); // Riwayat terbaru muncul paling atas

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Gagal mengambil riwayat:", error.message);
    return { data: null, error: error.message };
  }
};
