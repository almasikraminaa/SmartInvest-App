import numpy as np
import pandas as pd


# =========================================================
# LOG RETURN
# =========================================================

def calculate_log_return(price_data):
    """
    Menghitung log return saham.
    Sama seperti Colab:
    log_return_matrix = np.log(filtered_price / filtered_price.shift(1)).dropna()
    """

    log_return_matrix = np.log(price_data / price_data.shift(1)).dropna()

    return log_return_matrix


def calculate_market_log_return(market_price):
    """
    Menghitung log return market / IHSG.
    Sama seperti Colab:
    market_log_return = np.log(filtered_market["IHSG"] / filtered_market["IHSG"].shift(1)).dropna()
    """

    if isinstance(market_price, pd.DataFrame):
        if "IHSG" in market_price.columns:
            market_series = market_price["IHSG"]
        else:
            market_series = market_price.iloc[:, 0]
    else:
        market_series = market_price

    market_log_return = np.log(
        market_series / market_series.shift(1)
    ).dropna()

    market_log_return.name = "market_log_return"

    return market_log_return


# =========================================================
# ALIGN DATA
# =========================================================

def align_stock_and_market_return(log_return_matrix, market_log_return):
    """
    Align return saham dan return market berdasarkan common index.
    Sama seperti Colab:
    common_index = log_return_matrix.index.intersection(market_log_return.index)
    """

    common_index = log_return_matrix.index.intersection(
        market_log_return.index
    )

    log_return_matrix = log_return_matrix.loc[common_index]
    market_log_return = market_log_return.loc[common_index]

    return log_return_matrix, market_log_return


# =========================================================
# ELIMINASI RETURN NEGATIF
# =========================================================

def filter_positive_mean_return(log_return_matrix):
    """
    Mengeliminasi saham dengan mean log return negatif.
    Ini wajib agar hasil dashboard sama dengan Colab.
    """

    mean_log_return_initial = log_return_matrix.mean()

    negative_return_tickers = mean_log_return_initial[
        mean_log_return_initial < 0
    ].index.tolist()

    positive_return_tickers = mean_log_return_initial[
        mean_log_return_initial >= 0
    ].index.tolist()

    log_return_matrix = log_return_matrix[positive_return_tickers]

    if log_return_matrix.empty or log_return_matrix.shape[1] == 0:
        raise ValueError(
            "Tidak ada saham dengan mean log return positif pada periode ini."
        )

    return log_return_matrix, negative_return_tickers, positive_return_tickers


# =========================================================
# RISK FREE RATE
# =========================================================

def calculate_risk_free_rate(filtered_bi_rate, trading_days=252):
    """
    Mengambil rata-rata BI Rate sebagai risk-free rate tahunan.
    Sama seperti Colab:
    risk_free_rate_daily = (1 + risk_free_rate_annual) ** (1 / trading_days) - 1
    """

    if isinstance(filtered_bi_rate, pd.DataFrame):
        if "BI_Rate" in filtered_bi_rate.columns:
            rf_series = filtered_bi_rate["BI_Rate"]
        else:
            rf_series = filtered_bi_rate.iloc[:, 0]
    else:
        rf_series = filtered_bi_rate

    rf_series = pd.to_numeric(rf_series, errors="coerce").dropna()

    if rf_series.empty:
        raise ValueError("Data BI Rate kosong atau tidak valid.")

    # Jika masih persen, misal 6.00, ubah menjadi 0.06
    if rf_series.mean() > 1:
        rf_series = rf_series / 100

    risk_free_rate_annual = rf_series.mean()

    risk_free_rate_daily = (
        (1 + risk_free_rate_annual) ** (1 / trading_days) - 1
    )

    return risk_free_rate_annual, risk_free_rate_daily


# =========================================================
# BETA & ALPHA
# =========================================================

def calculate_beta(log_return_matrix, market_log_return):
    """
    Menghitung beta saham terhadap IHSG.
    Sama seperti Colab:
    beta_i = covariance(return_i, return_market) / variance(return_market)
    """

    beta_values = {}

    market_variance = market_log_return.var()

    if market_variance == 0 or pd.isna(market_variance):
        raise ValueError("Market variance bernilai 0 atau tidak valid.")

    for ticker in log_return_matrix.columns:
        covariance_with_market = log_return_matrix[ticker].cov(
            market_log_return
        )

        beta_values[ticker] = covariance_with_market / market_variance

    beta_series = pd.Series(beta_values, name="beta")

    return beta_series


