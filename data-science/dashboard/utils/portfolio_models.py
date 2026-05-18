import numpy as np
import pandas as pd


# =========================================================
# HELPER
# =========================================================

def calculate_portfolio_metrics(
    portfolio_daily_return,
    risk_free_rate_annual,
    trading_days=252
):
    annualized_return = portfolio_daily_return.mean() * trading_days
    annualized_volatility = portfolio_daily_return.std() * np.sqrt(trading_days)

    sharpe_ratio = (
        annualized_return - risk_free_rate_annual
    ) / annualized_volatility

    return annualized_return, annualized_volatility, sharpe_ratio


# =========================================================
# 7. MVEP - MEAN VARIANCE EFFICIENT PORTFOLIO
# =========================================================

def run_mvep(
    feature_result,
    investment_amount=10_000_000,
    trading_days=252,
    low_corr_pair_count=10
):
    log_return_matrix = feature_result["log_return_matrix"]
    covariance_matrix = feature_result["covariance_matrix"]
    correlation_matrix = feature_result["correlation_matrix"]
    stock_summary = feature_result["stock_summary"]
    risk_free_rate_annual = feature_result["annual_risk_free_rate"]

    # 7.1 Ambil 10 pasangan saham dengan korelasi terendah
    corr_matrix_mvep = correlation_matrix.copy()
    corr_matrix_mvep.index.name = None
    corr_matrix_mvep.columns.name = None

    corr_pairs_mvep = corr_matrix_mvep.stack().reset_index()
    corr_pairs_mvep.columns = ["Ticker_1", "Ticker_2", "Correlation"]

    corr_pairs_mvep = corr_pairs_mvep[
        corr_pairs_mvep["Ticker_1"] != corr_pairs_mvep["Ticker_2"]
    ]

    corr_pairs_mvep["pair"] = corr_pairs_mvep.apply(
        lambda x: tuple(sorted([x["Ticker_1"], x["Ticker_2"]])),
        axis=1
    )

    corr_pairs_mvep = corr_pairs_mvep.drop_duplicates("pair").drop(columns="pair")

    top_low_corr_pairs_mvep = corr_pairs_mvep.sort_values(
        by="Correlation",
        ascending=True
    ).head(low_corr_pair_count)

    # 7.2 Ambil unique ticker dari 10 pasangan korelasi terendah
    selected_tickers_mvep = sorted(
        list(
            set(top_low_corr_pairs_mvep["Ticker_1"])
            .union(set(top_low_corr_pairs_mvep["Ticker_2"]))
        )
    )

    if len(selected_tickers_mvep) < 2:
        raise ValueError("Jumlah saham terpilih MVEP terlalu sedikit.")

    # 7.3 Subset covariance matrix
    mvep_covariance_matrix = covariance_matrix.loc[
        selected_tickers_mvep,
        selected_tickers_mvep
    ]

    # 7.4 Inverse covariance matrix
    cov_matrix_np = mvep_covariance_matrix.values

    try:
        inverse_covariance_matrix = np.linalg.inv(cov_matrix_np)
    except np.linalg.LinAlgError:
        inverse_covariance_matrix = np.linalg.pinv(cov_matrix_np)

    inverse_covariance_matrix_df = pd.DataFrame(
        inverse_covariance_matrix,
        index=selected_tickers_mvep,
        columns=selected_tickers_mvep
    )

    # 7.5 Hitung bobot MVEP
    ones = np.ones(len(selected_tickers_mvep))

    mvep_weights = inverse_covariance_matrix @ ones / (
        ones.T @ inverse_covariance_matrix @ ones
    )

    mvep_weights_series = pd.Series(
        mvep_weights,
        index=selected_tickers_mvep,
        name="Weight"
    )

    mvep_weights_summary = pd.DataFrame({
        "Ticker": mvep_weights_series.index,
        "Weight": mvep_weights_series.values
    })

    mvep_weights_summary["Allocation"] = (
        mvep_weights_summary["Weight"] * investment_amount
    )

    # 7.6 Hitung performa MVEP
    mvep_return_matrix = log_return_matrix[selected_tickers_mvep]

    mvep_portfolio_daily_return = (
        mvep_return_matrix @ mvep_weights_series
    )

    mvep_portfolio_annual_return = (
        mvep_portfolio_daily_return.mean() * trading_days
    )

    mvep_portfolio_annual_volatility = (
        mvep_portfolio_daily_return.std() * np.sqrt(trading_days)
    )

    mvep_portfolio_sharpe = (
        mvep_portfolio_annual_return - risk_free_rate_annual
    ) / mvep_portfolio_annual_volatility

    weights_df = mvep_weights_summary.merge(
        stock_summary,
        on="Ticker",
        how="left"
    )

    weights_df = weights_df.sort_values(
        by="Weight",
        ascending=False
    ).reset_index(drop=True)

    mvep_portfolio_performance = pd.DataFrame({
        "metric": [
            "annualized_return",
            "annualized_volatility",
            "sharpe_ratio",
            "selected_stock_count",
            "total_weight"
        ],
        "value": [
            mvep_portfolio_annual_return,
            mvep_portfolio_annual_volatility,
            mvep_portfolio_sharpe,
            len(selected_tickers_mvep),
            mvep_weights_series.sum()
        ]
    })

    return {
        "method": "MVEP",
        "weights": weights_df,
        "portfolio_daily_return": mvep_portfolio_daily_return,
        "portfolio_annual_return": mvep_portfolio_annual_return,
        "portfolio_annual_risk": mvep_portfolio_annual_volatility,
        "sharpe_ratio": mvep_portfolio_sharpe,
        "selected_stock_count": len(selected_tickers_mvep),
        "total_weight": mvep_weights_series.sum(),
        "selected_tickers": selected_tickers_mvep,
        "top_low_corr_pairs": top_low_corr_pairs_mvep,
        "mvep_covariance_matrix": mvep_covariance_matrix,
        "mvep_inverse_covariance_matrix": inverse_covariance_matrix_df,
        "mvep_portfolio_performance": mvep_portfolio_performance
    }


