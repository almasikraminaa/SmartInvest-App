from dotenv import load_dotenv

load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ==========================
# IMPORT ROUTES
# ==========================

from routes.portfolio import (
    router as portfolio_router
)

from routes.ihsg import (
    router as ihsg_router
)


# ==========================
# FASTAPI APP
# ==========================

app = FastAPI(
    title="SmartInvest AI API",
    description="""
    SmartInvest Backend API

    Features:
    - Portfolio Analysis (MVEP, SIM, CAPM)
    - Stock Trend Classification
    - IHSG Prediction
    - AI Interpretation
    """,
    version="1.0.0"
)


# ==========================
# CORS
# ==========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================
# ROOT ENDPOINT
# ==========================

@app.get("/")
def root():
    return {
        "message":
            "SmartInvest AI API aktif 🚀",

        "docs":
            "/docs",

        "version":
            "1.0.0",

        "available_endpoints": [
            "/api/analyze-portfolio",
            "/api/predict-ihsg"
        ]
    }


# ==========================
# REGISTER ROUTES
# ==========================

# Portfolio Analysis
app.include_router(
    portfolio_router,
    prefix="/api",
    tags=["Portfolio Analysis"]
)

# IHSG Prediction
app.include_router(
    ihsg_router,
    prefix="/api",
    tags=["IHSG Prediction"]
)
