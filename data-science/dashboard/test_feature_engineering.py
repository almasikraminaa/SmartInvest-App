from utils.data_loader import (
    load_price_matrix,
    load_market_price,
    load_bi_rate
)

from utils.dynamic_filtering import dynamic_filtering
from utils.feature_engineering import feature_engineering


# ==========================================
# INDEX MAP
# ==========================================

index_map = {
    "LQ45": [
        "AADI.JK", "ADMR.JK", "ADRO.JK", "AKRA.JK", "AMMN.JK",
        "AMRT.JK", "ANTM.JK", "ARTO.JK", "ASII.JK", "BBCA.JK",
        "BBNI.JK", "BBRI.JK", "BBTN.JK", "BMRI.JK", "BRIS.JK",
        "BRPT.JK", "CPIN.JK", "CTRA.JK", "ESSA.JK", "EXCL.JK",
        "GOTO.JK", "ICBP.JK", "INCO.JK", "INDF.JK", "INKP.JK",
        "ISAT.JK", "ITMG.JK", "JPFA.JK", "JSMR.JK", "KLBF.JK",
        "MAPA.JK", "MAPI.JK", "MBMA.JK", "MDKA.JK", "MEDC.JK",
        "PGAS.JK", "PGEO.JK", "PTBA.JK", "SIDO.JK", "SMGR.JK",
        "TLKM.JK", "TOWR.JK", "UNTR.JK", "UNVR.JK", "WIFI.JK"
    ],

    "IDX30": [
        "ADRO.JK", "AMRT.JK", "ANTM.JK", "ASII.JK", "BBCA.JK",
        "BBNI.JK", "BBRI.JK", "BMRI.JK", "BRPT.JK", "CPIN.JK",
        "GOTO.JK", "ICBP.JK", "INCO.JK", "INDF.JK", "ISAT.JK",
        "KLBF.JK", "MAPI.JK", "MBMA.JK", "MDKA.JK", "MEDC.JK",
        "PGAS.JK", "PGEO.JK", "PTBA.JK", "SMGR.JK", "TLKM.JK",
        "UNTR.JK", "UNVR.JK"
    ]
}


# ==========================================
# LOAD DATA
# ==========================================

price_matrix = load_price_matrix()
market_price = load_market_price()
bi_rate_daily = load_bi_rate()

print("=== DATA BERHASIL DI-LOAD ===")
print("Price Matrix:", price_matrix.shape)
print("Market Price:", market_price.shape)
print("BI Rate:", bi_rate_daily.shape)


# ==========================================
# DYNAMIC FILTERING
# ==========================================

filtered_result = dynamic_filtering(
    index_choice="LQ45",
    start_date="2023-06-21",
    end_date="2024-09-30",
    price_matrix=price_matrix,
    market_price=market_price,
    bi_rate_daily=bi_rate_daily,
    index_map=index_map,
    min_months=6
)

filtered_price = filtered_result["filtered_price"]
filtered_market = filtered_result["filtered_market"]
filtered_bi_rate = filtered_result["filtered_bi_rate"]

print("\n=== DYNAMIC FILTERING BERHASIL ===")
print("Filtered Price:", filtered_price.shape)
print("Filtered Market:", filtered_market.shape)
print("Filtered BI Rate:", filtered_bi_rate.shape)


# ==========================================
# FEATURE ENGINEERING
# ==========================================

feature_result = feature_engineering(
    filtered_price=filtered_price,
    filtered_market=filtered_market,
    filtered_bi_rate=filtered_bi_rate,
    trading_days=252
)


# ==========================================
# AMBIL OUTPUT
# ==========================================

log_return_matrix = feature_result["log_return_matrix"]
market_log_return = feature_result["market_log_return"]
covariance_matrix = feature_result["covariance_matrix"]
correlation_matrix = feature_result["correlation_matrix"]
beta_series = feature_result["beta_series"]
alpha_series = feature_result["alpha_series"]
expected_return_capm = feature_result["expected_return_capm"]
stock_summary = feature_result["stock_summary"]
annual_risk_free_rate = feature_result["annual_risk_free_rate"]
daily_risk_free_rate = feature_result["daily_risk_free_rate"]
annual_market_return = feature_result["annual_market_return"]


# ==========================================
# PRINT OUTPUT SHAPE
# ==========================================

print("\n=== FEATURE ENGINEERING OUTPUT SHAPE ===")
print("Log Return Matrix:", log_return_matrix.shape)
print("Market Log Return:", market_log_return.shape)
print("Covariance Matrix:", covariance_matrix.shape)
print("Correlation Matrix:", correlation_matrix.shape)
print("Beta Series:", beta_series.shape)
print("Alpha Series:", alpha_series.shape)
print("Expected Return CAPM:", expected_return_capm.shape)
print("Stock Summary:", stock_summary.shape)


# ==========================================
# PRINT RATE INFO
# ==========================================

print("\n=== RATE INFO ===")
print("Annual Risk Free Rate:", annual_risk_free_rate)
print("Daily Risk Free Rate:", daily_risk_free_rate)
print("Annual Market Return:", annual_market_return)


# ==========================================
# CEK DATA HEAD
# ==========================================

print("\n=== LOG RETURN MATRIX HEAD ===")
print(log_return_matrix.head())

print("\n=== MARKET LOG RETURN HEAD ===")
print(market_log_return.head())

print("\n=== BETA SERIES HEAD ===")
print(beta_series.head())

print("\n=== ALPHA SERIES HEAD ===")
print(alpha_series.head())

print("\n=== EXPECTED RETURN CAPM HEAD ===")
print(expected_return_capm.head())

print("\n=== STOCK SUMMARY HEAD ===")
print(stock_summary.head())


# ==========================================
# CEK MISSING VALUE
# ==========================================

print("\n=== CEK MISSING VALUE ===")
print("Log Return Missing:", log_return_matrix.isnull().sum().sum())
print("Market Log Return Missing:", market_log_return.isnull().sum())
print("Covariance Missing:", covariance_matrix.isnull().sum().sum())
print("Correlation Missing:", correlation_matrix.isnull().sum().sum())
print("Beta Missing:", beta_series.isnull().sum())
print("Alpha Missing:", alpha_series.isnull().sum())
print("Expected Return CAPM Missing:", expected_return_capm.isnull().sum())
print("Stock Summary Missing:", stock_summary.isnull().sum().sum())


print("\nFEATURE ENGINEERING BERHASIL DIJALANKAN")