# =========================================================
# 8. SIM - SINGLE INDEX MODEL
# =========================================================

def run_sim(
    feature_result,
    investment_amount=10_000_000,
    trading_days=252
):
    sim_return_matrix = feature_result["log_return_matrix"].copy()
    sim_market_return = feature_result["market_log_return"].copy()

    sim_expected_return = feature_result["annualized_return"].copy()
    sim_beta = feature_result["beta_series"].copy()
    sim_alpha = feature_result["alpha_series"].copy()

    stock_summary = feature_result["stock_summary"]
    rf = feature_result["annual_risk_free_rate"]
    market_variance = sim_market_return.var()

    # 8.2 Residual variance
    residual_variance = {}

    for ticker in sim_return_matrix.columns:
        predicted_return = (
            sim_alpha[ticker] + sim_beta[ticker] * sim_market_return
        )

        residual = sim_return_matrix[ticker] - predicted_return
        residual_variance[ticker] = residual.var()

    residual_variance = pd.Series(
        residual_variance,
        name="residual_variance"
    )

    # 8.3 Tabel awal SIM
    sim_table = pd.DataFrame({
        "expected_return": sim_expected_return,
        "alpha": sim_alpha,
        "beta": sim_beta,
        "residual_variance": residual_variance
    })

    sim_table = sim_table.replace([np.inf, -np.inf], np.nan).dropna()

    sim_table = sim_table[
        (sim_table["beta"] > 0) &
        (sim_table["residual_variance"] > 0)
    ]

    if sim_table.empty:
        raise ValueError("Tidak ada saham valid untuk SIM.")

    # 8.4 ERB
    sim_table["ERB"] = (
        sim_table["expected_return"] - rf
    ) / sim_table["beta"]

    # 8.5 Sort ERB
    sim_table = sim_table.sort_values(
        by="ERB",
        ascending=False
    )

    # 8.6 Ai dan Bi
    sim_table["Ai"] = (
        sim_table["beta"] *
        (sim_table["expected_return"] - rf)
    ) / sim_table["residual_variance"]

    sim_table["Bi"] = (
        sim_table["beta"] ** 2
    ) / sim_table["residual_variance"]

    # 8.7 Ci
    sim_table["cum_Ai"] = sim_table["Ai"].cumsum()
    sim_table["cum_Bi"] = sim_table["Bi"].cumsum()

    sim_table["Ci"] = (
        market_variance * sim_table["cum_Ai"]
    ) / (
        1 + market_variance * sim_table["cum_Bi"]
    )

    # 8.8 Cut-off C*
    eligible_cutoff = sim_table[
        sim_table["ERB"] > sim_table["Ci"]
    ]

    if eligible_cutoff.empty:
        raise ValueError(
            "Tidak ada saham yang memenuhi kriteria ERB > Ci untuk portofolio optimal SIM."
        )

    C_star = eligible_cutoff["Ci"].iloc[-1]

    # 8.9 Saham terpilih
    sim_selected = sim_table[
        sim_table["ERB"] > C_star
    ].copy()

    # 8.10 Zi
    sim_selected["Zi"] = (
        sim_selected["beta"] / sim_selected["residual_variance"]
    ) * (
        sim_selected["ERB"] - C_star
    )

    # 8.11 Bobot
    sim_selected["Weight"] = (
        sim_selected["Zi"] / sim_selected["Zi"].sum()
    )

    sim_weights = sim_selected["Weight"]
    sim_selected_tickers = sim_selected.index.tolist()

    # 8.12 Performa SIM
    sim_portfolio_returns = sim_return_matrix[sim_selected_tickers]

    sim_portfolio_daily_return = (
        sim_portfolio_returns @ sim_weights
    )

    sim_portfolio_annual_return = (
        sim_portfolio_daily_return.mean() * trading_days
    )

    sim_portfolio_annual_volatility = (
        sim_portfolio_daily_return.std() * np.sqrt(trading_days)
    )

    sim_portfolio_sharpe = (
        sim_portfolio_annual_return - rf
    ) / sim_portfolio_annual_volatility

    # 8.13 Portfolio beta
    sim_portfolio_beta = np.sum(
        sim_weights.values *
        sim_beta.loc[sim_selected_tickers].values
    )

    # 8.14 Portfolio alpha
    sim_market_annual_return = sim_market_return.mean() * trading_days

    sim_expected_portfolio_return_capm = (
        rf + sim_portfolio_beta * (sim_market_annual_return - rf)
    )

    sim_portfolio_alpha = (
        sim_portfolio_annual_return -
        sim_expected_portfolio_return_capm
    )

    # 8.15 Ringkasan bobot SIM
    sim_weights_summary = sim_selected.reset_index().rename(
        columns={"index": "Ticker"}
    )

    sim_weights_summary = sim_weights_summary[[
        "Ticker",
        "expected_return",
        "alpha",
        "beta",
        "residual_variance",
        "ERB",
        "Ai",
        "Bi",
        "Ci",
        "Zi",
        "Weight"
    ]]

    sim_weights_summary["Allocation"] = (
        sim_weights_summary["Weight"] * investment_amount
    )

    weights_df = sim_weights_summary.merge(
        stock_summary,
        on="Ticker",
        how="left",
        suffixes=("", "_summary")
    )

    weights_df = weights_df.sort_values(
        by="Weight",
        ascending=False
    ).reset_index(drop=True)

    sim_calculation_table = sim_table.reset_index().rename(
        columns={"index": "Ticker"}
    )

    sim_portfolio_performance = pd.DataFrame({
        "metric": [
            "C_star",
            "annualized_return",
            "annualized_volatility",
            "sharpe_ratio",
            "portfolio_beta",
            "portfolio_alpha",
            "selected_stock_count"
        ],
        "value": [
            C_star,
            sim_portfolio_annual_return,
            sim_portfolio_annual_volatility,
            sim_portfolio_sharpe,
            sim_portfolio_beta,
            sim_portfolio_alpha,
            sim_selected.shape[0]
        ]
    })

    return {
        "method": "SIM",
        "weights": weights_df,
        "portfolio_daily_return": sim_portfolio_daily_return,
        "portfolio_annual_return": sim_portfolio_annual_return,
        "portfolio_annual_risk": sim_portfolio_annual_volatility,
        "sharpe_ratio": sim_portfolio_sharpe,
        "portfolio_beta": sim_portfolio_beta,
        "portfolio_alpha": sim_portfolio_alpha,
        "expected_portfolio_return_capm": sim_expected_portfolio_return_capm,
        "C_star": C_star,
        "selected_stock_count": sim_selected.shape[0],
        "selected_tickers": sim_selected_tickers,
        "sim_calculation_table": sim_calculation_table,
        "sim_portfolio_performance": sim_portfolio_performance
    }


