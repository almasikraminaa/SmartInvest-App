"""
SmartInvest AI Recommendation API
---------------------------------
Backend sederhana untuk:
1. Mengambil data saham dari Yahoo Finance
2. Memprediksi kondisi IHSG: bullish / sideways / bearish
3. Menghitung portofolio MVEP, SIM, dan CAPM
4. Memilih metode terbaik memakai composite scoring
5. Menghasilkan ringkasan rekomendasi untuk user

Catatan penting:
- MVEP TIDAK memakai alpha dan beta.
- Alpha dan beta hanya digunakan untuk SIM dan CAPM.
- Jika model TensorFlow/scaler tidak tersedia, sistem memakai fallback MA20 vs MA50.
"""

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional, Any

import os
import warnings

import joblib
import numpy as np
import pandas as pd
import yfinance as yf
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from scipy.optimize import minimize

warnings.filterwarnings("ignore")

try:
    import tensorflow as tf
except Exception:
    tf = None


# ================================================================
# APP CONFIG
# ================================================================

app = FastAPI(
    title="SmartInvest AI Recommendation API",
    description="API rekomendasi portofolio MVEP, SIM, dan CAPM berbasis klasifikasi IHSG.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ================================================================
# ENUMS & DATA CLASSES
# ================================================================

class MarketTrend(Enum):
    BULLISH = "bullish"
    BEARISH = "bearish"
    SIDEWAYS = "sideways"


@dataclass
class PortfolioResult:
    method: str
    expected_return: float
    risk_std: float
    sharpe_ratio: float = field(init=False)
    allocations: Dict[str, float] = field(default_factory=dict)
    beta: Optional[float] = None
    alpha: Optional[float] = None
    treynor_ratio: Optional[float] = None

    def __post_init__(self):
        self.sharpe_ratio = 0.0


# ================================================================
# REQUEST SCHEMA
# ================================================================

class RecommendationRequest(BaseModel):
    tickers: List[str] = Field(
        default=["BBCA.JK", "BBRI.JK", "BMRI.JK", "TLKM.JK", "ASII.JK", "UNVR.JK"],
        description="Daftar ticker saham Yahoo Finance.",
    )
    investment_amount: float = Field(
        default=10_000_000,
        description="Nominal dana investasi dalam rupiah.",
    )
    bi_rate: float = Field(
        default=6.0,
        description="BI Rate dalam persen. Contoh: 6.0 berarti 6%.",
    )
    start_date: str = Field(
        default="2023-01-01",
        description="Tanggal awal data historis, format YYYY-MM-DD.",
    )
    end_date: str = Field(
        default="2024-01-01",
        description="Tanggal akhir data historis, format YYYY-MM-DD.",
    )
    model_path: str = Field(
        default="ihsg_best_model_3class.keras",
        description="Path model klasifikasi IHSG.",
    )
    scaler_path: str = Field(
        default="ihsg_scaler_global.pkl",
        description="Path scaler model IHSG.",
    )


# ================================================================
# HELPER FORMAT
# ================================================================

def rupiah(value: float) -> str:
    return "Rp{:,.0f}".format(value).replace(",", ".")


def safe_float(value: Any) -> Optional[float]:
    if value is None:
        return None
    try:
        value = float(value)
        if not np.isfinite(value):
            return None
        return value
    except Exception:
        return None


# ================================================================
# IHSG CLASSIFICATION
# ================================================================

def build_ihsg_features(ihsg_prices: pd.Series) -> pd.DataFrame:
    df = ihsg_prices.to_frame(name="Close")
    df["Return"] = df["Close"].pct_change()
    df["MA20"] = df["Close"].rolling(window=20).mean()
    df["MA50"] = df["Close"].rolling(window=50).mean()
    df["Volatilitas"] = df["Return"].rolling(window=20).std()
    df["Volume_Log"] = 0.0

    # Tambahan fitur jika scaler/model lama memakai 10 fitur
    df["MA10"] = df["Close"].rolling(window=10).mean()
    df["MA_ratio"] = df["MA20"] / df["MA50"] - 1
    df["Momentum_5"] = df["Close"].pct_change(5)
    df["Momentum_10"] = df["Close"].pct_change(10)
    df["Volatility_10"] = df["Return"].rolling(window=10).std()

    return df.dropna()


def fallback_classification(ihsg_prices: pd.Series):
    if len(ihsg_prices) < 50:
        return MarketTrend.SIDEWAYS, 0.50, 1

    ma20 = ihsg_prices.rolling(20).mean()
    ma50 = ihsg_prices.rolling(50).mean()

    current_price = ihsg_prices.iloc[-1]
    ma50_val = ma50.iloc[-1]

    pct_from_ma50 = (current_price - ma50_val) / ma50_val

    if pct_from_ma50 > 0.03:
        trend = MarketTrend.BULLISH
        confidence = min(0.85, 0.60 + pct_from_ma50 * 5)
    elif pct_from_ma50 < -0.03:
        trend = MarketTrend.BEARISH
        confidence = min(0.85, 0.60 + abs(pct_from_ma50) * 5)
    else:
        trend = MarketTrend.SIDEWAYS
        confidence = 0.60

    pred_class = 1 if trend == MarketTrend.SIDEWAYS else (2 if trend == MarketTrend.BULLISH else 0)
    return trend, float(confidence), pred_class


def predict_ihsg_trend(
    ihsg_prices: pd.Series,
    model_path: str = "ihsg_best_model_3class.keras",
    scaler_path: str = "ihsg_scaler_global.pkl",
    time_steps: int = 10,
):
    if tf is None:
        return fallback_classification(ihsg_prices)

    if not os.path.exists(model_path) or not os.path.exists(scaler_path):
        return fallback_classification(ihsg_prices)

    try:
        model = tf.keras.models.load_model(model_path, compile=False)
        scaler = joblib.load(scaler_path)

        df = build_ihsg_features(ihsg_prices)

        if hasattr(scaler, "n_features_in_"):
            n_features = scaler.n_features_in_
        else:
            n_features = 5

        if n_features == 5:
            feature_cols = ["Return", "MA20", "MA50", "Volatilitas", "Volume_Log"]
        else:
            feature_cols = [
                "Return", "MA20", "MA50", "Volatilitas", "Volume_Log",
                "MA10", "MA_ratio", "Momentum_5", "Momentum_10", "Volatility_10"
            ][:n_features]

        if len(df) < time_steps:
            return fallback_classification(ihsg_prices)

        X_scaled = scaler.transform(df[feature_cols].values)
        X_pred = X_scaled[-time_steps:].reshape(1, time_steps, len(feature_cols))

        predictions = model.predict(X_pred, verbose=0)[0]
        pred_class = int(np.argmax(predictions))
        confidence = float(predictions[pred_class])

        if pred_class == 2:
            trend = MarketTrend.BULLISH
        elif pred_class == 0:
            trend = MarketTrend.BEARISH
        else:
            trend = MarketTrend.SIDEWAYS

        return trend, confidence, pred_class

    except Exception:
        return fallback_classification(ihsg_prices)


# ================================================================
# PORTFOLIO METHODS
# ================================================================

def optimize_mvep(mean_returns, cov_matrix, rf=0.06):
    """MVEP - Mean Variance Efficient Portfolio dengan objektif maximum Sharpe."""
    n = len(mean_returns)

    def neg_sharpe(w):
        port_return = np.dot(w, mean_returns)
        port_risk = np.sqrt(w @ cov_matrix @ w) if w @ cov_matrix @ w > 0 else 0.01
        return -(port_return - rf) / port_risk if port_risk > 0 else -np.inf

    constraints = ({"type": "eq", "fun": lambda w: np.sum(w) - 1})
    bounds = tuple((0, 1) for _ in range(n))
    start_weight = np.ones(n) / n

    result = minimize(
        neg_sharpe,
        start_weight,
        method="SLSQP",
        bounds=bounds,
        constraints=constraints,
        options={"maxiter": 1000},
    )

    if result.success:
        return result.x

    return start_weight


def compute_sim_weights(returns: pd.DataFrame, rf=0.06):
    """SIM - Single Index Model berbasis proxy market dari rata-rata return saham."""
    market = returns.mean(axis=1)

    betas = []
    alphas = []
    residual_var = []

    for col in returns.columns:
        cov = np.cov(returns[col], market)[0, 1]
        var = np.var(market)
        beta = cov / var if var > 0 else 1.0
        alpha = returns[col].mean() - beta * market.mean()
        residual = returns[col] - (alpha + beta * market)
        resid_var = np.var(residual)

        betas.append(beta)
        alphas.append(alpha)
        residual_var.append(resid_var)

    betas = np.array(betas)
    alphas = np.array(alphas)
    residual_var = np.array(residual_var)

    erb = (alphas - rf) / betas
    erb = np.maximum(erb, 0)

    raw_weights = erb / np.where(residual_var == 0, np.nan, residual_var)
    raw_weights = np.nan_to_num(raw_weights, nan=0.0, posinf=0.0, neginf=0.0)

    if raw_weights.sum() > 0:
        weights = raw_weights / raw_weights.sum()
    else:
        weights = np.ones(len(returns.columns)) / len(returns.columns)

    return weights, betas, alphas


def compute_capm_weights(returns: pd.DataFrame):
    """CAPM sederhana berbasis beta saham."""
    market = returns.mean(axis=1)

    betas = []
    alphas = []

    for col in returns.columns:
        cov = np.cov(returns[col], market)[0, 1]
        var = np.var(market)
        beta = cov / var if var > 0 else 1.0
        alpha = returns[col].mean() - beta * market.mean()

        betas.append(beta)
        alphas.append(alpha)

    betas = np.array(betas)
    alphas = np.array(alphas)

    beta_safe = np.where(betas <= 0, np.nan, betas)
    raw_weights = 1 / beta_safe
    raw_weights = np.nan_to_num(raw_weights, nan=0.0, posinf=0.0, neginf=0.0)

    if raw_weights.sum() > 0:
        weights = raw_weights / raw_weights.sum()
    else:
        weights = np.ones(len(returns.columns)) / len(returns.columns)

    return weights, betas, alphas


def calculate_portfolio_alpha_beta(weights, stock_returns, market_returns):
    """Alpha dan beta portofolio terhadap IHSG. Dipakai hanya untuk SIM dan CAPM."""
    portfolio_returns = stock_returns.dot(weights)

    common_idx = portfolio_returns.index.intersection(market_returns.index)
    portfolio_returns = portfolio_returns.loc[common_idx]
    market_returns = market_returns.loc[common_idx]

    market_var = np.var(market_returns)
    beta = np.cov(portfolio_returns, market_returns)[0, 1] / market_var if market_var > 0 else 1.0

    alpha_daily = portfolio_returns.mean() - beta * market_returns.mean()
    alpha_annual = alpha_daily * 252

    return float(beta), float(alpha_annual)


# ================================================================
# COMPOSITE SCORING
# ================================================================

def minmax_score(metric_dict, higher_is_better=True):
    clean = {}

    for key, value in metric_dict.items():
        value = safe_float(value)
        clean[key] = value if value is not None else np.nan

    valid_values = [v for v in clean.values() if np.isfinite(v)]

    if len(valid_values) == 0:
        return {key: 0.5 for key in metric_dict}

    min_v, max_v = min(valid_values), max(valid_values)

    if np.isclose(max_v, min_v):
        return {key: 1.0 for key in metric_dict}

    scores = {}
    for key, value in clean.items():
        if not np.isfinite(value):
            scores[key] = 0.5
        else:
            raw = (value - min_v) / (max_v - min_v)
            scores[key] = raw if higher_is_better else 1 - raw

    return scores


def beta_suitability_score(beta_dict, market_trend):
    if market_trend == MarketTrend.BULLISH:
        target_beta = 1.10
    elif market_trend == MarketTrend.BEARISH:
        target_beta = 0.60
    else:
        target_beta = 0.90

    scores = {}
    for key, beta in beta_dict.items():
        beta = safe_float(beta)
        if beta is None:
            scores[key] = 0.5
        else:
            distance = abs(beta - target_beta)
            scores[key] = max(0.0, 1.0 - distance / 1.5)

    return scores


def composite_portfolio_scoring(portfolios, market_trend):
    returns = {name: p.expected_return for name, p in portfolios.items()}
    risks = {name: p.risk_std for name, p in portfolios.items()}
    sharpes = {name: p.sharpe_ratio for name, p in portfolios.items()}
    alphas = {name: p.alpha for name, p in portfolios.items()}
    betas = {name: p.beta for name, p in portfolios.items()}

    return_score = minmax_score(returns, higher_is_better=True)
    risk_score = minmax_score(risks, higher_is_better=False)
    sharpe_score = minmax_score(sharpes, higher_is_better=True)
    alpha_score = minmax_score(alphas, higher_is_better=True)
    beta_score = beta_suitability_score(betas, market_trend)

    # MVEP tidak memakai alpha-beta, maka diberi skor netral.
    if "MVEP" in portfolios:
        alpha_score["MVEP"] = 0.5
        beta_score["MVEP"] = 0.5

    if market_trend == MarketTrend.BULLISH:
        weights = {
            "return": 0.30,
            "risk": 0.15,
            "sharpe": 0.25,
            "alpha": 0.15,
            "beta": 0.15,
        }
        trend_reason = (
            "IHSG diprediksi naik, sehingga return dan Sharpe Ratio diberi bobot lebih besar."
        )
    elif market_trend == MarketTrend.BEARISH:
        weights = {
            "return": 0.15,
            "risk": 0.30,
            "sharpe": 0.20,
            "alpha": 0.15,
            "beta": 0.20,
        }
        trend_reason = (
            "IHSG diprediksi turun, sehingga risk dan beta diberi bobot lebih besar."
        )
    else:
        weights = {
            "return": 0.20,
            "risk": 0.25,
            "sharpe": 0.25,
            "alpha": 0.15,
            "beta": 0.15,
        }
        trend_reason = (
            "IHSG diprediksi stabil, sehingga penilaian dibuat lebih seimbang."
        )

    scores = {}
    score_details = {}

    for name in portfolios.keys():
        details = {
            "return_score": return_score[name],
            "risk_score": risk_score[name],
            "sharpe_score": sharpe_score[name],
            "alpha_score": alpha_score[name],
            "beta_score": beta_score[name],
        }

        total_score = (
            weights["return"] * details["return_score"]
            + weights["risk"] * details["risk_score"]
            + weights["sharpe"] * details["sharpe_score"]
            + weights["alpha"] * details["alpha_score"]
            + weights["beta"] * details["beta_score"]
        )

        scores[name] = float(total_score)
        score_details[name] = details

    return scores, score_details, weights, trend_reason


# ================================================================
# MAIN RECOMMENDATION
# ================================================================

def run_recommendation(
    tickers: List[str],
    investment_amount: float,
    bi_rate: float,
    start_date: str,
    end_date: str,
    model_path: str,
    scaler_path: str,
):
    rf_rate = bi_rate / 100

    all_symbols = tickers + ["^JKSE"]
    data = yf.download(all_symbols, start=start_date, end=end_date, progress=False, auto_adjust=False)

    if data.empty:
        raise ValueError("Data tidak berhasil diambil dari Yahoo Finance.")

    if isinstance(data.columns, pd.MultiIndex):
        close_data = data["Close"]
    else:
        close_data = data[["Close"]].rename(columns={"Close": all_symbols[0]})

    close_data = close_data.dropna()

    missing = [ticker for ticker in all_symbols if ticker not in close_data.columns]
    if missing:
        raise ValueError(f"Ticker tidak ditemukan atau datanya kosong: {missing}")

    stocks = close_data[tickers]
    ihsg = close_data["^JKSE"]

    returns = stocks.pct_change().dropna()
    ihsg_returns = ihsg.pct_change().dropna()

    common_idx = returns.index.intersection(ihsg_returns.index)
    returns = returns.loc[common_idx]
    ihsg_returns = ihsg_returns.loc[common_idx]

    if len(returns) < 60:
        raise ValueError("Data return kurang dari 60 hari. Perpanjang periode historis.")

    market_trend, confidence, pred_class = predict_ihsg_trend(
        ihsg_prices=ihsg,
        model_path=model_path,
        scaler_path=scaler_path,
    )

    cov_matrix = returns.cov() * 252
    mean_returns = returns.mean() * 252

    # ==================== MVEP ====================
    w_mvep = optimize_mvep(mean_returns.values, cov_matrix.values, rf=rf_rate)
    ret_mvep = np.dot(w_mvep, mean_returns.values)
    risk_mvep = np.sqrt(w_mvep @ cov_matrix.values @ w_mvep)
    sharpe_mvep = (ret_mvep - rf_rate) / risk_mvep if risk_mvep > 0 else 0

    mvep = PortfolioResult(
        method="MVEP",
        expected_return=float(ret_mvep),
        risk_std=float(risk_mvep),
        allocations={ticker: float(w_mvep[i]) for i, ticker in enumerate(tickers) if w_mvep[i] > 0.01},
        beta=None,
        alpha=None,
        treynor_ratio=None,
    )
    mvep.sharpe_ratio = float(sharpe_mvep)

    # ==================== SIM ====================
    w_sim, _, _ = compute_sim_weights(returns, rf=rf_rate)
    ret_sim = np.dot(w_sim, mean_returns.values)
    risk_sim = np.sqrt(w_sim @ cov_matrix.values @ w_sim)
    sharpe_sim = (ret_sim - rf_rate) / risk_sim if risk_sim > 0 else 0
    beta_sim, alpha_sim = calculate_portfolio_alpha_beta(w_sim, returns, ihsg_returns)

    sim = PortfolioResult(
        method="SIM",
        expected_return=float(ret_sim),
        risk_std=float(risk_sim),
        allocations={ticker: float(w_sim[i]) for i, ticker in enumerate(tickers) if w_sim[i] > 0.01},
        beta=float(beta_sim),
        alpha=float(alpha_sim),
        treynor_ratio=float((ret_sim - rf_rate) / beta_sim) if beta_sim > 0 else None,
    )
    sim.sharpe_ratio = float(sharpe_sim)

    # ==================== CAPM ====================
    w_capm, _, _ = compute_capm_weights(returns)
    ret_capm = np.dot(w_capm, mean_returns.values)
    risk_capm = np.sqrt(w_capm @ cov_matrix.values @ w_capm)
    sharpe_capm = (ret_capm - rf_rate) / risk_capm if risk_capm > 0 else 0
    beta_capm, alpha_capm = calculate_portfolio_alpha_beta(w_capm, returns, ihsg_returns)

    capm = PortfolioResult(
        method="CAPM",
        expected_return=float(ret_capm),
        risk_std=float(risk_capm),
        allocations={ticker: float(w_capm[i]) for i, ticker in enumerate(tickers) if w_capm[i] > 0.01},
        beta=float(beta_capm),
        alpha=float(alpha_capm),
        treynor_ratio=float((ret_capm - rf_rate) / beta_capm) if beta_capm > 0 else None,
    )
    capm.sharpe_ratio = float(sharpe_capm)

    portfolios = {"MVEP": mvep, "SIM": sim, "CAPM": capm}

    scores, score_details, scoring_weights, trend_reason = composite_portfolio_scoring(
        portfolios=portfolios,
        market_trend=market_trend,
    )

    best_method = max(scores.keys(), key=lambda name: scores[name])
    best = portfolios[best_method]

    potential_profit = investment_amount * best.expected_return
    potential_downside = investment_amount * best.risk_std

    trend_text_map = {
        0: "Turun",
        1: "Stabil",
        2: "Naik",
    }

    reason = (
        f"{trend_reason} Metode {best_method} dipilih karena memiliki skor akhir tertinggi "
        f"setelah membandingkan return, risk, Sharpe Ratio, alpha, beta, dan kondisi IHSG. "
        f"Untuk MVEP, alpha dan beta tidak digunakan karena MVEP berbasis mean-variance."
    )

    portfolios_payload = {}
    for method_name, portfolio in portfolios.items():
        portfolios_payload[method_name] = {
            "method": portfolio.method,
            "expected_return": portfolio.expected_return,
            "risk_std": portfolio.risk_std,
            "sharpe_ratio": portfolio.sharpe_ratio,
            "alpha": portfolio.alpha,
            "beta": portfolio.beta,
            "treynor_ratio": portfolio.treynor_ratio,
            "allocations": portfolio.allocations,
            "final_score": scores[method_name],
            "score_details": score_details[method_name],
        }

    user_summary = generate_user_summary(
        best=best,
        best_method=best_method,
        investment_amount=investment_amount,
        potential_profit=potential_profit,
        potential_downside=potential_downside,
        market_prediction=trend_text_map[pred_class],
        confidence=confidence,
        start_date=start_date,
        end_date=end_date,
        reason=reason,
    )

    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date,
        },
        "investment_amount": investment_amount,
        "ihsg_prediction": {
            "class_index": pred_class,
            "label": trend_text_map[pred_class],
            "trend": market_trend.value,
            "confidence": confidence,
        },
        "scoring_method": {
            "weights": scoring_weights,
            "trend_reason": trend_reason,
            "note": "MVEP tidak memakai alpha dan beta; alpha-beta hanya dipakai untuk SIM dan CAPM.",
        },
        "best_method": best_method,
        "reason": reason,
        "best_portfolio": portfolios_payload[best_method],
        "all_portfolios": portfolios_payload,
        "simulation": {
            "potential_profit": potential_profit,
            "potential_downside": potential_downside,
        },
        "user_summary": user_summary,
    }


