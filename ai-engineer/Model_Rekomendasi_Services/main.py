# ================================================================
# main.py — REST API FastAPI untuk Klasifikasi IHSG & Rekomendasi Portofolio
# Dibangun dari notebook: KLASIFIKASI_IHSG_TUNED_DAN_REKOMENDASI.ipynb
# ================================================================
# Jalankan dengan:
#   uvicorn main:app --reload --port 8000
# Dokumentasi otomatis:
#   http://localhost:8000/docs  (Swagger UI)
#   http://localhost:8000/redoc (ReDoc)
# ================================================================

import warnings
warnings.filterwarnings("ignore")

import os
import datetime
import numpy as np
import pandas as pd
import joblib
import yfinance as yf

from scipy.optimize import minimize
from sklearn.preprocessing import MinMaxScaler
from sklearn.utils.class_weight import compute_class_weight
from dataclasses import dataclass, field
from typing import Dict, List, Optional
from enum import Enum

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ── Lazy import TensorFlow agar startup cepat ──
import tensorflow as tf


# ================================================================
# KONSTANTA (harus sama dengan waktu training)
# ================================================================

FITUR_COLS = [
    "Return", "MA20", "MA50", "Volatilitas", "Volume_Log",
    "RSI", "MACD", "MA_Gap", "BB_Width", "ROC5"
]
N_FEATURES = len(FITUR_COLS)   # 10
TIME_STEPS = 15                # konteks 15 hari

MODEL_PATH  = os.getenv("MODEL_PATH",  "ihsg_best_model_3class.keras")
SCALER_PATH = os.getenv("SCALER_PATH", "ihsg_scaler_global.pkl")


# ================================================================
# ENUMS & DATACLASSES INTERNAL
# ================================================================

class MarketTrend(str, Enum):
    BULLISH  = "bullish"
    BEARISH  = "bearish"
    SIDEWAYS = "sideways"


# ================================================================
# FEATURE ENGINEERING (sama persis dengan notebook)
# ================================================================

def build_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    df["Return"]      = df["Close"].pct_change()
    df["MA20"]        = df["Close"].rolling(window=20).mean()
    df["MA50"]        = df["Close"].rolling(window=50).mean()
    df["Volatilitas"] = (df["High"] - df["Low"]) / df["Close"]
    df["Volume_Log"]  = np.log(df["Volume"] + 1)

    delta = df["Close"].diff()
    gain  = delta.clip(lower=0).rolling(14).mean()
    loss  = (-delta.clip(upper=0)).rolling(14).mean()
    rs    = gain / (loss + 1e-10)
    df["RSI"] = 100 - (100 / (1 + rs))

    ema12 = df["Close"].ewm(span=12, adjust=False).mean()
    ema26 = df["Close"].ewm(span=26, adjust=False).mean()
    df["MACD"] = (ema12 - ema26) / (df["Close"] + 1e-10)

    df["MA_Gap"] = (df["MA20"] - df["MA50"]) / (df["MA50"] + 1e-10)

    rolling_std    = df["Close"].rolling(20).std()
    upper_band     = df["MA20"] + 2 * rolling_std
    lower_band     = df["MA20"] - 2 * rolling_std
    df["BB_Width"] = (upper_band - lower_band) / (df["MA20"] + 1e-10)

    df["ROC5"] = df["Close"].pct_change(5)

    df.dropna(inplace=True)
    return df


# ================================================================
# MODEL & SCALER — Dimuat sekali saat startup
# ================================================================

