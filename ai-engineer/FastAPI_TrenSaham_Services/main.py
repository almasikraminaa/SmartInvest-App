"""
SmartInvest AI Engine API (Anti-Rate Limit Premium Version)
Model: Klasifikasi tren saham 3 kelas (Bearish, Sideways, Bullish)
Input model: 15 time steps x 11 fitur teknikal
"""

from __future__ import annotations

import os
import zipfile
import joblib
import requests  # <-- Ditambahkan untuk bypass blokir Yahoo
import numpy as np
import pandas as pd
import tensorflow as tf
import yfinance as yf
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from tensorflow.keras.layers import Layer
from typing import List
from contextlib import asynccontextmanager

# ============================================================
# 1. DEKLARASI & REGISTRASI LAYER KUSTOM
# ============================================================
@tf.keras.utils.register_keras_serializable(package="CustomLayers")
class CustomDenseMaju(Layer):
    def __init__(self, units, activation=None, l2_reg=0.001, **kwargs):
        super(CustomDenseMaju, self).__init__(**kwargs)
        self.units = units
        self.activation_fn = tf.keras.activations.get(activation)
        self.l2_reg = l2_reg
        self.regularizer = tf.keras.regularizers.l2(l2_reg)

    def build(self, input_shape):
        self.w = self.add_weight(
            name='kernel', 
            shape=(int(input_shape[-1]), self.units), 
            initializer='he_normal', 
            regularizer=self.regularizer, 
            trainable=True
        )
        self.b = self.add_weight(
            name='bias', 
            shape=(self.units,), 
            initializer='zeros', 
            trainable=True
        )
        super().build(input_shape)

    def call(self, inputs): 
        return self.activation_fn(tf.matmul(inputs, self.w) + self.b)

    def get_config(self):
        cfg = super().get_config()
        cfg.update({
            'units': self.units, 
            'activation': tf.keras.activations.serialize(self.activation_fn), 
            'l2_reg': self.l2_reg
        })
        return cfg

# ============================================================
# 2. KONFIGURASI PATH & LIFESPAN EVENT HANDLER
# ============================================================
ZIP_MODEL_PATH = "smartinvest_best_model_3class.keras.zip"
FOLDER_MODEL_TEMP = "folder_model_temp"
SCALER_PATH = "smartinvest_scaler_global.pkl"

TIME_STEPS = 15
FITUR_COLS = [
    "Return", "MA20", "MA50", "Volatilitas", "Volume_Log",
    "RSI", "MACD", "MA_Gap", "BB_Width", "ROC5", "Trend_Strength"
]

model = None
scaler = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, scaler
    try:
        if not os.path.exists(SCALER_PATH):
            raise FileNotFoundError(f"Scaler tidak ditemukan di: {SCALER_PATH}")
        scaler = joblib.load(SCALER_PATH)
        print("✅ Scaler global berhasil dimuat.")

        custom_mapping = {"CustomDenseMaju": CustomDenseMaju}
        
        if os.path.exists(ZIP_MODEL_PATH):
            print(f"📦 Mengekstrak berkas model {ZIP_MODEL_PATH}...")
            with zipfile.ZipFile(ZIP_MODEL_PATH, 'r') as zip_ref:
                zip_ref.extractall(FOLDER_MODEL_TEMP)
            model = tf.keras.models.load_model(FOLDER_MODEL_TEMP, custom_objects=custom_mapping)
            print("✅ Model Keras 3 (BiLSTM + Attention) berhasil diekstrak dan dimuat.")
        elif os.path.exists("smartinvest_best_model_3class.keras"):
            model = tf.keras.models.load_model("smartinvest_best_model_3class.keras", custom_objects=custom_mapping)
            print("✅ Model murni .keras berhasil dimuat langsung.")
        else:
            raise FileNotFoundError("Berkas model (.keras.zip atau .keras) tidak ditemukan!")
            
        yield
        
    except Exception as e:
        print(f"❌ Gagal menginisialisasi komponen ML pada startup: {e}")
        raise e
    finally:
        print("🔌 Mematikan server FastAPI SmartInvest.")

app = FastAPI(
    title="SmartInvest AI Engine API",
    description="API Mandiri untuk Inference Model Prediksi Tren Saham (IDX30/LQ45)",
    version="4.0",
    lifespan=lifespan
)

# ============================================================
# 3. FUNGSI UTAMA PIPELINE INFERENCE
# ============================================================
def build_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    if isinstance(df.columns, pd.MultiIndex): 
        df.columns = df.columns.get_level_values(0)
        
    df['Return']      = df['Close'].pct_change()
    df['MA20']        = df['Close'].rolling(window=20).mean()
    df['MA50']        = df['Close'].rolling(window=50).mean()
    df['Volatilitas'] = (df['High'] - df['Low']) / (df['Close'] + 1e-10)
    df['Volume_Log']  = np.log(df['Volume'] + 1)
    
    delta = df['Close'].diff()
    gain  = delta.clip(lower=0).rolling(14).mean()
    loss  = (-delta.clip(upper=0)).rolling(14).mean()
    rs    = gain / (loss + 1e-10)
    df['RSI'] = 100 - (100 / (1 + rs))
    
    ema12 = df['Close'].ewm(span=12, adjust=False).mean()
    ema26 = df['Close'].ewm(span=26, adjust=False).mean()
    df['MACD'] = (ema12 - ema26) / (df['Close'] + 1e-10)
    df['MA_Gap'] = (df['MA20'] - df['MA50']) / (df['MA50'] + 1e-10)
    
    rolling_std = df['Close'].rolling(20).std()
    upper_band = df['MA20'] + 2 * rolling_std
    lower_band = df['MA20'] - 2 * rolling_std
    df['BB_Width'] = (upper_band - lower_band) / (df['MA20'] + 1e-10)
    
    df['ROC5'] = df['Close'].pct_change(5)
    df['Trend_Strength'] = df['MA_Gap'].abs()
    
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.dropna(inplace=True)
    return df

