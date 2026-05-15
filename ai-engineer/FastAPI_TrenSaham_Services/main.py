"""
SmartInvest AI Engine API
Model: Klasifikasi tren saham 3 kelas (Turun, Stabil, Naik)
Input model: 15 time steps x 11 fitur teknikal

Cara menjalankan:
1. Simpan file ini satu folder dengan:
   - smartinvest_best_model_3class.keras
   - smartinvest_scaler_global.pkl

2. Install dependency:
   pip install -r requirements.txt

3. Jalankan API:
   uvicorn main:app --reload

4. Buka dokumentasi:
   http://127.0.0.1:8000/docs
"""

from __future__ import annotations

import os
from typing import List, Optional

import joblib
import numpy as np
import pandas as pd
import tensorflow as tf
import yfinance as yf
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from tensorflow.keras.layers import Layer


# ============================================================
# Konfigurasi model
# ============================================================

MODEL_PATH = os.getenv("SMARTINVEST_MODEL_PATH", "smartinvest_best_model_3class.keras")
SCALER_PATH = os.getenv("SMARTINVEST_SCALER_PATH", "smartinvest_scaler_global.pkl")

TIME_STEPS = 15
FITUR_COLS = [
    "Return",
    "MA20",
    "MA50",
    "Volatilitas",
    "Volume_Log",
    "RSI",
    "MACD",
    "MA_Gap",
    "BB_Width",
    "ROC5",
    "Trend_Strength",
]
N_FEATURES = len(FITUR_COLS)

LABEL_MAP = {
    0: "Turun",
    1: "Stabil",
    2: "Naik",
}

REKOMENDASI_MAP = {
    0: "Hati-hati / bearish",
    1: "Hold / sideways",
    2: "Potensial bullish",
}


# ============================================================
# Custom layer dari notebook
# ============================================================

@tf.keras.utils.register_keras_serializable()
class CustomDenseMaju(Layer):
    def __init__(self, units, activation=None, l2_reg=0.001, **kwargs):
        super(CustomDenseMaju, self).__init__(**kwargs)
        self.units = units
        self.activation_fn = tf.keras.activations.get(activation)
        self.l2_reg = l2_reg
        self.regularizer = tf.keras.regularizers.l2(l2_reg)

    def build(self, input_shape):
        self.w = self.add_weight(
            name="kernel",
            shape=(int(input_shape[-1]), self.units),
            initializer="he_normal",
            regularizer=self.regularizer,
            trainable=True,
        )
        self.b = self.add_weight(
            name="bias",
            shape=(self.units,),
            initializer="zeros",
            trainable=True,
        )
        super().build(input_shape)

    def call(self, inputs):
        output = tf.matmul(inputs, self.w) + self.b
        if self.activation_fn is not None:
            output = self.activation_fn(output)
        return output

    def get_config(self):
        config = super().get_config()
        config.update(
            {
                "units": self.units,
                "activation": tf.keras.activations.serialize(self.activation_fn),
                "l2_reg": self.l2_reg,
            }
        )
        return config


# ============================================================
# FastAPI setup
# ============================================================

app = FastAPI(
    title="SmartInvest AI Engine",
    description="API prediksi tren saham 3 kelas: Turun, Stabil, Naik.",
    version="1.0.0",
)

model: Optional[tf.keras.Model] = None
scaler = None


@app.on_event("startup")
def load_artifacts() -> None:
    """Load model dan scaler saat API dinyalakan."""
    global model, scaler

    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(
            f"File model tidak ditemukan: {MODEL_PATH}. "
            "Pastikan file smartinvest_best_model_3class.keras ada di folder yang sama."
        )

    if not os.path.exists(SCALER_PATH):
        raise RuntimeError(
            f"File scaler tidak ditemukan: {SCALER_PATH}. "
            "Pastikan file smartinvest_scaler_global.pkl ada di folder yang sama."
        )

    model = tf.keras.models.load_model(
        MODEL_PATH,
        custom_objects={"CustomDenseMaju": CustomDenseMaju},
    )
    scaler = joblib.load(SCALER_PATH)


# ============================================================
# Schema request/response
# ============================================================

class StockRequest(BaseModel):
    ticker: str = Field(..., examples=["BBCA.JK"])
    period: str = Field("180d", examples=["180d", "1y", "3y"])


class PortfolioItem(BaseModel):
    ticker: str = Field(..., examples=["BBCA.JK"])
    bobot_pct: float = Field(..., examples=[20.0])
    alokasi_rp: float = Field(..., examples=[3_000_000])


class PortfolioRequest(BaseModel):
    total_investasi: float = Field(10_000_000, examples=[10_000_000])
    metode: str = Field("MVEP", examples=["MVEP", "SIM", "CAPM"])
    portfolio: List[PortfolioItem]


# ============================================================
# Feature engineering — harus sama dengan notebook
# ============================================================

def normalize_ticker(ticker: str) -> str:
    ticker = ticker.strip().upper()
    if not ticker.endswith(".JK"):
        ticker = f"{ticker}.JK"
    return ticker


