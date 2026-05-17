import keras
import joblib
import numpy as np
import pandas as pd
import tensorflow as tf

from pathlib import Path

# ==========================
# CUSTOM LAYER
# ==========================

@keras.saving.register_keras_serializable(
    package="CustomLayers"
)
class CustomDenseMaju(
    keras.layers.Layer
):
    def __init__(
        self,
        units=32,
        activation=None,
        l2_reg=0.001,
        **kwargs
    ):
        super().__init__(**kwargs)
        self.units = units
        self.activation = keras.activations.get(activation)
        self.l2_reg = l2_reg

    def build(
        self,
        input_shape
    ):
        self.w = self.add_weight(
            name="kernel",
            shape=(input_shape[-1], self.units),
            initializer="random_normal",
            regularizer=keras.regularizers.l2(self.l2_reg),
            trainable=True
        )
        self.b = self.add_weight(
            name="bias",
            shape=(self.units,),
            initializer="zeros",
            trainable=True
        )

    def call(
        self,
        inputs
    ):
        result = tf.matmul(inputs, self.w) + self.b
        return self.activation(result) if self.activation else result

    def get_config(self):
        config = super().get_config()
        config.update({
            "units": self.units,
            "activation": keras.activations.serialize(self.activation),
            "l2_reg": self.l2_reg
        })
        return config


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
    / "smartinvest_best_model_3class.h5"
)

SCALER_PATH = (
    BASE_DIR
    / "assets"
    / "smartinvest_scaler_global.pkl"
)

DATA_PATH = (
    BASE_DIR
    / "data"
    / "clean_master_stock_data.csv"
)


# ==============================================================================
# SAKTI REGISTRY PATCH FOR KERAS 3 INTERCEPT ENGINE
# ==============================================================================

OriginalDense = keras.layers.Dense
OriginalMHA = keras.layers.MultiHeadAttention
OriginalBN = keras.layers.BatchNormalization

class PatchedDense(OriginalDense):
    @classmethod
    def from_config(cls, config):
        config.pop("quantization_config", None)
        return super().from_config(config)

class PatchedMultiHeadAttention(OriginalMHA):
    @classmethod
    def from_config(cls, config):
        config.pop("use_gate", None)
        config.pop("seed", None)
        return super().from_config(config)

class PatchedBatchNormalization(OriginalBN):
    @classmethod
    def from_config(cls, config):
        config.pop("renorm", None)
        config.pop("renorm_clipping", None)
        config.pop("renorm_momentum", None)
        return super().from_config(config)

# Suntikkan paksa ke memori runtime Keras 3 core
keras.layers.Dense = PatchedDense
keras.layers.MultiHeadAttention = PatchedMultiHeadAttention
keras.layers.BatchNormalization = PatchedBatchNormalization

if hasattr(keras, "src"):
    import keras.src.legacy.saving.serialization as legacy_serialization
    if hasattr(legacy_serialization, "legacy_custom_objects"):
        legacy_serialization.legacy_custom_objects["Dense"] = PatchedDense
        legacy_serialization.legacy_custom_objects["MultiHeadAttention"] = PatchedMultiHeadAttention
        legacy_serialization.legacy_custom_objects["BatchNormalization"] = PatchedBatchNormalization


# ==========================
# LOAD MODEL EXECUTION
# ==========================

model = tf.keras.models.load_model(
    str(MODEL_PATH),
    compile=False,
    custom_objects={
        "CustomDenseMaju": CustomDenseMaju,
        "CustomLayers>CustomDenseMaju": CustomDenseMaju,
        "Dense": PatchedDense,
        "MultiHeadAttention": PatchedMultiHeadAttention,
        "BatchNormalization": PatchedBatchNormalization
    }
)

scaler = joblib.load(
    SCALER_PATH
)


# ==========================
# LOAD DATA
# ==========================

stock_data = pd.read_csv(
    DATA_PATH
)

stock_data["Date"] = pd.to_datetime(
    stock_data["Date"]
)


# ==========================
# CONFIG
# ==========================

FITUR_COLS = [
    "Return", "MA20", "MA50", "Volatilitas", "Volume_Log",
    "RSI", "MACD", "MA_Gap", "BB_Width", "ROC5", "Trend_Strength"
]

TIME_STEPS = 15


# ==========================
# FEATURE ENGINEERING
# ==========================

def build_features(df):
    df = df.copy()

    df["Return"] = df["Close"].pct_change()
    df["MA20"] = df["Close"].rolling(20).mean()
    df["MA50"] = df["Close"].rolling(50).mean()
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
    upper_band = df["MA20"] + (2 * rolling_std)
    lower_band = df["MA20"] - (2 * rolling_std)
    df["BB_Width"] = (upper_band - lower_band) / (df["MA20"] + 1e-10)

    df["ROC5"] = df["Close"].pct_change(5)
    df["Trend_Strength"] = df["MA_Gap"].abs()

    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.dropna(inplace=True)

    return df


# ==========================
# PREDICT STOCK TREND
# ==========================

def predict_stock_trend(ticker):
    try:
        ticker_data = stock_data[stock_data["Ticker"] == ticker].sort_values(by="Date")
        feature_df = build_features(ticker_data)

        if len(feature_df) < TIME_STEPS:
            return {
                "trend": "Unknown",
                "confidence": 0,
                "recommendation": "NO_DATA"
            }

        last_features = feature_df[FITUR_COLS].tail(TIME_STEPS).values
        scaled = scaler.transform(last_features)
        final_input = scaled.reshape(1, TIME_STEPS, len(FITUR_COLS))

        prediction = model.predict(final_input, verbose=0)[0]
        idx = int(np.argmax(prediction))

        labels = ["Bearish", "Sideways", "Bullish"]
        recommendations = ["AVOID", "HOLD", "BUY"]

        return {
            "trend": labels[idx],
            "confidence": round(float(np.max(prediction)), 4),
            "recommendation": recommendations[idx]
        }

    except Exception as e:
        return {
            "trend": "Error",
            "confidence": 0,
            "recommendation": str(e)
        }
