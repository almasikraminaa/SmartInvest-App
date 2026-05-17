import keras
import tensorflow as tf
import joblib
import pandas as pd
import numpy as np

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
# SAKTI LEGACY PATCH UNTUK PURE BINER .keras (BYPASS VIA LEGACY LOADER)
# ==============================================================================

OriginalMHA = keras.layers.MultiHeadAttention
OriginalBN = keras.layers.BatchNormalization
OriginalDense = keras.layers.Dense
OriginalLSTM = keras.layers.LSTM
OriginalBiDir = keras.layers.Bidirectional

class PatchedLSTM(OriginalLSTM):
    @classmethod
    def from_config(cls, config):
        ri = config.get("recurrent_initializer")
        if isinstance(ri, dict):
            class_name = ri.get("class_name", "")
            if class_name == "Orthogonal":
                gain = ri.get("config", {}).get("gain", 1.0)
                config["recurrent_initializer"] = Orthogonal(gain=gain)
        return super().from_config(config)

class PatchedBidirectional(OriginalBiDir):
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

# Paksa timpa standard layer Keras di memori runtime
keras.layers.LSTM = PatchedLSTM
keras.layers.Bidirectional = PatchedBidirectional
keras.layers.Dense = PatchedDense
keras.layers.MultiHeadAttention = PatchedMultiHeadAttention
keras.layers.BatchNormalization = PatchedBatchNormalization

if hasattr(keras, "src"):
    keras.src.layers.LSTM = PatchedLSTM
    keras.src.layers.Bidirectional = PatchedBidirectional
    keras.src.layers.Dense = PatchedDense
    keras.src.layers.core.dense.Dense = PatchedDense
    keras.src.layers.MultiHeadAttention = PatchedMultiHeadAttention
    keras.src.layers.attention.multi_head_attention.MultiHeadAttention = PatchedMultiHeadAttention
    keras.src.layers.BatchNormalization = PatchedBatchNormalization
    keras.src.layers.normalization.batch_normalization.BatchNormalization = PatchedBatchNormalization
    
    # INTERCEPT REGISTRY UTAMA UNTUK PARSER LEGACY SAVING BINARY FILE
    import keras.src.legacy.saving.serialization as legacy_serialization
    if hasattr(legacy_serialization, "legacy_custom_objects"):
        legacy_serialization.legacy_custom_objects["LSTM"] = PatchedLSTM
        legacy_serialization.legacy_custom_objects["Bidirectional"] = PatchedBidirectional
        legacy_serialization.legacy_custom_objects["Dense"] = PatchedDense
        legacy_serialization.legacy_custom_objects["MultiHeadAttention"] = PatchedMultiHeadAttention
        legacy_serialization.legacy_custom_objects["BatchNormalization"] = PatchedBatchNormalization


# ==========================
# LOAD MODEL EXECUTION
# ==========================

model = keras.models.load_model(
    str(MODEL_PATH),
    compile=False,
    custom_objects={
        "CustomDenseMaju": CustomDenseMaju,
        "CustomLayers>CustomDenseMaju": CustomDenseMaju,
        "LSTM": PatchedLSTM,
        "Bidirectional": PatchedBidirectional,
        "Dense": PatchedDense,
        "MultiHeadAttention": PatchedMultiHeadAttention,
        "BatchNormalization": PatchedBatchNormalization,
        "Orthogonal": Orthogonal,
        "keras.initializers.Orthogonal": Orthogonal
    }
)

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