def calculate_alpha(mean_log_return, beta_series, market_mean_log_return):
    """
    Menghitung alpha saham.
    Sama seperti Colab:
    alpha_i = mean_return_i - beta_i * mean_return_market
    """

    alpha_series = mean_log_return - (
        beta_series * market_mean_log_return
    )

    alpha_series.name = "alpha"

    return alpha_series


# =========================================================
# STOCK SUMMARY
# =========================================================

def create_stock_summary(
    mean_log_return,
    std_log_return,
    var_log_return,
    sum_log_return,
    annualized_return,
    annualized_volatility,
    sharpe_ratio,
    beta_series,
    alpha_series,
    expected_return_capm
):
    """
    Membuat stock summary final.
    Nama kolom dibuat sama seperti Colab.
    """

    stock_summary = pd.DataFrame({
        "mean_log_return": mean_log_return,
        "std_log_return": std_log_return,
        "var_log_return": var_log_return,
        "sum_log_return": sum_log_return,
        "annualized_return": annualized_return,
        "annualized_volatility": annualized_volatility,
        "sharpe_ratio": sharpe_ratio,
        "beta": beta_series,
        "alpha": alpha_series,
        "expected_return_capm": expected_return_capm
    }).reset_index().rename(columns={"index": "Ticker"})

    stock_summary = stock_summary.replace([np.inf, -np.inf], np.nan)

    return stock_summary


# =========================================================
# MAIN FEATURE ENGINEERING
# =========================================================