class ModelRegistry:
    """Singleton: muat model & scaler satu kali saja."""
    _model  = None
    _scaler = None
    _loaded = False

    @classmethod
    def load(cls):
        if cls._loaded:
            return

        # Custom layer wajib didefinisikan sebelum load model
        @tf.keras.utils.register_keras_serializable(package="CustomLayers")
        class CustomDenseMaju(tf.keras.layers.Layer):
            def __init__(self, units, activation=None, l2_reg=0.001, **kwargs):
                super().__init__(**kwargs)
                self.units         = units
                self.activation_fn = tf.keras.activations.get(activation)
                self.l2_reg        = l2_reg
                self.regularizer   = tf.keras.regularizers.l2(l2_reg)

            def build(self, input_shape):
                self.w = self.add_weight(
                    name="kernel",
                    shape=(int(input_shape[-1]), self.units),
                    initializer="he_normal",
                    regularizer=self.regularizer,
                    trainable=True,
                )
                self.b = self.add_weight(
                    name="bias", shape=(self.units,),
                    initializer="zeros", trainable=True,
                )
                super().build(input_shape)

            def call(self, inputs):
                return self.activation_fn(tf.matmul(inputs, self.w) + self.b)

            def get_config(self):
                cfg = super().get_config()
                cfg.update({
                    "units":      self.units,
                    "activation": tf.keras.activations.serialize(self.activation_fn),
                    "l2_reg":     self.l2_reg,
                })
                return cfg

        try:
            cls._model = tf.keras.models.load_model(
                MODEL_PATH,
                custom_objects={"CustomDenseMaju": CustomDenseMaju},
            )
            print(f"[startup] ✅ Model dimuat: {MODEL_PATH}")
        except Exception as e:
            print(f"[startup] ⚠ Model gagal dimuat ({e}). Prediksi akan pakai fallback.")

        try:
            cls._scaler = joblib.load(SCALER_PATH)
            print(f"[startup] ✅ Scaler dimuat: {SCALER_PATH}")
        except Exception as e:
            print(f"[startup] ⚠ Scaler gagal dimuat ({e}).")

        cls._loaded = True

    @classmethod
    def get_model(cls):
        return cls._model

    @classmethod
    def get_scaler(cls):
        return cls._scaler


# ================================================================
# LOGIKA PREDIKSI IHSG
# ================================================================

def fallback_classification(ihsg_series: pd.Series):
    """Fallback sederhana berbasis MA crossover."""
    if len(ihsg_series) < 50:
        return MarketTrend.SIDEWAYS, 0.5, 1

    ma20 = ihsg_series.rolling(20).mean().iloc[-1]
    ma50 = ihsg_series.rolling(50).mean().iloc[-1]
    cur  = ihsg_series.iloc[-1]
    pct  = (cur - ma50) / ma50

    if pct > 0.03:
        return MarketTrend.BULLISH, min(0.85, 0.6 + pct * 5), 2
    elif pct < -0.03:
        return MarketTrend.BEARISH, min(0.85, 0.6 + abs(pct) * 5), 0
    else:
        return MarketTrend.SIDEWAYS, 0.6, 1


def predict_ihsg_trend(df_raw: pd.DataFrame):
    """
    Terima DataFrame OHLCV IHSG → return (trend, confidence, pred_class, probabilities).
    """
    model  = ModelRegistry.get_model()
    scaler = ModelRegistry.get_scaler()

    # Ambil series Close untuk fallback
    ihsg_close = df_raw["Close"].squeeze()

    if model is None or scaler is None:
        trend, conf, cls_ = fallback_classification(ihsg_close)
        probs = [0.0, 0.0, 0.0]
        probs[cls_] = conf
        return trend, conf, cls_, probs

    try:
        df_feat = build_features(df_raw)
        if len(df_feat) < TIME_STEPS:
            raise ValueError("Data tidak cukup setelah feature engineering")

        X = scaler.transform(df_feat[FITUR_COLS].tail(TIME_STEPS).values)
        X = X.reshape(1, TIME_STEPS, N_FEATURES)

        probs_arr = model.predict(X, verbose=0)[0].tolist()
        pred_cls  = int(np.argmax(probs_arr))
        confidence = float(probs_arr[pred_cls])

        trend_map = {0: MarketTrend.BEARISH, 1: MarketTrend.SIDEWAYS, 2: MarketTrend.BULLISH}
        return trend_map[pred_cls], confidence, pred_cls, probs_arr

    except Exception as e:
        print(f"[predict] fallback karena error: {e}")
        trend, conf, cls_ = fallback_classification(ihsg_close)
        probs = [0.0, 0.0, 0.0]
        probs[cls_] = conf
        return trend, conf, cls_, probs


# ================================================================
# LOGIKA PORTOFOLIO
# ================================================================

