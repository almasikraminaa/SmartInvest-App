import pandas as pd
import numpy as np


# =========================================================
# FORMAT ANGKA
# =========================================================

def format_rupiah(value):
    """
    Format angka menjadi Rupiah.
    """
    if pd.isna(value):
        return "-"

    return f"Rp {value:,.0f}".replace(",", ".")


def format_percent(value, decimals=2):
    """
    Format angka desimal menjadi persen.
    Contoh: 0.1234 -> 12.34%
    """
    if pd.isna(value):
        return "-"

    return f"{value * 100:.{decimals}f}%"


def format_number(value, decimals=2):
    """
    Format angka biasa.
    """
    if pd.isna(value):
        return "-"

    return f"{value:,.{decimals}f}"


def format_decimal(value, decimals=4):
    """
    Format angka desimal kecil.
    """
    if pd.isna(value):
        return "-"

    return f"{value:.{decimals}f}"


# =========================================================
# FORMAT TABEL PORTFOLIO
# =========================================================

def format_portfolio_table(weights_df):
    """
    Format tabel portfolio agar siap ditampilkan di Streamlit.
    """

    df = weights_df.copy()

    if "Weight" in df.columns:
        df["Weight"] = df["Weight"].apply(lambda x: format_percent(x))

    if "Allocation" in df.columns:
        df["Allocation"] = df["Allocation"].apply(lambda x: format_rupiah(x))

    percent_columns = [
        "annualized_return",
        "annualized_volatility",
        "expected_return_capm",
        "mean_daily_return",
        "volatility_daily"
    ]

    for col in percent_columns:
        if col in df.columns:
            df[col] = df[col].apply(lambda x: format_percent(x))

    decimal_columns = [
        "beta",
        "alpha",
        "sharpe_ratio",
        "ERB",
        "residual_variance"
    ]

    for col in decimal_columns:
        if col in df.columns:
            df[col] = df[col].apply(lambda x: format_decimal(x))

    return df


def format_comparison_table(comparison_df):
    """
    Format tabel perbandingan model.
    """

    df = comparison_df.copy()

    if "Annual Return" in df.columns:
        df["Annual Return"] = df["Annual Return"].apply(lambda x: format_percent(x))

    if "Annual Risk" in df.columns:
        df["Annual Risk"] = df["Annual Risk"].apply(lambda x: format_percent(x))

    if "Sharpe Ratio" in df.columns:
        df["Sharpe Ratio"] = df["Sharpe Ratio"].apply(lambda x: format_decimal(x))

    return df


def format_stock_summary_table(stock_summary):
    """
    Format tabel stock summary untuk EDA.
    """

    df = stock_summary.copy()

    percent_columns = [
        "mean_daily_log_return",
        "std_daily_log_return",
        "var_daily_log_return",
        "sum_log_return",
        "annualized_return",
        "annualized_volatility"
    ]

    for col in percent_columns:
        if col in df.columns:
            df[col] = df[col].apply(lambda x: format_percent(x))

    if "sharpe_ratio" in df.columns:
        df["sharpe_ratio"] = df["sharpe_ratio"].apply(lambda x: format_decimal(x))

    return df


# =========================================================
# CLEANING DISPLAY DATAFRAME
# =========================================================

def select_portfolio_display_columns(weights_df):
    """
    Memilih kolom penting untuk tabel rekomendasi portfolio.
    """

    selected_columns = [
        "Ticker",
        "Weight",
        "Allocation",
        "annualized_return",
        "annualized_volatility",
        "beta",
        "sharpe_ratio"
    ]

    existing_columns = [
        col for col in selected_columns
        if col in weights_df.columns
    ]

    return weights_df[existing_columns].copy()


def select_eda_display_columns(eda_stock_summary):
    """
    Memilih kolom penting untuk tabel EDA.
    """

    selected_columns = [
        "Ticker",
        "annualized_return",
        "annualized_volatility",
        "sharpe_ratio"
    ]

    existing_columns = [
        col for col in selected_columns
        if col in eda_stock_summary.columns
    ]

    return eda_stock_summary[existing_columns].copy()


