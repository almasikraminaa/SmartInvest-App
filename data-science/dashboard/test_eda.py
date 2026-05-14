from utils.data_loader import load_price_matrix

from utils.eda import (
    prepare_eda_data,
    calculate_eda_log_return,
    create_eda_stock_summary,
    get_top_bottom_return,
    get_top_bottom_risk,
    get_top_sharpe_ratio,
    calculate_correlation_matrix,
    calculate_cumulative_return,
    calculate_rolling_volatility,
    create_eda_kpi_summary,
    run_eda,
    run_all_eda
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
# LOAD DATA
# =========================================================

price_matrix = load_price_matrix()

print("=== DATA BERHASIL DI-LOAD ===")
print("Price Matrix:", price_matrix.shape)
print("Date Range:", price_matrix.index.min(), "sampai", price_matrix.index.max())


# =========================================================
# TEST PREPARE EDA DATA
# =========================================================

prepared_lq45 = prepare_eda_data(
    index_choice="LQ45",
    price_matrix=price_matrix,
    index_map=index_map
)

prepared_idx30 = prepare_eda_data(
    index_choice="IDX30",
    price_matrix=price_matrix,
    index_map=index_map
)

print("\n=== PREPARE EDA DATA ===")
print("LQ45 Price Shape:", prepared_lq45["eda_price"].shape)
print("IDX30 Price Shape:", prepared_idx30["eda_price"].shape)
print("LQ45 Available Tickers:", len(prepared_lq45["available_tickers"]))
print("IDX30 Available Tickers:", len(prepared_idx30["available_tickers"]))
print("LQ45 Unavailable:", prepared_lq45["unavailable_tickers"])
print("IDX30 Unavailable:", prepared_idx30["unavailable_tickers"])


# =========================================================
# TEST LOG RETURN
# =========================================================

eda_log_return_lq45 = calculate_eda_log_return(
    prepared_lq45["eda_price"]
)

eda_log_return_idx30 = calculate_eda_log_return(
    prepared_idx30["eda_price"]
)

print("\n=== LOG RETURN ===")
print("LQ45 Log Return:", eda_log_return_lq45.shape)
print("IDX30 Log Return:", eda_log_return_idx30.shape)


# =========================================================
# TEST STOCK SUMMARY
# =========================================================

eda_summary_lq45 = create_eda_stock_summary(
    eda_log_return_lq45,
    trading_days=252,
    risk_free_rate=0.05
)

eda_summary_idx30 = create_eda_stock_summary(
    eda_log_return_idx30,
    trading_days=252,
    risk_free_rate=0.05
)

print("\n=== STOCK SUMMARY ===")
print("LQ45 Summary:", eda_summary_lq45.shape)
print("IDX30 Summary:", eda_summary_idx30.shape)

print("\nLQ45 Summary Head:")
print(eda_summary_lq45.head())

print("\nIDX30 Summary Head:")
print(eda_summary_idx30.head())


# =========================================================
# TEST TOP / BOTTOM RETURN
# =========================================================

top_return_lq45, bottom_return_lq45 = get_top_bottom_return(
    eda_summary_lq45,
    n=10
)

top_return_idx30, bottom_return_idx30 = get_top_bottom_return(
    eda_summary_idx30,
    n=10
)

print("\n=== TOP RETURN ===")
print("LQ45:")
print(top_return_lq45[["Ticker", "annualized_return"]])

print("\nIDX30:")
print(top_return_idx30[["Ticker", "annualized_return"]])


print("\n=== BOTTOM RETURN ===")
print("LQ45:")
print(bottom_return_lq45[["Ticker", "annualized_return"]])

print("\nIDX30:")
print(bottom_return_idx30[["Ticker", "annualized_return"]])


# =========================================================
# TEST TOP / BOTTOM RISK
# =========================================================

top_risk_lq45, bottom_risk_lq45 = get_top_bottom_risk(
    eda_summary_lq45,
    n=10
)

top_risk_idx30, bottom_risk_idx30 = get_top_bottom_risk(
    eda_summary_idx30,
    n=10
)

print("\n=== TOP RISK ===")
print("LQ45:")
print(top_risk_lq45[["Ticker", "annualized_volatility"]])

print("\nIDX30:")
print(top_risk_idx30[["Ticker", "annualized_volatility"]])


print("\n=== BOTTOM RISK ===")
print("LQ45:")
print(bottom_risk_lq45[["Ticker", "annualized_volatility"]])

print("\nIDX30:")
print(bottom_risk_idx30[["Ticker", "annualized_volatility"]])


# =========================================================
# TEST SHARPE
# =========================================================

top_sharpe_lq45 = get_top_sharpe_ratio(
    eda_summary_lq45,
    n=10
)

top_sharpe_idx30 = get_top_sharpe_ratio(
    eda_summary_idx30,
    n=10
)

print("\n=== TOP SHARPE ===")
print("LQ45:")
print(top_sharpe_lq45[["Ticker", "sharpe_ratio"]])

print("\nIDX30:")
print(top_sharpe_idx30[["Ticker", "sharpe_ratio"]])


# =========================================================
# TEST CORRELATION MATRIX
# =========================================================

corr_lq45 = calculate_correlation_matrix(
    eda_log_return_lq45
)

corr_idx30 = calculate_correlation_matrix(
    eda_log_return_idx30
)

print("\n=== CORRELATION MATRIX ===")
print("LQ45:", corr_lq45.shape)
print("IDX30:", corr_idx30.shape)


# =========================================================
# TEST CUMULATIVE RETURN
# =========================================================

cumulative_return_lq45 = calculate_cumulative_return(
    eda_log_return_lq45
)

cumulative_return_idx30 = calculate_cumulative_return(
    eda_log_return_idx30
)

print("\n=== CUMULATIVE RETURN ===")
print("LQ45:", cumulative_return_lq45.shape)
print("IDX30:", cumulative_return_idx30.shape)


# =========================================================
# TEST ROLLING VOLATILITY
# =========================================================

rolling_volatility_lq45 = calculate_rolling_volatility(
    eda_log_return_lq45,
    window=30,
    trading_days=252
)

rolling_volatility_idx30 = calculate_rolling_volatility(
    eda_log_return_idx30,
    window=30,
    trading_days=252
)

print("\n=== ROLLING VOLATILITY ===")
print("LQ45:", rolling_volatility_lq45.shape)
print("IDX30:", rolling_volatility_idx30.shape)


# =========================================================
# TEST KPI SUMMARY
# =========================================================

kpi_lq45 = create_eda_kpi_summary(
    eda_summary_lq45
)

kpi_idx30 = create_eda_kpi_summary(
    eda_summary_idx30
)

print("\n=== KPI SUMMARY LQ45 ===")
for key, value in kpi_lq45.items():
    print(f"{key}: {value}")

print("\n=== KPI SUMMARY IDX30 ===")
for key, value in kpi_idx30.items():
    print(f"{key}: {value}")


# =========================================================
# TEST RUN EDA
# =========================================================

eda_result_lq45 = run_eda(
    index_choice="LQ45",
    price_matrix=price_matrix,
    index_map=index_map,
    trading_days=252,
    risk_free_rate=0.05,
    top_n=10
)

eda_result_idx30 = run_eda(
    index_choice="IDX30",
    price_matrix=price_matrix,
    index_map=index_map,
    trading_days=252,
    risk_free_rate=0.05,
    top_n=10
)

print("\n=== RUN EDA RESULT ===")
print("LQ45 Keys:", eda_result_lq45.keys())
print("IDX30 Keys:", eda_result_idx30.keys())


# =========================================================
# TEST RUN ALL EDA
# =========================================================

all_eda_results = run_all_eda(
    price_matrix=price_matrix,
    index_map=index_map,
    trading_days=252,
    risk_free_rate=0.05,
    top_n=10
)

print("\n=== RUN ALL EDA ===")
print(all_eda_results.keys())

print("\nEDA BERHASIL DIJALANKAN")