def normalize_ticker(ticker: str) -> str:
    ticker = ticker.upper().strip()
    if not ticker.endswith(".JK"):
        ticker += ".JK"
    return ticker

def predict_stock(ticker: str, period: str = "6mo") -> dict:
    full_ticker = normalize_ticker(ticker)
    try:
        # ✨ TRIK ANTI-BLOCK: Membuat session penyamaran browser Chrome asli
        session = requests.Session()
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        })
        
        # Kirim session penyamaran ke yfinance
        df = yf.download(full_ticker, period=period, progress=False, auto_adjust=True, session=session)
        
        if df.empty or len(df) < 80:
            raise ValueError(f"Data historis untuk {full_ticker} tidak mencukupi atau terblokir firewall.")
        
        df_fitur = build_features(df)
        if len(df_fitur) < TIME_STEPS:
            raise ValueError(f"Gagal membentuk sekuens {TIME_STEPS} hari dari fitur teknikal.")
            
        input_seq = scaler.transform(df_fitur[FITUR_COLS].tail(TIME_STEPS).values)
        input_data = input_seq.reshape(1, TIME_STEPS, len(FITUR_COLS))
        
        prob = model.predict(input_data, verbose=0)[0]
        kelas_idx = int(np.argmax(prob))
        label_kelas = ["⬇ Bearish", "➡ Sideways", "⬆ Bullish"][kelas_idx]
        
        tk = yf.Ticker(full_ticker, session=session)
        harga_terakhir = float(df.iloc[-1]['Close'])
        sektor = tk.info.get("sector", "Unknown Sector")
        
        return {
            "ticker": full_ticker.replace(".JK", ""),
            "harga_terakhir": round(harga_terakhir, 0),
            "prediksi": label_kelas,
            "probabilitas": {
                "bearish": f"{prob[0]*100:.1f}%",
                "sideways": f"{prob[1]*100:.1f}%",
                "bullish": f"{prob[2]*100:.1f}%"
            },
            "sektor": sektor
        }
    except Exception as e:
        raise RuntimeError(f"Gagal memproses analisis saham {ticker}: {str(e)}")

# ============================================================
# 4. VALIDASI SCHEMA PYDANTIC ENDPOINT (SINKRON & RINGKES)
# ============================================================
class StockRequest(BaseModel):
    ticker: str = Field(..., json_schema_extra={"example": "BBCA"})
    period: str = Field("6mo", json_schema_extra={"example": "6mo"})

class PortfolioItem(BaseModel):
    ticker: str = Field(..., json_schema_extra={"example": "BBCA"})
    bobot_pct: float = Field(..., json_schema_extra={"example": 20.0})
    alokasi_rp: float = Field(..., json_schema_extra={"example": 2000000})

class PortfolioRequest(BaseModel):
    metode: str = Field("MVEP", json_schema_extra={"example": "MVEP"})
    total_investasi: float = Field(10000000, json_schema_extra={"example": 10000000})
    portfolio: List[PortfolioItem]

# ============================================================
# 5. ENDPOINT ROUTER REST-API
# ============================================================
@app.get("/")
def read_root():
    return {"message": "Welcome to SmartInvest AI Engine API. Go to /docs for Swagger documentation."}

@app.post("/predict-single")
def predict_single_endpoint(request: StockRequest):
    try:
        return predict_stock(request.ticker, request.period)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

@app.post("/predict-portfolio")
def predict_portfolio_endpoint(request: PortfolioRequest):
    results = []
    for item in request.portfolio:
        try:
            pred = predict_stock(item.ticker)
            harga = pred["harga_terakhir"]
            lot = int(item.alokasi_rp / (harga * 100)) if harga > 0 else 0
            
            results.append({
                **pred,
                "bobot_pct": item.bobot_pct,
                "alokasi_rp": item.alokasi_rp,
                "estimasi_lot": lot
            })
        except Exception as exc:
            results.append({
                "ticker": normalize_ticker(item.ticker).replace(".JK", ""),
                "error": str(exc),
                "bobot_pct": item.bobot_pct,
                "alokasi_rp": item.alokasi_rp
            })
            
    return {
        "metode": request.metode,
        "total_investasi": request.total_investasi,
        "jumlah_saham": len(request.portfolio),
        "hasil": results
    }

# ============================================================
# 6. WRAPPER RUNNER LOCAL (AUTO-UVICORN)
# ============================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)