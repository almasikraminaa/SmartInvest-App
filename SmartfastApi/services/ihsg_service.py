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


# ==========================
# PATCHED LAYERS
# ==========================

class PatchedLSTM(LSTM):
    @classmethod
    def from_config(cls, config):
        # Fix recurrent_initializer jika berupa dict format Keras 2.x
        ri = config.get("recurrent_initializer")
        if isinstance(ri, dict):
            class_name = ri.get("class_name", "")
            if class_name == "Orthogonal":
                gain = ri.get("config", {}).get("gain", 1.0)
                config["recurrent_initializer"] = Orthogonal(gain=gain)
        return super().from_config(config)


class PatchedBidirectional(Bidirectional):
    @classmethod
    def from_config(cls, config):
        # Pastikan inner layer (LSTM) juga di-patch
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


class PatchedDense(Dense):
    def __init__(
        self,
        *args,
        quantization_config=None,
        **kwargs
    ):

        kwargs.pop(
            "quantization_config",
            None
        )

        super().__init__(
            *args,
            **kwargs
        )


class PatchedMultiHeadAttention(
    MultiHeadAttention
):
    def __init__(
        self,
        *args,
        use_gate=False,
        **kwargs
    ):

        kwargs.pop(
            "use_gate",
            None
        )

        super().__init__(
            *args,
            **kwargs
        )


class PatchedBatchNormalization(
    BatchNormalization
):
    def __init__(
        self,
        *args,
        renorm=False,
        renorm_clipping=None,
        renorm_momentum=0.99,
        **kwargs
    ):

        kwargs.pop(
            "renorm",
            None
        )

        kwargs.pop(
            "renorm_clipping",
            None
        )

        kwargs.pop(
            "renorm_momentum",
            None
        )

        super().__init__(
            *args,
            **kwargs
        )


# ==========================
# LOAD MODEL
# ==========================

model = keras.models.load_model(

    MODEL_PATH,

    compile=False,

    custom_objects={

        # LSTM (patch Orthogonal initializer)
        "LSTM":
            PatchedLSTM,

        "keras.layers.LSTM":
            PatchedLSTM,

        # Bidirectional (patch inner LSTM)
        "Bidirectional":
            PatchedBidirectional,

        "keras.layers.Bidirectional":
            PatchedBidirectional,

        # Dense
        "Dense":
            PatchedDense,

        "keras.layers.Dense":
            PatchedDense,

        "keras.src.layers.core.dense.Dense":
            PatchedDense,

        # MultiHeadAttention
        "MultiHeadAttention":
            PatchedMultiHeadAttention,

        "keras.layers.MultiHeadAttention":
            PatchedMultiHeadAttention,

        "keras.src.layers.attention.multi_head_attention.MultiHeadAttention":
            PatchedMultiHeadAttention,

        # BatchNormalization
        "BatchNormalization":
            PatchedBatchNormalization,

        "keras.layers.BatchNormalization":
            PatchedBatchNormalization,

        "keras.src.layers.normalization.batch_normalization.BatchNormalization":
            PatchedBatchNormalization
    },

    safe_mode=False
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