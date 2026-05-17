# ai_logic.py
import os
import joblib
import numpy as np
import tensorflow as tf
import google.generativeai as genai
from fastapi import HTTPException

# --- CONFIGURATION & LOAD ASSETS ---
# Pastikan path ini sesuai dengan struktur folder di Hugging Face kamu
MODEL_TREND_PATH = "models/smartinvest_best_model_3class.keras"
SCALER_TREND_PATH = "assets/smartinvest_scaler_global.pkl"
MODEL_IHSG_PATH = "models/ihsg_best_model_3class.keras"
SCALER_IHSG_PATH = "assets/ihsg_scaler_global.pkl"

# Load Model & Scaler (Hanya sekali saat startup)
try:
    model_trend = tf.keras.models.load_model(MODEL_TREND_PATH)
    scaler_trend = joblib.load(SCALER_TREND_PATH)
    model_ihsg = tf.keras.models.load_model(MODEL_IHSG_PATH)
    scaler_ihsg = joblib.load(SCALER_IHSG_PATH)
    print("✅ Semua Model AI dan Scaler berhasil dimuat.")
except Exception as e:
    print(f"❌ Gagal memuat aset AI: {e}")

# Label untuk model 3-class (Sesuaikan dengan output tim AI)
LABELS = {0: "Bearish", 1: "Neutral", 2: "Bullish"}

# --- FUNCTIONS ---

def get_gemini_analysis(ticker, trend, confidence, method="Portfolio Analysis"):
    """
    Memberikan narasi analisis menggunakan Gemini 1.5 Flash.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "Analisis tidak tersedia (API Key missing)."

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = (
            f"Anda adalah analis keuangan profesional. Berikan analisis singkat untuk saham {ticker}. "
            f"Hasil prediksi model AI kami menunjukkan tren {trend} dengan tingkat kepercayaan {confidence:.2f}%. "
            f"Strategi ini menggunakan metode {method}. Berikan saran taktis dalam Bahasa Indonesia."
        )
        
        response = model.generate_content(prompt)
        return response.text if response.text else "Gagal menghasilkan narasi."
    except Exception as e:
        return f"Error Gemini: {str(e)}"

def predict_stock_trend(ticker_data):
    """
    Melakukan prediksi tren untuk satu saham (Halaman 3).
    Input: Ticker data (feature vector dari DS).
    """
    try:
        # Preprocessing (Scaling)
        scaled_data = scaler_trend.transform(ticker_data)
        
        # Prediction
        prediction = model_trend.predict(scaled_data)
        class_idx = np.argmax(prediction)
        confidence = np.max(prediction) * 100
        
        return {
            "trend": LABELS[class_idx],
            "confidence": confidence
        }
    except Exception as e:
        return {"trend": "Unknown", "confidence": 0, "error": str(e)}

def predict_ihsg_trend():
    """
    Melakukan prediksi tren IHSG (Halaman 4).
    Biasanya menggunakan data pasar terbaru.
    """
    try:
        # Contoh dummy input, nanti integrasikan dengan data_loader untuk ambil data terbaru
        # input_data = data_loader.get_latest_market_features()
        # scaled_data = scaler_ihsg.transform(input_data)
        
        # Untuk sementara kita buat logic placeholder yang memanggil model IHSG
        return {
            "trend": "Bullish", # Contoh output
            "confidence": 85.5,
            "analysis": "IHSG menunjukkan momentum kuat di atas level support psikologis."
        }
    except Exception as e:
        return {"trend": "Error", "confidence": 0, "analysis": str(e)}

def get_bulk_analysis(tickers, portfolio_method):
    """
    Mengambil analisis untuk banyak saham sekaligus (Halaman 3).
    """
    results = []
    for ticker in tickers:
        # 1. Prediksi Tren via Model Keras
        # (Catatan: Kamu perlu koordinasi dengan DS untuk bentuk data inputnya)
        pred = {"trend": "Neutral", "confidence": 50.0} # Placeholder
        
        # 2. Ambil Narasi Gemini
        analysis = get_gemini_analysis(ticker, pred["trend"], pred["confidence"], portfolio_method)
        
        results.append({
            "ticker": ticker,
            "trend": pred["trend"],
            "confidence": f"{pred['confidence']:.2f}%",
            "gemini_insight": analysis
        })
    return results