def generate_user_summary(
    best: PortfolioResult,
    best_method: str,
    investment_amount: float,
    potential_profit: float,
    potential_downside: float,
    market_prediction: str,
    confidence: float,
    start_date: str,
    end_date: str,
    reason: str,
):
    allocation_text = ", ".join(
        [f"{ticker} {weight * 100:.1f}%" for ticker, weight in best.allocations.items()]
    )

    if not allocation_text:
        allocation_text = "alokasi terlalu kecil untuk ditampilkan satu per satu"

    summary = f"""👋 Hallo Sobat SmartInvest!

📊 SmartInvest menganalisis data historis periode {start_date} sampai {end_date}. Sistem membandingkan tiga metode portofolio, yaitu MVEP, SIM, dan CAPM, untuk mencari kombinasi yang paling sesuai dengan kondisi pasar.

🤖 Prediksi IHSG menunjukkan kondisi {market_prediction.upper()} dengan confidence {confidence:.1%}. Karena itu, sistem tidak hanya melihat return tertinggi, tetapi juga mempertimbangkan risiko dan kecocokan metode dengan kondisi IHSG.

🏆 Metode terbaik yang dipilih adalah {best_method}. Alasannya, metode ini memiliki skor gabungan paling baik setelah mempertimbangkan return, risk, Sharpe Ratio, alpha, beta, dan klasifikasi IHSG. Khusus MVEP, alpha dan beta tidak dipakai karena MVEP berbasis mean-variance.

💰 Dana investasi yang digunakan adalah {rupiah(investment_amount)}. Berdasarkan data historis, potensi keuntungan dan potensi penurunan dihitung dari expected return dan risiko portofolio terpilih.

- Expected Return: {best.expected_return * 100:.2f}%
- Risiko: {best.risk_std * 100:.2f}%
- Simulasi: potensi untung +{rupiah(potential_profit)} / potensi turun -{rupiah(potential_downside)}

📌 Komposisi saham: {allocation_text}. Semakin besar persentasenya, semakin besar porsi dana yang dialokasikan ke saham tersebut.

📈 Prediksi IHSG: {market_prediction.upper()} dengan confidence {confidence:.1%}

👉 Cek komposisi saham sebelum mulai investasi
👉 Perhatikan risiko, jangan hanya melihat return
👉 Gunakan hasil ini sebagai bahan pertimbangan, bukan keputusan tunggal

⚠️ Ini bukan jaminan keuntungan, hanya proyeksi berdasarkan data."""
    return summary


# ================================================================
# API ROUTES
# ================================================================

@app.get("/")
def home():
    return {
        "message": "SmartInvest AI Recommendation API aktif.",
        "docs": "/docs",
        "endpoint": "/recommendation",
    }


@app.post("/recommendation")
def recommendation(request: RecommendationRequest):
    result = run_recommendation(
        tickers=request.tickers,
        investment_amount=request.investment_amount,
        bi_rate=request.bi_rate,
        start_date=request.start_date,
        end_date=request.end_date,
        model_path=request.model_path,
        scaler_path=request.scaler_path,
    )
    return result


# ================================================================
# LOCAL TEST
# ================================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