def build_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    required_cols = {"Open", "High", "Low", "Close", "Volume"}
    missing_cols = required_cols.difference(df.columns)
    if missing_cols:
        raise ValueError(f"Kolom data saham tidak lengkap: {sorted(missing_cols)}")

    df["Return"] = df["Close"].pct_change()
    df["MA20"] = df["Close"].rolling(window=20).mean()
    df["MA50"] = df["Close"].rolling(window=50).mean()
    df["Volatilitas"] = (df["High"] - df["Low"]) / (df["Close"] + 1e-10)
    df["Volume_Log"] = np.log(df["Volume"] + 1)

    delta = df["Close"].diff()
    gain = delta.clip(lower=0).rolling(14).mean()
    loss = (-delta.clip(upper=0)).rolling(14).mean()
    rs = gain / (loss + 1e-10)
    df["RSI"] = 100 - (100 / (1 + rs))

    ema12 = df["Close"].ewm(span=12, adjust=False).mean()
    ema26 = df["Close"].ewm(span=26, adjust=False).mean()
    df["MACD"] = (ema12 - ema26) / (df["Close"] + 1e-10)

    df["MA_Gap"] = (df["MA20"] - df["MA50"]) / (df["MA50"] + 1e-10)

    rolling_std = df["Close"].rolling(20).std()
    upper_band = df["MA20"] + 2 * rolling_std
    lower_band = df["MA20"] - 2 * rolling_std
    df["BB_Width"] = (upper_band - lower_band) / (df["MA20"] + 1e-10)

    df["ROC5"] = df["Close"].pct_change(5)
    df["Trend_Strength"] = df["MA_Gap"].abs()

    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.dropna(inplace=True)

    return df


def download_stock_data(ticker: str, period: str) -> pd.DataFrame:
    df_raw = yf.download(
        ticker,
        period=period,
        progress=False,
        auto_adjust=True,
    )

    if df_raw.empty:
        raise ValueError(f"Data saham {ticker} kosong/tidak ditemukan dari yfinance.")

    return df_raw


def predict_stock(ticker: str, period: str = "180d") -> dict:
    if model is None or scaler is None:
        raise RuntimeError("Model/scaler belum berhasil dimuat.")

    ticker = normalize_ticker(ticker)
    df_raw = download_stock_data(ticker, period=period)
    df = build_features(df_raw)

    if len(df) < TIME_STEPS:
        raise ValueError(
            f"Data fitur {ticker} hanya {len(df)} baris. "
            f"Minimal perlu {TIME_STEPS} baris setelah feature engineering."
        )

    last_features = df[FITUR_COLS].tail(TIME_STEPS).values
    input_seq = scaler.transform(last_features)
    input_data = input_seq.reshape(1, TIME_STEPS, N_FEATURES)

    prob = model.predict(input_data, verbose=0)[0]
    pred_class = int(np.argmax(prob))

    last_close = float(df["Close"].iloc[-1])
    last_date = str(df.index[-1].date()) if hasattr(df.index[-1], "date") else str(df.index[-1])

    return {
        "ticker": ticker,
        "tanggal_data_terakhir": last_date,
        "harga_terakhir": round(last_close, 2),
        "prediksi_kelas": pred_class,
        "prediksi_label": LABEL_MAP[pred_class],
        "rekomendasi_singkat": REKOMENDASI_MAP[pred_class],
        "probabilitas": {
            "turun": round(float(prob[0]), 4),
            "stabil": round(float(prob[1]), 4),
            "naik": round(float(prob[2]), 4),
        },
        "fitur_digunakan": N_FEATURES,
        "time_steps": TIME_STEPS,
    }


# ============================================================
# Routes
# ============================================================

@app.get("/")
def root() -> dict:
    return {
        "message": "SmartInvest AI Engine aktif.",
        "docs": "/docs",
        "endpoints": ["/health", "/predict", "/predict-portfolio"],
    }


@app.get("/health")
def health_check() -> dict:
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "scaler_loaded": scaler is not None,
        "model_path": MODEL_PATH,
        "scaler_path": SCALER_PATH,
    }


@app.post("/predict")
def predict_endpoint(request: StockRequest) -> dict:
    try:
        return predict_stock(request.ticker, request.period)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/predict-portfolio")
def predict_portfolio_endpoint(request: PortfolioRequest) -> dict:
    results = []

    for item in request.portfolio:
        try:
            pred = predict_stock(item.ticker)
            harga = pred["harga_terakhir"]
            lot = int(item.alokasi_rp / (harga * 100)) if harga > 0 else 0

            results.append(
                {
                    **pred,
                    "bobot_pct": item.bobot_pct,
                    "alokasi_rp": item.alokasi_rp,
                    "estimasi_lot": lot,
                }
            )
        except Exception as exc:
            results.append(
                {
                    "ticker": normalize_ticker(item.ticker),
                    "error": str(exc),
                    "bobot_pct": item.bobot_pct,
                    "alokasi_rp": item.alokasi_rp,
                }
            )

    return {
        "metode": request.metode,
        "total_investasi": request.total_investasi,
        "jumlah_saham": len(request.portfolio),
        "hasil": results,
    }


# ============================================================
# Local run: python main.py
# ============================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
