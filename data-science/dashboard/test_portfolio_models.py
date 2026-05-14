from utils.data_loader import (
    load_price_matrix,
    load_market_price,
    load_bi_rate
)

from utils.dynamic_filtering import dynamic_filtering
from utils.feature_engineering import feature_engineering
from utils.portfolio_models import (
    run_mvep,
    run_sim,
    run_capm,
    run_selected_model,
    compare_all_models
)


# =========================================================
# INDEX MAP
# =========================================================

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


# =========================================================
# USER INPUT SIMULATION
# =========================================================

index_choice = "LQ45"
start_date = "2023-06-21"
end_date = "2024-09-30"
investment_amount = 10_000_000
model_choice = "MVEP"


# =========================================================
# LOAD DATA
# =========================================================

price_matrix = load_price_matrix()
market_price = load_market_price()
bi_rate_daily = load_bi_rate()

print("=== DATA BERHASIL DI-LOAD ===")
print("Price Matrix:", price_matrix.shape)
print("Market Price:", market_price.shape)
print("BI Rate:", bi_rate_daily.shape)


# =========================================================
# DYNAMIC FILTERING
# =========================================================

filtered_result = dynamic_filtering(
    index_choice=index_choice,
    start_date=start_date,
    end_date=end_date,
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


# =========================================================
# FEATURE ENGINEERING
# =========================================================

feature_result = feature_engineering(
    filtered_price=filtered_price,
    filtered_market=filtered_market,
    filtered_bi_rate=filtered_bi_rate,
    trading_days=252
)

print("\n=== FEATURE ENGINEERING BERHASIL ===")
print("Stock Summary:", feature_result["stock_summary"].shape)
print("Covariance Matrix:", feature_result["covariance_matrix"].shape)


# =========================================================
# TEST MVEP
# =========================================================

mvep_result = run_mvep(
    feature_result=feature_result,
    investment_amount=investment_amount
)

print("\n=== MVEP RESULT ===")
print("Annual Return:", mvep_result["portfolio_annual_return"])
print("Annual Risk:", mvep_result["portfolio_annual_risk"])
print("Sharpe Ratio:", mvep_result["sharpe_ratio"])
print("Weights Sum:", mvep_result["weights"]["Weight"].sum())
print(mvep_result["weights"].head())


# =========================================================
# TEST SIM
# =========================================================

sim_result = run_sim(
    feature_result=feature_result,
    investment_amount=investment_amount
)

print("\n=== SIM RESULT ===")
print("Annual Return:", sim_result["portfolio_annual_return"])
print("Annual Risk:", sim_result["portfolio_annual_risk"])
print("Sharpe Ratio:", sim_result["sharpe_ratio"])
print("Weights Sum:", sim_result["weights"]["Weight"].sum())
print(sim_result["weights"].head())


# =========================================================
# TEST CAPM
# =========================================================

capm_result = run_capm(
    feature_result=feature_result,
    investment_amount=investment_amount
)

print("\n=== CAPM RESULT ===")
print("Annual Return:", capm_result["portfolio_annual_return"])
print("Annual Risk:", capm_result["portfolio_annual_risk"])
print("Sharpe Ratio:", capm_result["sharpe_ratio"])
print("Weights Sum:", capm_result["weights"]["Weight"].sum())
print(capm_result["weights"].head())


# =========================================================
# TEST SELECTED MODEL
# =========================================================

selected_result = run_selected_model(
    model_choice=model_choice,
    feature_result=feature_result,
    investment_amount=investment_amount
)

print("\n=== SELECTED MODEL RESULT ===")
print("Selected Model:", selected_result["method"])
print("Annual Return:", selected_result["portfolio_annual_return"])
print("Annual Risk:", selected_result["portfolio_annual_risk"])
print("Sharpe Ratio:", selected_result["sharpe_ratio"])


# =========================================================
# TEST COMPARE ALL MODELS
# =========================================================

all_model_result = compare_all_models(
    feature_result=feature_result,
    investment_amount=investment_amount
)

comparison_df = all_model_result["comparison_df"]

print("\n=== MODEL COMPARISON ===")
print(comparison_df)


print("\nPORTFOLIO MODELS BERHASIL DIJALANKAN")