import numpy as np
import pandas as pd


# =========================================================
# PREPARE EDA DATA
# =========================================================

def prepare_eda_data(index_choice, price_matrix, index_map):
    """
    Mengambil data harga saham berdasarkan pilihan indeks.
    """

    if index_choice not in index_map:
        raise ValueError(
            f"Index {index_choice} tidak tersedia. Pilih dari: {list(index_map.keys())}"
        )

    selected_tickers = index_map[index_choice]

    available_tickers = [
        ticker for ticker in selected_tickers
        if ticker in price_matrix.columns
    ]

    unavailable_tickers = [
        ticker for ticker in selected_tickers
        if ticker not in price_matrix.columns
    ]

    eda_price = price_matrix[available_tickers].copy()

    if eda_price.empty:
        raise ValueError(f"Tidak ada data harga untuk indeks {index_choice}.")

    return {
        "index_choice": index_choice,
        "eda_price": eda_price,
        "available_tickers": available_tickers,
        "unavailable_tickers": unavailable_tickers
    }


# =========================================================
# LOG RETURN
# =========================================================

def calculate_eda_log_return(eda_price):
    """
    Menghitung log return untuk EDA.
    Dibuat sama seperti Colab: tidak drop NaN.
    """

    eda_log_return = np.log(eda_price / eda_price.shift(1))

    return eda_log_return


# =========================================================
# STOCK SUMMARY
# =========================================================

def create_eda_stock_summary(
    eda_log_return,
    trading_days=252,
    risk_free_rate=0.05
):
    """
    Membuat summary statistik saham untuk EDA.
    """

    mean_daily_log_return = eda_log_return.mean()
    std_daily_log_return = eda_log_return.std()
    var_daily_log_return = eda_log_return.var()
    sum_log_return = eda_log_return.sum()

    annualized_return = mean_daily_log_return * trading_days
    annualized_volatility = std_daily_log_return * np.sqrt(trading_days)

    sharpe_ratio = (
        annualized_return - risk_free_rate
    ) / annualized_volatility

    stock_summary = pd.DataFrame({
        "mean_daily_log_return": mean_daily_log_return,
        "std_daily_log_return": std_daily_log_return,
        "var_daily_log_return": var_daily_log_return,
        "sum_log_return": sum_log_return,
        "annualized_return": annualized_return,
        "annualized_volatility": annualized_volatility,
        "sharpe_ratio": sharpe_ratio
    })

    stock_summary.index.name = "Ticker"
    stock_summary = stock_summary.reset_index()

    stock_summary = stock_summary.replace([np.inf, -np.inf], np.nan)

    return stock_summary


# =========================================================
# TOP / BOTTOM RETURN
# =========================================================

def get_top_bottom_return(eda_stock_summary, n=10):
    """
    Mengambil top dan bottom saham berdasarkan annualized return.
    """

    top_return = eda_stock_summary.sort_values(
        by="annualized_return",
        ascending=False
    ).head(n)

    bottom_return = eda_stock_summary.sort_values(
        by="annualized_return",
        ascending=True
    ).head(n)

    return top_return, bottom_return


# =========================================================
# TOP / BOTTOM RISK
# =========================================================

def get_top_bottom_risk(eda_stock_summary, n=10):
    """
    Mengambil top dan bottom saham berdasarkan annualized volatility.
    """

    top_risk = eda_stock_summary.sort_values(
        by="annualized_volatility",
        ascending=False
    ).head(n)

    bottom_risk = eda_stock_summary.sort_values(
        by="annualized_volatility",
        ascending=True
    ).head(n)

    return top_risk, bottom_risk


# =========================================================
# TOP SHARPE RATIO
# =========================================================

def get_top_sharpe_ratio(eda_stock_summary, n=10):
    """
    Mengambil saham dengan Sharpe Ratio tertinggi.
    """

    top_sharpe = eda_stock_summary.sort_values(
        by="sharpe_ratio",
        ascending=False
    ).head(n)

    return top_sharpe


# =========================================================
# CORRELATION MATRIX
# =========================================================

def calculate_correlation_matrix(eda_log_return):
    """
    Menghitung correlation matrix antar saham.
    """

    correlation_matrix = eda_log_return.corr()

    return correlation_matrix


# =========================================================
# CUMULATIVE RETURN
# =========================================================

def calculate_cumulative_return(eda_log_return):
    """
    Menghitung cumulative return dari log return.
    """

    cumulative_return = np.exp(eda_log_return.fillna(0).cumsum())

    return cumulative_return