# =========================================================
# 9. CAPM - CAPITAL ASSET PRICING MODEL
# =========================================================

def run_capm(
    feature_result,
    investment_amount=10_000_000,
    trading_days=252,
    top_n=10
):
    log_return_matrix = feature_result["log_return_matrix"]
    market_log_return = feature_result["market_log_return"]
    covariance_matrix = feature_result["covariance_matrix"]
    stock_summary = feature_result["stock_summary"]

    rf = feature_result["annual_risk_free_rate"]

    market_return_annual = (
        market_log_return.mean() * trading_days
    )

    capm_return_matrix = log_return_matrix.copy()

    capm_covariance_matrix = covariance_matrix * trading_days

    # 9.2 Hitung beta
    market_variance = market_log_return.var()

    beta_values = {}

    for ticker in capm_return_matrix.columns:
        covariance_with_market = capm_return_matrix[ticker].cov(
            market_log_return
        )

        beta_values[ticker] = covariance_with_market / market_variance

    beta_series = pd.Series(beta_values, name="Beta")

    # 9.3 Expected return CAPM
    capm_expected_return = rf + beta_series * (
        market_return_annual - rf
    )

    capm_expected_return.name = "Expected_Return_CAPM"

    # 9.4 Excess return
    capm_excess_return = capm_expected_return - rf
    capm_excess_return.name = "Excess_Return"

    # 9.5 Validasi ticker
    capm_tickers = [
        ticker for ticker in capm_expected_return.index
        if ticker in capm_covariance_matrix.index
    ]

    if len(capm_tickers) < 2:
        raise ValueError(
            "Jumlah saham terlalu sedikit untuk membentuk portofolio CAPM."
        )

    capm_expected_return = capm_expected_return.loc[capm_tickers]
    capm_excess_return = capm_excess_return.loc[capm_tickers]

    capm_covariance_matrix = capm_covariance_matrix.loc[
        capm_tickers,
        capm_tickers
    ]

    # 9.6 Inverse covariance matrix
    capm_cov_np = capm_covariance_matrix.values

    try:
        capm_inverse_covariance = np.linalg.inv(capm_cov_np)
    except np.linalg.LinAlgError:
        capm_inverse_covariance = np.linalg.pinv(capm_cov_np)

    capm_inverse_covariance_df = pd.DataFrame(
        capm_inverse_covariance,
        index=capm_tickers,
        columns=capm_tickers
    )

    # 9.7 Hitung bobot CAPM
    ones_vector = np.ones(len(capm_tickers))
    excess_return_vector = capm_excess_return.values

    numerator = capm_inverse_covariance @ excess_return_vector

    denominator = (
        ones_vector.T
        @ capm_inverse_covariance
        @ excess_return_vector
    )

    if denominator == 0:
        raise ValueError(
            "Denominator bobot CAPM bernilai 0, bobot tidak dapat dihitung."
        )

    capm_weights = numerator / denominator

    capm_weights_series = pd.Series(
        capm_weights,
        index=capm_tickers,
        name="Weight"
    )

    # 9.8 Ringkasan bobot awal
    capm_weights_summary_all = pd.DataFrame({
        "Ticker": capm_weights_series.index,
        "Beta": beta_series.loc[capm_tickers].values,
        "Expected_Return_CAPM": capm_expected_return.values,
        "Excess_Return": capm_excess_return.values,
        "Weight": capm_weights_series.values
    })

    # 9.9 Cut-off Top 10
    capm_weights_summary = (
        capm_weights_summary_all
        .sort_values(by="Weight", ascending=False)
        .head(top_n)
        .reset_index(drop=True)
    )

    capm_weights_summary["Weight"] = (
        capm_weights_summary["Weight"] /
        capm_weights_summary["Weight"].sum()
    )

    capm_tickers = capm_weights_summary["Ticker"].tolist()

    capm_weights_series = pd.Series(
        capm_weights_summary["Weight"].values,
        index=capm_tickers,
        name="Weight"
    )

    # 9.10 Daily return CAPM
    capm_portfolio_daily_return = (
        capm_return_matrix[capm_tickers] @ capm_weights_series
    )

    # 9.11 Risiko CAPM
    top_covariance_matrix = capm_covariance_matrix.loc[
        capm_tickers,
        capm_tickers
    ]

    capm_portfolio_variance = (
        capm_weights_series.values.T
        @ top_covariance_matrix.values
        @ capm_weights_series.values
    )

    capm_portfolio_annual_volatility = np.sqrt(
        capm_portfolio_variance
    )

    # 9.12 Return tahunan CAPM
    capm_portfolio_annual_return = (
        capm_portfolio_daily_return.mean()
        * trading_days
    )

    # 9.13 Sharpe Ratio
    capm_sharpe_ratio = (
        capm_portfolio_annual_return - rf
    ) / capm_portfolio_annual_volatility

    # 9.14 Portfolio beta
    capm_portfolio_beta = np.sum(
        capm_weights_series.values *
        beta_series.loc[capm_tickers].values
    )

    # 9.15 Portfolio alpha
    expected_capm_portfolio_return = (
        rf +
        capm_portfolio_beta *
        (market_return_annual - rf)
    )

    capm_portfolio_alpha = (
        capm_portfolio_annual_return -
        expected_capm_portfolio_return
    )

    # 9.16 Summary performance
    capm_portfolio_summary = pd.DataFrame({
        "Metric": [
            "Annualized Return",
            "Annualized Volatility",
            "Sharpe Ratio",
            "Portfolio Beta",
            "Portfolio Alpha",
            "Expected CAPM Portfolio Return",
            "Risk Free Rate",
            "Market Return",
            "Selected Stock Count",
            "Total Weight"
        ],
        "Value": [
            capm_portfolio_annual_return,
            capm_portfolio_annual_volatility,
            capm_sharpe_ratio,
            capm_portfolio_beta,
            capm_portfolio_alpha,
            expected_capm_portfolio_return,
            rf,
            market_return_annual,
            len(capm_tickers),
            capm_weights_series.sum()
        ]
    })

    # 9.17 Alokasi dana
    capm_weights_summary["Allocation"] = (
        capm_weights_summary["Weight"] * investment_amount
    )

    weights_df = capm_weights_summary.merge(
        stock_summary,
        on="Ticker",
        how="left",
        suffixes=("", "_summary")
    )

    weights_df = weights_df.sort_values(
        by="Weight",
        ascending=False
    ).reset_index(drop=True)

    return {
        "method": "CAPM",
        "weights": weights_df,
        "portfolio_daily_return": capm_portfolio_daily_return,
        "portfolio_annual_return": capm_portfolio_annual_return,
        "portfolio_annual_risk": capm_portfolio_annual_volatility,
        "sharpe_ratio": capm_sharpe_ratio,
        "portfolio_beta": capm_portfolio_beta,
        "portfolio_alpha": capm_portfolio_alpha,
        "expected_capm_portfolio_return": expected_capm_portfolio_return,
        "risk_free_rate": rf,
        "market_return": market_return_annual,
        "selected_stock_count": len(capm_tickers),
        "total_weight": capm_weights_series.sum(),
        "selected_tickers": capm_tickers,
        "capm_inverse_covariance_matrix": capm_inverse_covariance_df,
        "all_weights_before_cutoff": capm_weights_summary_all,
        "capm_portfolio_summary": capm_portfolio_summary
    }