def optimize_mvep(mean_returns: np.ndarray, cov_matrix: np.ndarray, rf: float = 0.06):
    n = len(mean_returns)

    def neg_sharpe(w):
        ret  = np.dot(w, mean_returns)
        risk = np.sqrt(w @ cov_matrix @ w + 1e-10)
        return -(ret - rf) / risk

    constraints = {"type": "eq", "fun": lambda w: np.sum(w) - 1}
    bounds = tuple((0, 1) for _ in range(n))

    result = minimize(
        neg_sharpe, np.ones(n) / n,
        method="SLSQP", bounds=bounds, constraints=constraints,
        options={"maxiter": 1000},
    )
    return result.x if result.success else np.ones(n) / n


def compute_sim_weights(returns: pd.DataFrame, rf: float = 0.06):
    market = returns.mean(axis=1)
    betas, alphas, resid_var = [], [], []

    for col in returns.columns:
        cov  = np.cov(returns[col], market)[0, 1]
        var  = np.var(market)
        beta = cov / var if var > 0 else 1.0
        alpha = returns[col].mean() - beta * market.mean()
        resid = returns[col] - (alpha + beta * market)
        betas.append(beta); alphas.append(alpha); resid_var.append(np.var(resid))

    betas, alphas, resid_var = map(np.array, [betas, alphas, resid_var])
    ERB = np.maximum((alphas - rf) / (betas + 1e-10), 0)
    w   = ERB / (resid_var + 1e-10)
    w   = w / w.sum() if w.sum() > 0 else np.ones(len(w)) / len(w)
    return w, betas, alphas


def compute_capm_weights(returns: pd.DataFrame):
    market = returns.mean(axis=1)
    betas, alphas = [], []

    for col in returns.columns:
        cov  = np.cov(returns[col], market)[0, 1]
        var  = np.var(market)
        beta = cov / var if var > 0 else 1.0
        alphas.append(returns[col].mean() - beta * market.mean())
        betas.append(beta)

    betas, alphas = map(np.array, [betas, alphas])
    w = 1 / (betas + 1e-10)
    w = w / w.sum()
    return w, betas, alphas


# ================================================================
# PYDANTIC SCHEMAS — Request & Response
# ================================================================

class PredictIHSGRequest(BaseModel):
    period: str = Field("1y", example="1y")
    # Tambahkan ini:
    end_date: Optional[str] = Field(None, example="2024-01-01")

class ProbabilitasDetail(BaseModel):
    turun:  float
    stabil: float
    naik:   float

class PredictIHSGResponse(BaseModel):
    ticker:        str
    harga_terakhir: float
    prediksi:      str          # "Naik" / "Turun" / "Stabil"
    trend:         MarketTrend
    confidence:    float
    probabilitas:  ProbabilitasDetail
    metode:        str          # "model_ai" | "fallback_ma"
    timestamp:     str


class PortfolioRequest(BaseModel):
    tickers:    List[str] = Field(
        default=["BBCA.JK", "BBRI.JK", "BMRI.JK", "TLKM.JK", "ASII.JK", "UNVR.JK"],
        description="Daftar kode saham BEI (akhiri dengan .JK)",
    )
    bi_rate:    float = Field(6.0, description="BI Rate dalam persen, misal 6.0")
    start_date: Optional[str] = Field(None, description="Format YYYY-MM-DD")
    end_date:   Optional[str] = Field(None, description="Format YYYY-MM-DD")

class AlokasisDetail(BaseModel):
    ticker: str
    persen: float

class MetodeDetail(BaseModel):
    metode:          str
    expected_return: float
    risiko:          float
    sharpe_ratio:    float
    beta:            Optional[float]
    alpha:           Optional[float]
    alokasi:         List[AlokasisDetail]

class PortfolioResponse(BaseModel):
    prediksi_ihsg:    PredictIHSGResponse
    metode_terbaik:   str
    alasan_pemilihan: str
    semua_metode:     List[MetodeDetail]
    periode_data:     str
    timestamp:        str


class HealthResponse(BaseModel):
    status:       str
    model_loaded: bool
    scaler_loaded: bool
    timestamp:    str


