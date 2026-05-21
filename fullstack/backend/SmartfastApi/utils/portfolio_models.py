import numpy as np
import pandas as pd


# =========================================================
# HELPER: PORTFOLIO PERFORMANCE
# =========================================================

def calculate_portfolio_performance(
    weights,
    log_return_matrix,
    annual_risk_free_rate=0.05,
    trading_days=252
):
    weights = np.array(weights)

    mean_daily_return = log_return_matrix.mean()
    covariance_matrix = log_return_matrix.cov()

    portfolio_daily_return = log_return_matrix @ weights

    portfolio_annual_return = np.sum(mean_daily_return * weights) * trading_days

    portfolio_annual_risk = np.sqrt(
        np.dot(weights.T, np.dot(covariance_matrix * trading_days, weights))
    )

    sharpe_ratio = (
        portfolio_annual_return - annual_risk_free_rate
    ) / portfolio_annual_risk

    return {
        "portfolio_daily_return": portfolio_daily_return,
        "portfolio_annual_return": portfolio_annual_return,
        "portfolio_annual_risk": portfolio_annual_risk,
        "sharpe_ratio": sharpe_ratio
    }


# =========================================================
# MVEP / MINIMUM VARIANCE EFFICIENT PORTFOLIO
# =========================================================

def run_mvep(
    feature_result,
    investment_amount=10_000_000,
    trading_days=252
):
    log_return_matrix = feature_result["log_return_matrix"]
    covariance_matrix = feature_result["covariance_matrix"]
    correlation_matrix = feature_result["correlation_matrix"]
    stock_summary = feature_result["stock_summary"]
    annual_risk_free_rate = feature_result["annual_risk_free_rate"]

    # Ambil 10 pasangan saham dengan korelasi terendah
    corr_matrix_mvep = correlation_matrix.copy()
    corr_matrix_mvep.index.name = None
    corr_matrix_mvep.columns.name = None

    corr_pairs_mvep = corr_matrix_mvep.stack().reset_index()
    corr_pairs_mvep.columns = ["Ticker_1", "Ticker_2", "Correlation"]

    # Hilangkan korelasi diri sendiri
    corr_pairs_mvep = corr_pairs_mvep[
        corr_pairs_mvep["Ticker_1"] != corr_pairs_mvep["Ticker_2"]
    ]

    # Hilangkan duplikasi pasangan A-B dan B-A
    corr_pairs_mvep["pair"] = corr_pairs_mvep.apply(
        lambda x: tuple(sorted([x["Ticker_1"], x["Ticker_2"]])),
        axis=1
    )
    corr_pairs_mvep = corr_pairs_mvep.drop_duplicates("pair").drop(columns="pair")

    top_low_corr_pairs_mvep = corr_pairs_mvep.sort_values(
        by="Correlation",
        ascending=True
    ).head(10)

    # Ambil unique ticker dari 10 pasangan korelasi terendah
    tickers = sorted(
        list(
            set(top_low_corr_pairs_mvep["Ticker_1"])
            .union(set(top_low_corr_pairs_mvep["Ticker_2"]))
        )
    )

    cov_matrix = covariance_matrix.loc[tickers, tickers].values
    selected_log_return = log_return_matrix[tickers]

    inv_cov_matrix = np.linalg.pinv(cov_matrix)

    ones = np.ones(len(tickers))

    weights = inv_cov_matrix @ ones / (ones.T @ inv_cov_matrix @ ones)

    performance = calculate_portfolio_performance(
        weights=weights,
        log_return_matrix=selected_log_return,
        annual_risk_free_rate=annual_risk_free_rate,
        trading_days=trading_days
    )

    weights_df = pd.DataFrame({
        "Ticker": tickers,
        "Weight": weights,
        "Allocation": weights * investment_amount
    })

    weights_df = weights_df.merge(
        stock_summary,
        on="Ticker",
        how="left"
    )

    weights_df = weights_df.sort_values(
        by="Weight",
        ascending=False
    ).reset_index(drop=True)

    return {
        "method": "MVEP",
        "weights": weights_df,
        "portfolio_daily_return": performance["portfolio_daily_return"],
        "portfolio_annual_return": performance["portfolio_annual_return"],
        "portfolio_annual_risk": performance["portfolio_annual_risk"],
        "sharpe_ratio": performance["sharpe_ratio"]
    }


# =========================================================
# SIM / SINGLE INDEX MODEL
# =========================================================

