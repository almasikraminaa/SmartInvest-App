import keras
import tensorflow as tf
import joblib
import pandas as pd
import numpy as np
import zipfile
import json

from pathlib import Path

from services.genai_service import (
    generate_market_summary
)

# ==========================
# PATH
# ==========================

BASE_DIR = (
    Path(__file__)
    .resolve()
    .parent.parent
)

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "ihsg_best_model_3class.keras"
)

SCALER_PATH = (
    BASE_DIR
    / "assets"
    / "ihsg_scaler_global.pkl"
)

DATA_PATH = (
    BASE_DIR
    / "data"
    / "market_price_ihsg.csv"
)


# ==============================================================================
# SAFE LOAD MODEL FOR .keras FORMAT (ZIP CONFIG CLEANER VIA OFFICIAL API)
# ==============================================================================

def safe_load_ihsg_model(model_path):
    """
    Membuka file .keras (zip), membaca config.json, membersihkan parameter 
    lama yang tidak kompatibel, mendeserialisasi struktur model, dan memuat bobotnya.
    """
    with zipfile.ZipFile(model_path, "r") as z:
        config_bytes = z.read("config.json")
        config_dict = json.loads(config_bytes.decode("utf-8"))

    def clean_config(node):
        if isinstance(node, dict):
            # Hapus seluruh parameter pengganggu warisan Keras 2 secara rekursif
            node.pop("quantization_config", None)
            node.pop("use_gate", None)
            node.pop("renorm", None)
            node.pop("renorm_clipping", None)
            node.pop("renorm_momentum", None)
            for k, v in list(node.items()):
                clean_config(v)
        elif isinstance(node, list):
            for item in node:
                clean_config(item)

    clean_config(config_dict)
    
    # Rekonstruksi arsitektur model dari konfigurasi yang sudah steril
    model = keras.saving.deserialize_keras_object(config_dict)
    
    # Muat bobot (weights) secara native langsung dari file .keras asli
    model.load_weights(model_path)
    return model


# ==========================
# LOAD MODEL EXECUTION
# ==========================

# Eksekusi pemuatan model IHSG menggunakan sanitizer aman kita
model = safe_load_ihsg_model(str(MODEL_PATH))

scaler = joblib.load(
    SCALER_PATH
)

ihsg_data = pd.read_csv(
    DATA_PATH,
    index_col=0,
    parse_dates=True
)


# ==========================
# FEATURE ENGINEERING
# ==========================

def build_ihsg_features(df):
    df = df.copy()
    close_col = df.columns[0]

    df["Return"] = df[close_col].pct_change()
    df["MA20"] = df[close_col].rolling(20).mean()
    df["MA50"] = df[close_col].rolling(50).mean()
    df["Volatilitas"] = df["Return"].rolling(20).std()
    df["Volume_Log"] = 0
    df["RSI"] = 50
    df["MACD"] = df["MA20"] - df["MA50"]
    df["MA_Gap"] = (df["MA20"] - df["MA50"]) / (df["MA50"] + 1e-10)
    df["BB_Width"] = df["Return"].rolling(20).std()
    df["ROC5"] = df[close_col].pct_change(5)
    df["Trend_Strength"] = df["MA_Gap"].abs()

    return df.dropna()


# ==========================
# PREDICT IHSG
# ==========================

def predict_ihsg():
    feature_cols = [
        "Return", "MA20", "MA50", "Volatilitas", "Volume_Log",
        "RSI", "MACD", "MA_Gap", "BB_Width", "ROC5", "Trend_Strength"
    ]
    time_steps = 15

    df = build_ihsg_features(ihsg_data)
    X_scaled = scaler.transform(df[feature_cols].values)
    X_pred = X_scaled[-time_steps:].reshape(1, time_steps, len(feature_cols))

    prediction = model.predict(X_pred, verbose=0)[0]
    idx = int(np.argmax(prediction))

    labels = ["Bearish", "Sideways", "Bullish"]
    trend = labels[idx]
    confidence = round(float(prediction[idx]), 4)

    # ==========================
    # METHOD RECOMMENDATION
    # ==========================

    if trend == "Bullish":
        recommended_method = "SIM"
        market_condition = "Pasar sedang bullish"
        reason = "SIM lebih optimal untuk momentum pasar naik."
    elif trend == "Bearish":
        recommended_method = "CAPM"
        market_condition = "Pasar sedang bearish"
        reason = "CAPM lebih cocok untuk defensif di kondisi pasar menurun."
    else:
        recommended_method = "MVEP"
        market_condition = "Pasar sideways"
        reason = "MVEP membantu optimasi risk-return saat pasar stabil."

    # ==========================
    # GENAI MARKET SUMMARY
    # ==========================

    market_summary = generate_market_summary(
        market_trend=trend,
        confidence=confidence,
        market_condition=market_condition,
        recommended_method=recommended_method,
        reason=reason
    )

    return {
        "market_trend": trend,
        "confidence": confidence,
        "prediction_class": idx,
        "recommended_method": recommended_method,
        "market_condition": market_condition,
        "reason": reason,
        "market_summary": market_summary
    }
