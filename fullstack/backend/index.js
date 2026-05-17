const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API SmartInvest Siap!');
});

app.get('/api/test-db', async (req, res) => {
  try {
    const { data, error } = await supabase.from('stock_test').select('*');
    if (error) throw error;
    res.status(200).json({ message: "Koneksi Database Berhasil!", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/predict-investment', async (req, res) => {
  try {
    const { user_id, selected_stocks } = req.body;

    const { data, error } = await supabase
      .from('portfolios')
      .insert([{ user_id, stocks: selected_stocks }]);

    if (error) throw error;

    res.status(201).json({
      message: "Data saham diterima dan sedang dianalisis",
      input: selected_stocks
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// HISTORY ENDPOINTS
// ============================================

// GET — ambil semua riwayat analysis
app.get('/api/history', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('analysis_history')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST — simpan hasil analysis baru ke history
app.post('/api/history', async (req, res) => {
  try {
    const { analysisId, date, target, method, capital, return: expectedReturn, risk } = req.body;

    const { data, error } = await supabase
      .from('analysis_history')
      .insert([{ analysis_id: analysisId, date, target, method, capital, expected_return: expectedReturn, risk }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE — hapus riwayat analysis berdasarkan array ID
app.delete('/api/history', async (req, res) => {
  try {
    const { ids } = req.body;

    const { error } = await supabase
      .from('analysis_history')
      .delete()
      .in('id', ids);

    if (error) throw error;
    res.status(200).json({ message: `${ids.length} record(s) deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server jalan di port ${PORT}`));