def feature_engineering(
    filtered_price,
    filtered_market,
    filtered_bi_rate,
    trading_days=252
):
    """
    Main function feature engineering sesuai alur Colab.

    Output utama:
    - log_return_matrix
    - market_log_return
    - covariance_matrix
    - correlation_matrix
    - beta_series
    - alpha_series
    - expected_return_capm
    - stock_summary
    - annual_risk_free_rate
    - daily_risk_free_rate
    - annual_market_return
    - feature_engineering_summary
    """

    # =====================================================
    # 5.1 LOG RETURN SAHAM
    # =====================================================

    log_return_matrix = calculate_log_return(filtered_price)

    # =====================================================
    # 5.2 LOG RETURN MARKET / IHSG
    # =====================================================

    market_log_return = calculate_market_log_return(filtered_market)

    # =====================================================
    # 5.3 ALIGN RETURN SAHAM DAN MARKET
    # =====================================================

    log_return_matrix, market_log_return = align_stock_and_market_return(
        log_return_matrix=log_return_matrix,
        market_log_return=market_log_return
    )

    initial_ticker_count = log_return_matrix.shape[1]

    # =====================================================
    # 5.4 - 5.5 ELIMINASI SAHAM RETURN NEGATIF
    # =====================================================

    log_return_matrix, negative_return_tickers, positive_return_tickers = (
        filter_positive_mean_return(log_return_matrix)
    )

    # =====================================================
    # 5.6 STATISTIK LOG RETURN SAHAM
    # =====================================================

    mean_log_return = log_return_matrix.mean()
    std_log_return = log_return_matrix.std()
    var_log_return = log_return_matrix.var()
    sum_log_return = log_return_matrix.sum()

    annualized_return = mean_log_return * trading_days
    annualized_volatility = std_log_return * np.sqrt(trading_days)

    stock_return_stats = pd.DataFrame({
        "mean_log_return": mean_log_return,
        "std_log_return": std_log_return,
        "var_log_return": var_log_return,
        "sum_log_return": sum_log_return,
        "annualized_return": annualized_return,
        "annualized_volatility": annualized_volatility
    })

    # =====================================================
    # 5.7 STATISTIK LOG RETURN IHSG
    # =====================================================

    market_mean_log_return = market_log_return.mean()
    market_std_log_return = market_log_return.std()
    market_var_log_return = market_log_return.var()
    market_sum_log_return = market_log_return.sum()

    market_annualized_return = (
        market_mean_log_return * trading_days
    )

    market_annualized_volatility = (
        market_std_log_return * np.sqrt(trading_days)
    )

    market_return_stats = pd.DataFrame({
        "mean_log_return": [market_mean_log_return],
        "std_log_return": [market_std_log_return],
        "var_log_return": [market_var_log_return],
        "sum_log_return": [market_sum_log_return],
        "annualized_return": [market_annualized_return],
        "annualized_volatility": [market_annualized_volatility]
    }, index=["IHSG"])

    # =====================================================
    # 5.8 COVARIANCE MATRIX
    # =====================================================

    covariance_matrix = log_return_matrix.cov()

    # =====================================================
    # 5.9 CORRELATION MATRIX
    # =====================================================

    correlation_matrix = log_return_matrix.corr()

    # =====================================================
    # 5.10 RISK-FREE RATE
    # =====================================================

    risk_free_rate_annual, risk_free_rate_daily = calculate_risk_free_rate(
        filtered_bi_rate=filtered_bi_rate,
        trading_days=trading_days
    )

    # =====================================================
    # 5.11 BETA SAHAM
    # =====================================================

    beta_series = calculate_beta(
        log_return_matrix=log_return_matrix,
        market_log_return=market_log_return
    )

    # =====================================================
    # 5.12 ALPHA SAHAM
    # =====================================================

    alpha_series = calculate_alpha(
        mean_log_return=mean_log_return,
        beta_series=beta_series,
        market_mean_log_return=market_mean_log_return
    )

    # =====================================================
    # 5.13 EXPECTED RETURN CAPM
    # =====================================================

    expected_return_capm = risk_free_rate_annual + beta_series * (
        market_annualized_return - risk_free_rate_annual
    )

    expected_return_capm.name = "expected_return_capm"

    # =====================================================
    # 5.14 SHARPE RATIO
    # =====================================================

    sharpe_ratio = (
        annualized_return - risk_free_rate_annual
    ) / annualized_volatility

    sharpe_ratio.name = "sharpe_ratio"

    # =====================================================
    # 5.15 STOCK SUMMARY FINAL
    # =====================================================

    stock_summary = create_stock_summary(
        mean_log_return=mean_log_return,
        std_log_return=std_log_return,
        var_log_return=var_log_return,
        sum_log_return=sum_log_return,
        annualized_return=annualized_return,
        annualized_volatility=annualized_volatility,
        sharpe_ratio=sharpe_ratio,
        beta_series=beta_series,
        alpha_series=alpha_series,
        expected_return_capm=expected_return_capm
    )

    # =====================================================
    # 5.16 FEATURE ENGINEERING SUMMARY
    # =====================================================

    feature_engineering_summary = {
        "initial_ticker_count": initial_ticker_count,
        "removed_negative_return_count": len(negative_return_tickers),
        "final_ticker_count": log_return_matrix.shape[1],
        "removed_negative_return_tickers": negative_return_tickers,
        "positive_return_tickers": positive_return_tickers,
        "trading_days_used": log_return_matrix.shape[0],
        "risk_free_rate_annual": risk_free_rate_annual,
        "risk_free_rate_daily": risk_free_rate_daily,
        "market_mean_log_return": market_mean_log_return,
        "market_annualized_return": market_annualized_return
    }

    # =====================================================
    # RETURN OUTPUT
    # =====================================================

    return {
        "log_return_matrix": log_return_matrix,
        "market_log_return": market_log_return,
        "covariance_matrix": covariance_matrix,
        "correlation_matrix": correlation_matrix,
        "stock_return_stats": stock_return_stats,
        "market_return_stats": market_return_stats,
        "mean_log_return": mean_log_return,
        "std_log_return": std_log_return,
        "var_log_return": var_log_return,
        "sum_log_return": sum_log_return,
        "annualized_return": annualized_return,
        "annualized_volatility": annualized_volatility,
        "beta_series": beta_series,
        "alpha_series": alpha_series,
        "expected_return_capm": expected_return_capm,
        "sharpe_ratio": sharpe_ratio,
        "stock_summary": stock_summary,
        "annual_risk_free_rate": risk_free_rate_annual,
        "daily_risk_free_rate": risk_free_rate_daily,
        "annual_market_return": market_annualized_return,
        "feature_engineering_summary": feature_engineering_summary,
        "negative_return_tickers": negative_return_tickers,
        "positive_return_tickers": positive_return_tickers
    }