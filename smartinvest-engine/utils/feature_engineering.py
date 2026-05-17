import numpy as np
import pandas as pd


def calculate_log_return(price_data):
    """
    Menghitung log return saham.
    """
    log_return = np.log(price_data / price_data.shift(1))
    log_return = log_return.dropna()

    return log_return


def calculate_market_log_return(market_price):
    """
    Menghitung log return IHSG.
    """

    if isinstance(market_price, pd.DataFrame):
        market_series = market_price.iloc[:, 0]
    else:
        market_series = market_price

    market_log_return = np.log(market_series / market_series.shift(1))
    market_log_return = market_log_return.dropna()

    return market_log_return


def calculate_risk_free_rate(bi_rate_daily):
    """
    Mengambil rata-rata BI Rate sebagai risk-free rate tahunan.
    """

    if isinstance(bi_rate_daily, pd.DataFrame):
        rf_series = bi_rate_daily.iloc[:, 0]
    else:
        rf_series = bi_rate_daily

    # Jika data BI Rate masih dalam persen, misal 6.00, ubah jadi 0.06
    if rf_series.mean() > 1:
        rf_series = rf_series / 100

    annual_risk_free_rate = rf_series.mean()
    daily_risk_free_rate = annual_risk_free_rate / 252

    return annual_risk_free_rate, daily_risk_free_rate


def calculate_beta_alpha(log_return_matrix, market_log_return):
    """
    Menghitung beta dan alpha saham terhadap IHSG.
    """

    beta_dict = {}
    alpha_dict = {}

    aligned_data = log_return_matrix.copy()
    aligned_market = market_log_return.reindex(aligned_data.index)

    for ticker in aligned_data.columns:
        stock_return = aligned_data[ticker]

        combined = pd.concat(
            [stock_return, aligned_market],
            axis=1
        ).dropna()

        combined.columns = ["stock_return", "market_return"]

        covariance = np.cov(
            combined["stock_return"],
            combined["market_return"]
        )[0, 1]

        market_variance = np.var(combined["market_return"])

        beta = covariance / market_variance

        alpha = (
            combined["stock_return"].mean()
            - beta * combined["market_return"].mean()
        )

        beta_dict[ticker] = beta
        alpha_dict[ticker] = alpha

    beta_series = pd.Series(beta_dict, name="beta")
    alpha_series = pd.Series(alpha_dict, name="alpha")

    return beta_series, alpha_series


def create_stock_summary(
    log_return_matrix,
    beta_series,
    alpha_series,
    expected_return_capm,
    annual_risk_free_rate,
    trading_days=252
):
    """
    Membuat ringkasan fitur saham.
    """

    mean_daily_return = log_return_matrix.mean()
    volatility_daily = log_return_matrix.std()
    variance_daily = log_return_matrix.var()

    annualized_return = mean_daily_return * trading_days
    annualized_volatility = volatility_daily * np.sqrt(trading_days)

    sharpe_ratio = (
        annualized_return - annual_risk_free_rate
    ) / annualized_volatility

    stock_summary = pd.DataFrame({
        "mean_daily_return": mean_daily_return,
        "volatility_daily": volatility_daily,
        "variance_daily": variance_daily,
        "annualized_return": annualized_return,
        "annualized_volatility": annualized_volatility,
        "beta": beta_series,
        "alpha": alpha_series,
        "expected_return_capm": expected_return_capm,
        "sharpe_ratio": sharpe_ratio
    })

    stock_summary.index.name = "Ticker"
    stock_summary = stock_summary.reset_index()

    return stock_summary


def feature_engineering(
    filtered_price,
    filtered_market,
    filtered_bi_rate,
    trading_days=252
):
    """
    Main function feature engineering.

    Input:
    - filtered_price
    - filtered_market
    - filtered_bi_rate

    Output:
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
    """

    # ==============================
    # LOG RETURN SAHAM
    # ==============================

    log_return_matrix = calculate_log_return(filtered_price)

    # ==============================
    # LOG RETURN MARKET / IHSG
    # ==============================

    market_log_return = calculate_market_log_return(filtered_market)

    # Align market return dengan index return saham
    market_log_return = market_log_return.reindex(log_return_matrix.index).dropna()

    # Align ulang log return saham
    log_return_matrix = log_return_matrix.loc[market_log_return.index]

    # ==============================
    # RISK FREE RATE
    # ==============================

    annual_risk_free_rate, daily_risk_free_rate = calculate_risk_free_rate(
        filtered_bi_rate
    )

    # ==============================
    # COVARIANCE & CORRELATION
    # ==============================

    covariance_matrix = log_return_matrix.cov()
    correlation_matrix = log_return_matrix.corr()

    # ==============================
    # MARKET RETURN
    # ==============================

    mean_market_daily_return = market_log_return.mean()
    annual_market_return = mean_market_daily_return * trading_days

    # ==============================
    # BETA & ALPHA
    # ==============================

    beta_series, alpha_series = calculate_beta_alpha(
        log_return_matrix,
        market_log_return
    )

    # ==============================
    # CAPM EXPECTED RETURN
    # ==============================

    expected_return_capm = annual_risk_free_rate + beta_series * (
        annual_market_return - annual_risk_free_rate
    )

    expected_return_capm.name = "expected_return_capm"

    # ==============================
    # STOCK SUMMARY
    # ==============================

    stock_summary = create_stock_summary(
        log_return_matrix=log_return_matrix,
        beta_series=beta_series,
        alpha_series=alpha_series,
        expected_return_capm=expected_return_capm,
        annual_risk_free_rate=annual_risk_free_rate,
        trading_days=trading_days
    )

    # ==============================
    # RETURN OUTPUT
    # ==============================

    return {
        "log_return_matrix": log_return_matrix,
        "market_log_return": market_log_return,
        "covariance_matrix": covariance_matrix,
        "correlation_matrix": correlation_matrix,
        "beta_series": beta_series,
        "alpha_series": alpha_series,
        "expected_return_capm": expected_return_capm,
        "stock_summary": stock_summary,
        "annual_risk_free_rate": annual_risk_free_rate,
        "daily_risk_free_rate": daily_risk_free_rate,
        "annual_market_return": annual_market_return
    }