# =========================================================
# KPI HELPER
# =========================================================

def create_metric_value(value, value_type="percent"):
    """
    Membuat value siap tampil untuk st.metric.
    """

    if value_type == "percent":
        return format_percent(value)

    elif value_type == "rupiah":
        return format_rupiah(value)

    elif value_type == "decimal":
        return format_decimal(value)

    elif value_type == "number":
        return format_number(value)

    else:
        return str(value)


def get_best_model_by_sharpe(comparison_df):
    """
    Mengambil model terbaik berdasarkan Sharpe Ratio.
    """

    if comparison_df.empty:
        return None

    best_row = comparison_df.sort_values(
        by="Sharpe Ratio",
        ascending=False
    ).iloc[0]

    return best_row["Model"]


def get_lowest_risk_model(comparison_df):
    """
    Mengambil model dengan risiko terendah.
    """

    if comparison_df.empty:
        return None

    best_row = comparison_df.sort_values(
        by="Annual Risk",
        ascending=True
    ).iloc[0]

    return best_row["Model"]


def get_highest_return_model(comparison_df):
    """
    Mengambil model dengan return tertinggi.
    """

    if comparison_df.empty:
        return None

    best_row = comparison_df.sort_values(
        by="Annual Return",
        ascending=False
    ).iloc[0]

    return best_row["Model"]


# =========================================================
# VALIDATION HELPER
# =========================================================

def validate_investment_amount(investment_amount, minimum_amount=100_000):
    """
    Validasi modal investasi.
    """

    if investment_amount < minimum_amount:
        raise ValueError(
            f"Modal investasi minimal {format_rupiah(minimum_amount)}."
        )

    return investment_amount


def clean_positive_weights(weights_df):
    """
    Mengambil saham dengan bobot positif saja.
    """

    if "Weight" not in weights_df.columns:
        return weights_df

    return weights_df[weights_df["Weight"] > 0].copy()


def normalize_weights(weights_df):
    """
    Normalisasi bobot agar total = 1.
    """

    df = weights_df.copy()

    if "Weight" not in df.columns:
        return df

    total_weight = df["Weight"].sum()

    if total_weight == 0:
        return df

    df["Weight"] = df["Weight"] / total_weight

    return df


# =========================================================
# AI ADVISOR SIMPLE RULE BASED
# =========================================================

def generate_simple_advisor(
    selected_model,
    portfolio_return,
    portfolio_risk,
    sharpe_ratio,
    valid_ticker_count
):
    """
    Membuat interpretasi sederhana untuk dashboard.
    """

    if sharpe_ratio >= 1:
        sharpe_text = "cukup baik karena nilai Sharpe Ratio berada di atas 1"
    elif sharpe_ratio >= 0:
        sharpe_text = "moderat karena Sharpe Ratio masih positif"
    else:
        sharpe_text = "kurang optimal karena Sharpe Ratio bernilai negatif"

    if portfolio_risk < 0.15:
        risk_text = "risiko portofolio tergolong rendah"
    elif portfolio_risk < 0.30:
        risk_text = "risiko portofolio tergolong sedang"
    else:
        risk_text = "risiko portofolio tergolong tinggi"

    advisor_text = (
        f"Berdasarkan metode {selected_model}, portofolio ini memiliki "
        f"estimasi return tahunan sebesar {format_percent(portfolio_return)} "
        f"dengan risiko tahunan sebesar {format_percent(portfolio_risk)}. "
        f"Secara umum, {risk_text}, dan performanya {sharpe_text}. "
        f"Analisis dilakukan terhadap {valid_ticker_count} saham valid setelah proses dynamic filtering. "
        f"Hasil ini bersifat decision support dan bukan merupakan saran finansial mutlak."
    )

    return advisor_text