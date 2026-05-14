from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tensorflow as tf
import keras
import numpy as np
import joblib
import os
import google.generativeai as genai

app = FastAPI(title='SmartInvest AI API v1.2', version='1.2.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)

# ── KEBUTUHAN CUSTOM LAYER ───────────────────────────────────
@keras.saving.register_keras_serializable()
class CustomDenseMaju(keras.layers.Layer):
    def __init__(self, units=32, activation=None, l2_reg=0.001, **kwargs):
        super().__init__(**kwargs)
        self.units = units
        self.activation = keras.activations.get(activation)
        self.l2_reg = l2_reg

    def build(self, input_shape):
        self.w = self.add_weight(
            shape=(input_shape[-1], self.units),
            initializer='random_normal',
            regularizer=keras.regularizers.l2(self.l2_reg),
            trainable=True
        )
        self.b = self.add_weight(shape=(self.units,), initializer='zeros', trainable=True)

    def call(self, inputs):
        res = tf.matmul(inputs, self.w) + self.b
        return self.activation(res) if self.activation else res

    def get_config(self):
        config = super().get_config()
        config.update({
            "units": self.units,
            "activation": keras.activations.serialize(self.activation),
            "l2_reg": self.l2_reg
        })
        return config

MODEL_PATH = 'smartinvest_best_model_3class.keras'
SCALER_PATH = 'smartinvest_scaler_global.pkl'
model, scaler = None, None

@app.on_event('startup')
async def load_assets():
    global model, scaler
    if os.path.exists(SCALER_PATH): scaler = joblib.load(SCALER_PATH)
    if os.path.exists(MODEL_PATH):
        model = keras.models.load_model(MODEL_PATH, custom_objects={'CustomDenseMaju': CustomDenseMaju})

# ── SCHEMAS ──────────────────────────────────────────────────
class StockData(BaseModel):
    ticker: str
    ohlcv_10days: list # Matriks [[O,H,L,C,V], ..., (10x5)]

class BatchPredictionRequest(BaseModel):
    stocks: list[StockData]

class InterpretRequest(BaseModel):
    best_method: str
    portfolio_data: list # Hasil dari /predict_batch
    allocations: dict
    expected_return: float
    risk: float
    api_key: str

# ── ENDPOINTS ────────────────────────────────────────────────
@app.post('/predict_batch')
async def predict_batch(request: BatchPredictionRequest):
    if not model or not scaler: raise HTTPException(status_code=503, detail='Model not ready')
    
    results = []
    labels = ['Bearish', 'Sideways', 'Bullish']
    recs = ['AVOID', 'HOLD', 'BUY']

    for stock in request.stocks:
        try:
            arr = np.array(stock.ohlcv_10days)
            # Transformasi per baris (karena scaler dilatih per fitur)
            scaled = scaler.transform(arr) 
            final_input = np.expand_dims(scaled, axis=0) # (1, 10, 5)
            
            pred = model.predict(final_input)
            idx = np.argmax(pred[0])
            
            results.append({
                "ticker": stock.ticker,
                "trend": labels[idx],
                "confidence": float(np.max(pred[0])),
                "recommendation": recs[idx]
            })
        except Exception as e:
            results.append({"ticker": stock.ticker, "error": str(e)})
            
    return results

@app.post('/interpret')
async def interpret(req: InterpretRequest):
    genai.configure(api_key=req.api_key)
    gemini = genai.GenerativeModel('gemini-2.5-flash')
    
    # Prompt untuk menjelaskan BANYAK saham sekaligus
    prompt = f"""Kamu adalah 'Sobat SmartInvest'. 
Jelaskan portofolio investasi ini ke orang awam:
- Strategi: {req.best_method}
- Estimasi Return: {req.expected_return*100:.1f}% | Risiko: {req.risk*100:.1f}%
- Detail Saham & Tren: {req.portfolio_data}
- Alokasi Dana: {req.allocations}

WAJIB: 
1. Sapa '👋 Hallo Sobat SmartInvest!'
2. Berikan analisis apakah portofolio ini aman berdasarkan tren (misal: "Hati-hati, banyak saham Bearish").
3. Berikan 3 tips praktis emoji 👉."""

    try:
        response = gemini.generate_content(prompt)
        return {'interpretation': response.text}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))