# =========================================================
# RUN SELECTED MODEL
# =========================================================

def run_selected_model(
    model_choice,
    feature_result,
    investment_amount=10_000_000,
    trading_days=252
):
    if model_choice == "MVEP":
        return run_mvep(
            feature_result=feature_result,
            investment_amount=investment_amount,
            trading_days=trading_days
        )

    if model_choice == "SIM":
        return run_sim(
            feature_result=feature_result,
            investment_amount=investment_amount,
            trading_days=trading_days
        )

    if model_choice == "CAPM":
        return run_capm(
            feature_result=feature_result,
            investment_amount=investment_amount,
            trading_days=trading_days,
            top_n=10
        )

    raise ValueError("Model harus MVEP, SIM, atau CAPM.")


# =========================================================
# COMPARE ALL MODELS
# =========================================================

def compare_all_models(
    feature_result,
    investment_amount=10_000_000,
    trading_days=252
):
    mvep_result = run_mvep(
        feature_result=feature_result,
        investment_amount=investment_amount,
        trading_days=trading_days
    )

    sim_result = run_sim(
        feature_result=feature_result,
        investment_amount=investment_amount,
        trading_days=trading_days
    )

    capm_result = run_capm(
        feature_result=feature_result,
        investment_amount=investment_amount,
        trading_days=trading_days,
        top_n=10
    )

    comparison_df = pd.DataFrame({
        "Model": [
            "MVEP",
            "SIM",
            "CAPM"
        ],
        "Annualized_Return": [
            mvep_result["portfolio_annual_return"],
            sim_result["portfolio_annual_return"],
            capm_result["portfolio_annual_return"]
        ],
        "Annualized_Volatility": [
            mvep_result["portfolio_annual_risk"],
            sim_result["portfolio_annual_risk"],
            capm_result["portfolio_annual_risk"]
        ],
        "Sharpe_Ratio": [
            mvep_result["sharpe_ratio"],
            sim_result["sharpe_ratio"],
            capm_result["sharpe_ratio"]
        ],
        "Portfolio_Beta": [
            np.nan,
            sim_result["portfolio_beta"],
            capm_result["portfolio_beta"]
        ],
        "Portfolio_Alpha": [
            np.nan,
            sim_result["portfolio_alpha"],
            capm_result["portfolio_alpha"]
        ],
        "Selected_Stock_Count": [
            mvep_result["selected_stock_count"],
            sim_result["selected_stock_count"],
            capm_result["selected_stock_count"]
        ]
    })

    # Perbandingan bobot saham antar model
    mvep_weight_compare = mvep_result["weights"][["Ticker", "Weight"]].copy()
    mvep_weight_compare = mvep_weight_compare.rename(
        columns={"Weight": "MVEP_Weight"}
    )

    sim_weight_compare = sim_result["weights"][["Ticker", "Weight"]].copy()
    sim_weight_compare = sim_weight_compare.rename(
        columns={"Weight": "SIM_Weight"}
    )

    capm_weight_compare = capm_result["weights"][["Ticker", "Weight"]].copy()
    capm_weight_compare = capm_weight_compare.rename(
        columns={"Weight": "CAPM_Weight"}
    )

    portfolio_weight_comparison = (
        mvep_weight_compare
        .merge(sim_weight_compare, on="Ticker", how="outer")
        .merge(capm_weight_compare, on="Ticker", how="outer")
    )

    portfolio_weight_comparison = portfolio_weight_comparison.fillna(0)

    return {
        "MVEP": mvep_result,
        "SIM": sim_result,
        "CAPM": capm_result,
        "comparison_df": comparison_df,
        "portfolio_weight_comparison": portfolio_weight_comparison
    }