# ================================================================
# FASTAPI APP
# ================================================================

app = FastAPI(
    title="SmartInvest IHSG API",
    description=(
        "REST API mandiri untuk klasifikasi trend IHSG menggunakan model "
        "BiLSTM + Multi-Head Attention, dan rekomendasi portofolio saham BEI "
        "(MVEP, SIM, CAPM)."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    ModelRegistry.load()


# ────────────────────────────────────────────────────────────────
# ENDPOINT 1 — Health Check
# ────────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse, tags=["Utilitas"])
def health_check():
    """Cek status API dan apakah model & scaler berhasil dimuat."""
    return HealthResponse(
        status="ok",
        model_loaded=ModelRegistry.get_model() is not None,
        scaler_loaded=ModelRegistry.get_scaler() is not None,
        timestamp=datetime.datetime.now().isoformat(),
    )


# ────────────────────────────────────────────────────────────────
# ENDPOINT 2 — Prediksi Trend IHSG
# ────────────────────────────────────────────────────────────────

@app.post("/predict/ihsg", response_model=PredictIHSGResponse, tags=["Prediksi"])
def predict_ihsg(req: PredictIHSGRequest):
    ticker = "^JKSE"

    try:
        # LOGIKA CUSTOM END DATE
        if req.end_date:
            # Kita ambil range yang agak luas (misal 60 hari sebelum end_date) 
            # supaya indikator teknikal (MA50, dll) bisa terhitung akurat.
            end_dt = datetime.datetime.strptime(req.end_date, "%Y-%m-%d")
            start_dt = end_dt - datetime.timedelta(days=200) 
            df_raw = yf.download(ticker, start=start_dt, end=end_dt + datetime.timedelta(days=1), progress=False)
        else:
            df_raw = yf.download(ticker, period=req.period, progress=False)

        # Flatten MultiIndex (tetap pakai ini buat jaga-jaga)
        if isinstance(df_raw.columns, pd.MultiIndex):
            df_raw.columns = df_raw.columns.get_level_values(0)

    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gagal mengunduh data IHSG: {e}")

    if df_raw.empty or len(df_raw) < 60:
        raise HTTPException(status_code=422, detail="Data tidak cukup untuk menghitung indikator (min 60 hari).")

    # Proses prediksi tetap sama (akan otomatis ambil 15 baris terakhir dari df_raw)
    trend, confidence, pred_cls, probs = predict_ihsg_trend(df_raw)

    label_map = {0: "Turun", 1: "Stabil", 2: "Naik"}
    harga = float(df_raw["Close"].squeeze().iloc[-1])
    
    return PredictIHSGResponse(
        ticker=ticker,
        harga_terakhir=round(harga, 2),
        prediksi=label_map[pred_cls],
        trend=trend,
        confidence=round(confidence, 4),
        probabilitas=ProbabilitasDetail(
            turun=round(probs[0], 4),
            stabil=round(probs[1], 4),
            naik=round(probs[2], 4),
        ),
        metode="model_ai" if ModelRegistry.get_model() is not None else "fallback_ma",
        timestamp=datetime.datetime.now().isoformat(),
    )
# ────────────────────────────────────────────────────────────────
# ENDPOINT 3 — Rekomendasi Portofolio
# ────────────────────────────────────────────────────────────────

@app.post("/recommend/portfolio", response_model=PortfolioResponse, tags=["Portofolio"])
def recommend_portfolio(req: PortfolioRequest):
    """
    Hitung 3 metode optimasi portofolio (MVEP, SIM, CAPM) dan pilih yang terbaik
    berdasarkan prediksi trend IHSG.

    **Logika pemilihan metode:**
    - **BULLISH** → metode dengan Sharpe Ratio tertinggi
    - **BEARISH** → metode dengan risiko (volatilitas) terendah
    - **SIDEWAYS** → keseimbangan antara Sharpe Ratio dan risiko (skor gabungan)

    **tickers**: gunakan format Yahoo Finance, misal `BBCA.JK`, `TLKM.JK`.
    """
    end_date   = req.end_date   or datetime.date.today().strftime("%Y-%m-%d")
    start_date = req.start_date or (
        datetime.date.today() - datetime.timedelta(days=3 * 365)
    ).strftime("%Y-%m-%d")

    all_symbols = req.tickers + ["^JKSE"]
    try:
        data = yf.download(all_symbols, start=start_date, end=end_date, progress=False)["Close"]
        data = data.dropna()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gagal mengunduh data saham: {e}")

    if len(data) < 60:
        raise HTTPException(status_code=422, detail="Data historis terlalu sedikit (< 60 hari).")

    # Pisahkan saham dan IHSG
    available_tickers = [t for t in req.tickers if t in data.columns]
    if not available_tickers:
        raise HTTPException(status_code=422, detail="Tidak ada ticker yang valid dalam data.")

    stocks = data[available_tickers]
    ihsg   = data["^JKSE"]

    # ── Prediksi IHSG ──
    try:
        df_ihsg_raw = yf.download("^JKSE", start=start_date, end=end_date, progress=False)
    except Exception:
        df_ihsg_raw = pd.DataFrame()

    if df_raw.empty or len(df_raw) < 60:
        raise HTTPException(
            status_code=422, 
            detail=f"Data hanya ditemukan {len(df_raw)} baris. Butuh min 60 baris untuk indikator teknikal. Periksa apakah tanggal tersebut hari libur atau data belum tersedia."
        )

    ihsg_pred_response = PredictIHSGResponse(
        ticker="^JKSE",
        harga_terakhir=round(float(ihsg.iloc[-1]), 2),
        prediksi={0: "Turun", 1: "Stabil", 2: "Naik"}[pred_cls],
        trend=trend,
        confidence=round(confidence, 4),
        probabilitas=ProbabilitasDetail(
            turun=round(probs[0], 4),
            stabil=round(probs[1], 4),
            naik=round(probs[2], 4),
        ),
        metode="model_ai" if ModelRegistry.get_model() is not None else "fallback_ma",
        timestamp=datetime.datetime.now().isoformat(),
    )

    # ── Hitung Return & Covariance ──
    returns = stocks.pct_change().dropna()
    rf_rate = req.bi_rate / 100
    cov_matrix   = returns.cov().values * 252
    mean_returns = returns.mean().values * 252

    # ── 1. MVEP ──
    w_mvep   = optimize_mvep(mean_returns, cov_matrix, rf=rf_rate)
    ret_mvep = float(np.dot(w_mvep, mean_returns))
    rsk_mvep = float(np.sqrt(w_mvep @ cov_matrix @ w_mvep))
    shr_mvep = (ret_mvep - rf_rate) / rsk_mvep if rsk_mvep > 0 else 0.0
    mvep_detail = MetodeDetail(
        metode="MVEP",
        expected_return=round(ret_mvep, 4),
        risiko=round(rsk_mvep, 4),
        sharpe_ratio=round(shr_mvep, 4),
        beta=None, alpha=None,
        alokasi=[
            AlokasisDetail(ticker=t, persen=round(float(w_mvep[i]) * 100, 2))
            for i, t in enumerate(available_tickers) if w_mvep[i] > 0.01
        ],
    )

    # ── 2. SIM ──
    w_sim, betas_sim, alphas_sim = compute_sim_weights(returns, rf=rf_rate)
    ret_sim = float(np.dot(w_sim, mean_returns))
    rsk_sim = float(np.sqrt(w_sim @ cov_matrix @ w_sim))
    shr_sim = (ret_sim - rf_rate) / rsk_sim if rsk_sim > 0 else 0.0
    sim_detail = MetodeDetail(
        metode="SIM",
        expected_return=round(ret_sim, 4),
        risiko=round(rsk_sim, 4),
        sharpe_ratio=round(shr_sim, 4),
        beta=round(float(np.dot(w_sim, betas_sim)), 4),
        alpha=round(float(np.dot(w_sim, alphas_sim)) * 252, 4),
        alokasi=[
            AlokasisDetail(ticker=t, persen=round(float(w_sim[i]) * 100, 2))
            for i, t in enumerate(available_tickers) if w_sim[i] > 0.01
        ],
    )

    # ── 3. CAPM ──
    w_capm, betas_capm, alphas_capm = compute_capm_weights(returns)
    ret_capm = float(np.dot(w_capm, mean_returns))
    rsk_capm = float(np.sqrt(w_capm @ cov_matrix @ w_capm))
    shr_capm = (ret_capm - rf_rate) / rsk_capm if rsk_capm > 0 else 0.0
    capm_detail = MetodeDetail(
        metode="CAPM",
        expected_return=round(ret_capm, 4),
        risiko=round(rsk_capm, 4),
        sharpe_ratio=round(shr_capm, 4),
        beta=round(float(np.dot(w_capm, betas_capm)), 4),
        alpha=round(float(np.dot(w_capm, alphas_capm)) * 252, 4),
        alokasi=[
            AlokasisDetail(ticker=t, persen=round(float(w_capm[i]) * 100, 2))
            for i, t in enumerate(available_tickers) if w_capm[i] > 0.01
        ],
    )

    portfolios = {
        "MVEP": {"detail": mvep_detail, "sharpe": shr_mvep, "risiko": rsk_mvep},
        "SIM":  {"detail": sim_detail,  "sharpe": shr_sim,  "risiko": rsk_sim},
        "CAPM": {"detail": capm_detail, "sharpe": shr_capm, "risiko": rsk_capm},
    }

    # ── Pilih metode terbaik berdasarkan prediksi IHSG ──
    if trend == MarketTrend.BULLISH:
        best_method = max(portfolios, key=lambda x: portfolios[x]["sharpe"])
        alasan = (
            f"IHSG diprediksi NAIK → prioritas return maksimal. "
            f"{best_method} memiliki Sharpe Ratio tertinggi ({portfolios[best_method]['sharpe']:.3f})."
        )
    elif trend == MarketTrend.BEARISH:
        best_method = min(portfolios, key=lambda x: portfolios[x]["risiko"])
        alasan = (
            f"IHSG diprediksi TURUN → prioritas perlindungan modal. "
            f"{best_method} memiliki risiko terendah ({portfolios[best_method]['risiko']*100:.1f}%)."
        )
    else:
        max_sharpe = max(p["sharpe"] for p in portfolios.values()) or 1
        min_risk   = min(p["risiko"] for p in portfolios.values())
        max_risk   = max(p["risiko"] for p in portfolios.values())
        scores = {
            name: 0.6 * (p["sharpe"] / max_sharpe) +
                  0.4 * (1 - (p["risiko"] - min_risk) / (max_risk - min_risk + 1e-10))
            for name, p in portfolios.items()
        }
        best_method = max(scores, key=lambda x: scores[x])
        alasan = (
            f"IHSG diprediksi SIDEWAYS → keseimbangan risk & return. "
            f"{best_method} memiliki skor gabungan tertinggi ({scores[best_method]:.3f})."
        )

    return PortfolioResponse(
        prediksi_ihsg=ihsg_pred_response,
        metode_terbaik=best_method,
        alasan_pemilihan=alasan,
        semua_metode=[mvep_detail, sim_detail, capm_detail],
        periode_data=f"{start_date} → {end_date}",
        timestamp=datetime.datetime.now().isoformat(),
    )


# ────────────────────────────────────────────────────────────────
# ENDPOINT 4 — Info API
# ────────────────────────────────────────────────────────────────

@app.get("/", tags=["Utilitas"])
def root():
    """Informasi umum tentang API ini."""
    return {
        "nama":    "SmartInvest IHSG API",
        "versi":   "1.0.0",
        "deskripsi": (
            "REST API klasifikasi trend IHSG (BiLSTM+Attention) "
            "dan rekomendasi portofolio saham BEI (MVEP, SIM, CAPM)."
        ),
        "endpoints": {
            "GET  /health":                "Cek status API & model",
            "POST /predict/ihsg":          "Prediksi trend IHSG",
            "POST /recommend/portfolio":   "Rekomendasi portofolio saham",
            "GET  /docs":                  "Dokumentasi Swagger UI",
            "GET  /redoc":                 "Dokumentasi ReDoc",
        },
    }