def run_sim(
    feature_result,
    investment_amount=10_000_000,
    trading_days=252
):
    log_return_matrix = feature_result["log_return_matrix"]
    market_log_return = feature_result["market_log_return"]
    beta_series = feature_result["beta_series"]
    alpha_series = feature_result["alpha_series"]
    stock_summary = feature_result["stock_summary"]
    annual_risk_free_rate = feature_result["annual_risk_free_rate"]

    tickers = log_return_matrix.columns.tolist()

    # Menggunakan expected return tahunan dan variance tahunan untuk menyamakan skala c_star dengan DS notebook
    mean_annual_return = log_return_matrix.mean() * trading_days

    market_variance_annual = market_log_return.var() * trading_days

    residual_variance_annual = {}

    for ticker in tickers:
        expected_stock_return = (
            alpha_series[ticker]
            + beta_series[ticker] * market_log_return
        )

        residual = log_return_matrix[ticker] - expected_stock_return

        residual_variance_annual[ticker] = residual.var() * trading_days

    residual_variance_annual = pd.Series(
        residual_variance_annual,
        name="residual_variance"
    )

    sim_df = pd.DataFrame({
        "Ticker": tickers,
        "mean_annual_return": mean_annual_return,
        "beta": beta_series,
        "alpha": alpha_series,
        "residual_variance": residual_variance_annual
    })

    sim_df["excess_return"] = (
        sim_df["mean_annual_return"] - annual_risk_free_rate
    )

    sim_df["ERB"] = sim_df["excess_return"] / sim_df["beta"]

    sim_df = sim_df.replace([np.inf, -np.inf], np.nan)
    sim_df = sim_df.dropna()

    sim_df = sim_df.sort_values(
        by="ERB",
        ascending=False
    ).reset_index(drop=True)

    sim_df["A_i"] = (
        sim_df["excess_return"]
        * sim_df["beta"]
        / sim_df["residual_variance"]
    )

    sim_df["B_i"] = (
        sim_df["beta"] ** 2
        / sim_df["residual_variance"]
    )

    sim_df["cum_A"] = sim_df["A_i"].cumsum()
    sim_df["cum_B"] = sim_df["B_i"].cumsum()

    sim_df["C_i"] = (
        market_variance_annual * sim_df["cum_A"]
    ) / (
        1 + market_variance_annual * sim_df["cum_B"]
    )

    eligible_df = sim_df[sim_df["ERB"] > sim_df["C_i"]].copy()

    if eligible_df.empty:
        eligible_df = sim_df.head(5).copy()

    c_star = eligible_df["C_i"].iloc[-1]

    eligible_df["Z_i"] = (
        eligible_df["beta"]
        / eligible_df["residual_variance"]
    ) * (
        eligible_df["ERB"] - c_star
    )

    eligible_df = eligible_df[eligible_df["Z_i"] > 0].copy()

    if eligible_df.empty:
        eligible_df = sim_df.head(5).copy()
        eligible_df["Z_i"] = 1 / len(eligible_df)

    eligible_df["Weight"] = eligible_df["Z_i"] / eligible_df["Z_i"].sum()

    selected_tickers = eligible_df["Ticker"].tolist()
    weights = eligible_df["Weight"].values

    selected_log_return = log_return_matrix[selected_tickers]

    performance = calculate_portfolio_performance(
        weights=weights,
        log_return_matrix=selected_log_return,
        annual_risk_free_rate=annual_risk_free_rate,
        trading_days=trading_days
    )

    weights_df = eligible_df[[
        "Ticker",
        "Weight",
        "ERB",
        "beta",
        "alpha",
        "residual_variance"
    ]].copy()

    weights_df["Allocation"] = weights_df["Weight"] * investment_amount

    weights_df = weights_df.merge(
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
        "method": "SIM",
        "weights": weights_df,
        "portfolio_daily_return": performance["portfolio_daily_return"],
        "portfolio_annual_return": performance["portfolio_annual_return"],
        "portfolio_annual_risk": performance["portfolio_annual_risk"],
        "sharpe_ratio": performance["sharpe_ratio"],
        "c_star": c_star
    }


# =========================================================
# CAPM PORTFOLIO
# =========================================================