# =========================================================
# ROLLING VOLATILITY
# =========================================================

def calculate_rolling_volatility(
    eda_log_return,
    window=30,
    trading_days=252
):
    """
    Menghitung rolling volatility.
    """

    rolling_volatility = (
        eda_log_return.rolling(window=window).std()
        * np.sqrt(trading_days)
    )

    return rolling_volatility


# =========================================================
# KPI SUMMARY
# =========================================================

def create_eda_kpi_summary(eda_stock_summary):
    """
    Membuat KPI utama untuk tampilan dashboard.
    """

    total_stocks = len(eda_stock_summary)

    avg_return = eda_stock_summary["annualized_return"].mean()
    avg_volatility = eda_stock_summary["annualized_volatility"].mean()
    avg_sharpe = eda_stock_summary["sharpe_ratio"].mean()

    best_return_stock = eda_stock_summary.sort_values(
        by="annualized_return",
        ascending=False
    ).iloc[0]

    highest_risk_stock = eda_stock_summary.sort_values(
        by="annualized_volatility",
        ascending=False
    ).iloc[0]

    best_sharpe_stock = eda_stock_summary.sort_values(
        by="sharpe_ratio",
        ascending=False
    ).iloc[0]

    kpi_summary = {
        "total_stocks": total_stocks,
        "avg_return": avg_return,
        "avg_volatility": avg_volatility,
        "avg_sharpe": avg_sharpe,
        "best_return_ticker": best_return_stock["Ticker"],
        "best_return_value": best_return_stock["annualized_return"],
        "highest_risk_ticker": highest_risk_stock["Ticker"],
        "highest_risk_value": highest_risk_stock["annualized_volatility"],
        "best_sharpe_ticker": best_sharpe_stock["Ticker"],
        "best_sharpe_value": best_sharpe_stock["sharpe_ratio"]
    }

    return kpi_summary


# =========================================================
# RUN FULL EDA
# =========================================================

def run_eda(
    index_choice,
    price_matrix,
    index_map,
    trading_days=252,
    risk_free_rate=0.05,
    top_n=10
):
    """
    Menjalankan seluruh proses EDA untuk 1 indeks saham.
    """

    prepared_data = prepare_eda_data(
        index_choice=index_choice,
        price_matrix=price_matrix,
        index_map=index_map
    )

    eda_price = prepared_data["eda_price"]

    eda_log_return = calculate_eda_log_return(eda_price)

    eda_stock_summary = create_eda_stock_summary(
        eda_log_return=eda_log_return,
        trading_days=trading_days,
        risk_free_rate=risk_free_rate
    )

    top_return, bottom_return = get_top_bottom_return(
        eda_stock_summary,
        n=top_n
    )

    top_risk, bottom_risk = get_top_bottom_risk(
        eda_stock_summary,
        n=top_n
    )

    top_sharpe = get_top_sharpe_ratio(
        eda_stock_summary,
        n=top_n
    )

    correlation_matrix = calculate_correlation_matrix(
        eda_log_return
    )

    cumulative_return = calculate_cumulative_return(
        eda_log_return
    )

    rolling_volatility = calculate_rolling_volatility(
        eda_log_return,
        window=30,
        trading_days=trading_days
    )

    kpi_summary = create_eda_kpi_summary(
        eda_stock_summary
    )

    return {
        "index_choice": index_choice,
        "eda_price": eda_price,
        "eda_log_return": eda_log_return,
        "eda_stock_summary": eda_stock_summary,
        "top_return": top_return,
        "bottom_return": bottom_return,
        "top_risk": top_risk,
        "bottom_risk": bottom_risk,
        "top_sharpe": top_sharpe,
        "correlation_matrix": correlation_matrix,
        "cumulative_return": cumulative_return,
        "rolling_volatility": rolling_volatility,
        "kpi_summary": kpi_summary,
        "available_tickers": prepared_data["available_tickers"],
        "unavailable_tickers": prepared_data["unavailable_tickers"]
    }


# =========================================================
# RUN EDA FOR ALL INDEX
# =========================================================

def run_all_eda(
    price_matrix,
    index_map,
    trading_days=252,
    risk_free_rate=0.05,
    top_n=10
):
    """
    Menjalankan EDA untuk LQ45 dan IDX30.
    """

    eda_results = {}

    for index_choice in index_map.keys():
        eda_results[index_choice] = run_eda(
            index_choice=index_choice,
            price_matrix=price_matrix,
            index_map=index_map,
            trading_days=trading_days,
            risk_free_rate=risk_free_rate,
            top_n=top_n
        )

    return eda_results