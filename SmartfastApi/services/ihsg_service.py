import keras
import tensorflow as tf
import joblib
import pandas as pd
import numpy as np
import json
import zipfile

from pathlib import Path

from services.genai_service import (
    generate_market_summary
)
from keras.layers import (
    Dense,
    MultiHeadAttention,
    BatchNormalization,
    LSTM,
    Bidirectional
)
from keras.initializers import Orthogonal


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
        self.activation = (
            keras.activations.get(
                activation
            )
        )

        self.l2_reg = l2_reg

    def build(
        self,
        input_shape
    ):
        self.w = (
            self.add_weight(
                shape=(
                    input_shape[-1],
                    self.units
                ),
                initializer=
                "random_normal",
                regularizer=
                keras.regularizers.l2(
                    self.l2_reg
                ),
                trainable=True
            )
        )

        self.b = (
            self.add_weight(
                shape=(self.units,),
                initializer="zeros",
                trainable=True
            )
        )

    def call(
        self,
        inputs
    ):
        result = (
            tf.matmul(
                inputs,
                self.w
            )
            + self.b
        )

        return (
            self.activation(
                result
            )
            if self.activation
            else result
        )

    def get_config(
        self
    ):
        config = (
            super()
            .get_config()
        )

        config.update({
            "units":
                self.units,

            "activation":
                keras.activations.serialize(
                    self.activation
                ),

            "l2_reg":
                self.l2_reg
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
# REGISTER PATCHED LAYERS OFFICIALLY IN KERAS 3 ENVIRONMENT
# ==============================================================================

@keras.saving.register_keras_serializable(package="Patch")
class PatchedLSTM(keras.layers.LSTM):
    @classmethod
    def from_config(cls, config):
        ri = config.get("recurrent_initializer")
        if isinstance(ri, dict):
            class_name = ri.get("class_name", "")
            if class_name == "Orthogonal":
                gain = ri.get("config", {}).get("gain", 1.0)
                config["recurrent_initializer"] = Orthogonal(gain=gain)
        return super().from_config(config)

@keras.saving.register_keras_serializable(package="Patch")
class PatchedBidirectional(keras.layers.Bidirectional):
    @classmethod
    def from_config(cls, config):
        inner = config.get("layer", {})
        if isinstance(inner, dict):
            inner_config = inner.get("config", {})
            ri = inner_config.get("recurrent_initializer")
            if isinstance(ri, dict) and ri.get("class_name") == "Orthogonal":
                gain = ri.get("config", {}).get("gain", 1.0)
                inner_config["recurrent_initializer"] = {
                    "class_name": "Orthogonal",
                    "config": {"gain": gain, "seed": None}
                }
        return super().from_config(config)

@keras.saving.register_keras_serializable(package="Patch")
class PatchedDense(keras.layers.Dense):
    @classmethod
    def from_config(cls, config):
        config.pop("quantization_config", None)
        return super().from_config(config)

@keras.saving.register_keras_serializable(package="Patch")
class PatchedMultiHeadAttention(keras.layers.MultiHeadAttention):
    @classmethod
    def from_config(cls, config):
        config.pop("use_gate", None)
        config.pop("seed", None)
        return super().from_config(config)

@keras.saving.register_keras_serializable(package="Patch")
class PatchedBatchNormalization(keras.layers.BatchNormalization):
    @classmethod
    def from_config(cls, config):
        config.pop("renorm", None)
        config.pop("renorm_clipping", None)
        config.pop("renorm_momentum", None)
        return super().from_config(config)


# ==============================================================================
# DYNAMIC JSON CONTEXT INJECTOR (SAFE LOAD METHOD FOR .keras ZIP)
# ==============================================================================
def safe_load_model(model_path):
    """
    Membuka arsip zip format .keras, memodifikasi config.json secara langsung di memori
    untuk mengalihkan layer standar Keras 2 ke kelas Patch Keras 3 kita.
    """
    try:
        # Bongkar berkas arsitektur config JSON bawaan zip model .keras
        with zipfile.ZipFile(model_path, 'r') as z:
            config_bytes = z.read('config.json')
            config_json = json.loads(config_bytes.decode('utf-8'))

        # Fungsi rekursif untuk mencari dan mengalihkan class_name layer standar
        def patch_nodes(node):
            if isinstance(node, dict):
                if 'class_name' in node:
                    cname = node['class_name']
                    if cname == 'Dense' and node.get('config', {}).get('name') == 'output':
                        node['class_name'] = 'Patch>PatchedDense'
                    elif cname == 'MultiHeadAttention':
                        node['class_name'] = 'Patch>PatchedMultiHeadAttention'
                    elif cname == 'BatchNormalization':
                        node['class_name'] = 'Patch>PatchedBatchNormalization'
                    elif cname == 'LSTM':
                        node['class_name'] = 'Patch>PatchedLSTM'
                    elif cname == 'Bidirectional':
                        node['class_name'] = 'Patch>PatchedBidirectional'
                for k, v in node.items():
                    patch_nodes(v)
            elif isinstance(node, list):
                for item in node:
                    patch_nodes(item)

        patch_nodes(config_json)

        # Rekonstruksi arsitektur model menggunakan Keras 3 deserializer murni
        return keras.saving.deserialize_keras_object(config_json)
    except Exception as e:
        print(f"[Fallback] Gagal menginjeksi konteks JSON, menggunakan standard loader: {e}")
        return keras.models.load_model(model_path, compile=False)


# ==========================
# LOAD MODEL EXECUTION
# ==========================

# Membaca model menggunakan injector dinamis aman milik kita
model = safe_load_model(str(MODEL_PATH))

# Memuat bobot internal dari biner berkas model asli (.keras) jika dibutuhkan
try:
    model.load_weights(str(MODEL_PATH))
except Exception:
    pass

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

    df["Return"] = (
        df[close_col]
        .pct_change()
    )

    df["MA20"] = (
        df[close_col]
        .rolling(20)
        .mean()
    )

    df["MA50"] = (
        df[close_col]
        .rolling(50)
        .mean()
    )

    df["Volatilitas"] = (
        df["Return"]
        .rolling(20)
        .std()
    )

    df["Volume_Log"] = 0
    df["RSI"] = 50

    df["MACD"] = (
        df["MA20"]
        - df["MA50"]
    )

    df["MA_Gap"] = (
        df["MA20"]
        - df["MA50"]
    ) / (
        df["MA50"]
        + 1e-10
    )

    df["BB_Width"] = (
        df["Return"]
        .rolling(20)
        .std()
    )

    df["ROC5"] = (
        df[close_col]
        .pct_change(5)
    )

    df["Trend_Strength"] = (
        df["MA_Gap"]
        .abs()
    )

    return df.dropna()


# ==========================
# PREDICT IHSG
# ==========================

def predict_ihsg():

    feature_cols = [
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
        "Trend_Strength"
    ]

    time_steps = 15

    df = build_ihsg_features(
        ihsg_data
    )

    X_scaled = (
        scaler.transform(
            df[
                feature_cols
            ].values
        )
    )

    X_pred = (
        X_scaled[
            -time_steps:
        ].reshape(
            1,
            time_steps,
            len(feature_cols)
        )
    )

    prediction = (
        model.predict(
            X_pred,
            verbose=0
        )[0]
    )

    idx = int(
        np.argmax(
            prediction
        )
    )

    labels = [
        "Bearish",
        "Sideways",
        "Bullish"
    ]

    trend = labels[idx]

    confidence = round(
        float(
            prediction[idx]
        ),
        4
    )

    # ==========================
    # METHOD RECOMMENDATION
    # ==========================

    if trend == "Bullish":

        recommended_method = "SIM"

        market_condition = (
            "Pasar sedang bullish"
        )

        reason = (
            "SIM lebih optimal "
            "untuk momentum "
            "pasar naik."
        )

    elif trend == "Bearish":

        recommended_method = "CAPM"

        market_condition = (
            "Pasar sedang bearish"
        )

        reason = (
            "CAPM lebih cocok "
            "untuk defensif "
            "di kondisi pasar "
            "menurun."
        )

    else:

        recommended_method = "MVEP"

        market_condition = (
            "Pasar sideways"
        )

        reason = (
            "MVEP membantu "
            "optimasi risk-return "
            "saat pasar stabil."
        )

    # ==========================
    # GENAI MARKET SUMMARY
    # ==========================

    market_summary = (
        generate_market_summary(
            market_trend=trend,
            confidence=confidence,
            market_condition=market_condition,
            recommended_method=recommended_method,
            reason=reason
        )
    )

    return {

        "market_trend":
            trend,

        "confidence":
            confidence,

        "prediction_class":
            idx,

        "recommended_method":
            recommended_method,

        "market_condition":
            market_condition,

        "reason":
            reason,

        "market_summary":
            market_summary
    }
