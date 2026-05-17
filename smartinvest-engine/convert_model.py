import keras
import tensorflow as tf
from keras.layers import MultiHeadAttention, BatchNormalization, Dense


# ==========================
# PATCHED LAYERS
# ==========================

class PatchedMultiHeadAttention(MultiHeadAttention):
    _EXTRA_KWARGS = {"use_gate", "seed"}
    def __init__(self, *args, **kwargs):
        for key in self._EXTRA_KWARGS:
            kwargs.pop(key, None)
        super().__init__(*args, **kwargs)

class PatchedDense(Dense):
    _EXTRA_KWARGS = {"quantization_config"}
    def __init__(self, *args, **kwargs):
        for key in self._EXTRA_KWARGS:
            kwargs.pop(key, None)
        super().__init__(*args, **kwargs)

class PatchedBatchNormalization(BatchNormalization):
    _EXTRA_KWARGS = {"renorm", "renorm_clipping", "renorm_momentum"}
    def __init__(self, *args, **kwargs):
        for key in self._EXTRA_KWARGS:
            kwargs.pop(key, None)
        super().__init__(*args, **kwargs)


@keras.saving.register_keras_serializable(package="CustomLayers")
class CustomDenseMaju(keras.layers.Layer):
    def __init__(self, units=32, activation=None, l2_reg=0.001, **kwargs):
        super().__init__(**kwargs)
        self.units = units
        self.activation = keras.activations.get(activation)
        self.l2_reg = l2_reg

    def build(self, input_shape):
        self.w = self.add_weight(
            name="kernel",
            shape=(input_shape[-1], self.units),
            initializer="random_normal",
            regularizer=keras.regularizers.l2(self.l2_reg),
            trainable=True
        )
        self.b = self.add_weight(
            name="bias", shape=(self.units,),
            initializer="zeros", trainable=True
        )

    def call(self, inputs):
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
# LOAD MODEL LAMA (.h5)
# ==========================

# Monkey-patch untuk bypass error get_tensor
import keras.src.models.functional as _functional

_original_functional_from_config = _functional.functional_from_config

def _patched_functional_from_config(config, custom_objects=None):
    # Normalize input_layers format lama ke format baru
    if "input_layers" in config:
        fixed = []
        for item in config["input_layers"]:
            if isinstance(item, (list, tuple)) and len(item) > 3:
                fixed.append(item[:3])  # ambil 3 elemen pertama saja
            else:
                fixed.append(item)
        config["input_layers"] = fixed
    return _original_functional_from_config(config, custom_objects=custom_objects)

_functional.functional_from_config = _patched_functional_from_config


CUSTOM_OBJECTS = {
    "Orthogonal": tf.keras.initializers.Orthogonal,
    "keras.initializers.Orthogonal": tf.keras.initializers.Orthogonal,
    "CustomDenseMaju": CustomDenseMaju,
    "CustomLayers>CustomDenseMaju": CustomDenseMaju,
    "MultiHeadAttention": PatchedMultiHeadAttention,
    "keras.layers.MultiHeadAttention": PatchedMultiHeadAttention,
    "keras.src.layers.attention.multi_head_attention.MultiHeadAttention": PatchedMultiHeadAttention,
    "BatchNormalization": PatchedBatchNormalization,
    "keras.layers.BatchNormalization": PatchedBatchNormalization,
    "keras.src.layers.normalization.batch_normalization.BatchNormalization": PatchedBatchNormalization,
    "Dense": PatchedDense,
    "keras.layers.Dense": PatchedDense,
    "keras.src.layers.core.dense.Dense": PatchedDense,
}

print("Loading model lama...")
model = tf.keras.models.load_model(
    "models/smartinvest_best_model_3class.h5",
    compile=False,
    custom_objects=CUSTOM_OBJECTS,
    safe_mode=False
)
print("Model loaded!")

# ==========================
# SAVE KE FORMAT BARU (.keras)
# ==========================

OUTPUT_PATH = "models/smartinvest_best_model_3class.keras"
model.save(OUTPUT_PATH)
print(f"Model disimpan ke: {OUTPUT_PATH}")