def run_capm(
    feature_result,
    investment_amount=10_000_000,
    trading_days=252
):
    log_return_matrix = feature_result["log_return_matrix"]
    covariance_matrix = feature_result["covariance_matrix"]
    expected_return_capm = feature_result["expected_return_capm"]
    stock_summary = feature_result["stock_summary"]
    annual_risk_free_rate = feature_result["annual_risk_free_rate"]

    tickers = log_return_matrix.columns.tolist()

    expected_return = expected_return_capm.reindex(tickers)

    excess_return = expected_return - annual_risk_free_rate

    cov_matrix_annual = covariance_matrix.values * trading_days

    inv_cov_matrix = np.linalg.pinv(cov_matrix_annual)

    raw_weights = inv_cov_matrix @ excess_return.values

    if raw_weights.sum() == 0:
        initial_weights = np.ones(len(tickers)) / len(tickers)
    else:
        initial_weights = raw_weights / raw_weights.sum()

    # Urutkan berdasarkan bobot secara descending, ambil Top 10
    initial_weights_series = pd.Series(initial_weights, index=tickers)
    top_weights_series = (
        initial_weights_series
        .sort_values(ascending=False)
        .head(10)
    )

    # Normalisasi ulang bobot Top 10 agar jumlahnya tepat 1.0 (100%)
    if top_weights_series.sum() != 0:
        weights = (top_weights_series / top_weights_series.sum()).values
    else:
        weights = np.ones(len(top_weights_series)) / len(top_weights_series)

    tickers = top_weights_series.index.tolist()
    selected_log_return = log_return_matrix[tickers]
    expected_return = expected_return.reindex(tickers)

    performance = calculate_portfolio_performance(
        weights=weights,
        log_return_matrix=selected_log_return,
        annual_risk_free_rate=annual_risk_free_rate,
        trading_days=trading_days
    )

    weights_df = pd.DataFrame({
        "Ticker": tickers,
        "Weight": weights,
        "Allocation": weights * investment_amount,
        "expected_return_capm": expected_return.values
    })

    weights_df = weights_df.merge(
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
        "portfolio_daily_return": performance["portfolio_daily_return"],
        "portfolio_annual_return": performance["portfolio_annual_return"],
        "portfolio_annual_risk": performance["portfolio_annual_risk"],
        "sharpe_ratio": performance["sharpe_ratio"]
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

    elif model_choice == "SIM":
        return run_sim(
            feature_result=feature_result,
            investment_amount=investment_amount,
            trading_days=trading_days
        )

    elif model_choice == "CAPM":
        return run_capm(
            feature_result=feature_result,
            investment_amount=investment_amount,
            trading_days=trading_days
        )

    else:
        raise ValueError("Model harus MVEP, SIM, atau CAPM.")


# =========================================================
# COMPARE ALL MODELS
# =========================================================

def compare_all_models(
    feature_result,
    investment_amount=10_000_000,
    trading_days=252
):

    # ==========================
    # RUN ALL MODEL
    # ==========================

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
        trading_days=trading_days
    )

    # ==========================
    # DEBUG
    # ==========================

    print(
        sim_result[
            "weights"
        ].columns
    )

    print(
        capm_result[
            "weights"
        ].columns
    )

    # ==========================
    # COMPARISON DATAFRAME
    # ==========================

    comparison_df = pd.DataFrame([

        # ==========================
        # MVEP
        # ==========================

        {
            "Model":
                "MVEP",

            "Annual Return":
                float(
                    mvep_result[
                        "portfolio_annual_return"
                    ]
                ),

            "Annual Risk":
                float(
                    mvep_result[
                        "portfolio_annual_risk"
                    ]
                ),

            "Sharpe Ratio":
                float(
                    mvep_result[
                        "sharpe_ratio"
                    ]
                ),

            # MVEP netral
            "Alpha":
                None,

            "Beta":
                None,

            "Number of Stocks":
                len(
                    mvep_result[
                        "weights"
                    ]
                )
        },

        # ==========================
        # SIM
        # ==========================

        {
            "Model":
                "SIM",

            "Annual Return":
                float(
                    sim_result[
                        "portfolio_annual_return"
                    ]
                ),

            "Annual Risk":
                float(
                    sim_result[
                        "portfolio_annual_risk"
                    ]
                ),

            "Sharpe Ratio":
                float(
                    sim_result[
                        "sharpe_ratio"
                    ]
                ),

            "Alpha":
                float(
                    sim_result[
                        "weights"
                    ][
                        "alpha"
                    ].mean()
                ),

            "Beta":
                float(
                    sim_result[
                        "weights"
                    ][
                        "beta"
                    ].mean()
                ),

            "Number of Stocks":
                len(
                    sim_result[
                        "weights"
                    ]
                )
        },

        # ==========================
        # CAPM
        # ==========================

        {
            "Model":
                "CAPM",

            "Annual Return":
                float(
                    capm_result[
                        "portfolio_annual_return"
                    ]
                ),

            "Annual Risk":
                float(
                    capm_result[
                        "portfolio_annual_risk"
                    ]
                ),

            "Sharpe Ratio":
                float(
                    capm_result[
                        "sharpe_ratio"
                    ]
                ),

            "Alpha":
                float(
                    capm_result[
                        "weights"
                    ][
                        "alpha"
                    ].mean()
                ),

            "Beta":
                float(
                    capm_result[
                        "weights"
                    ][
                        "beta"
                    ].mean()
                ),

            "Number of Stocks":
                len(
                    capm_result[
                        "weights"
                    ]
                )
        }
    ])

    return {

        "MVEP":
            mvep_result,

        "SIM":
            sim_result,

        "CAPM":
            capm_result,

        "comparison_df":
            comparison_df
    }