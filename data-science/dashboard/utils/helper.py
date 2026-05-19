import pandas as pd
import numpy as np


# =========================================================
# FORMAT ANGKA
# =========================================================

def format_rupiah(value):
    if pd.isna(value):
        return "-"

    return f"Rp {value:,.0f}".replace(",", ".")


def format_percent(value, decimals=2):
    if pd.isna(value):
        return "-"

    return f"{value * 100:.{decimals}f}%"


def format_number(value, decimals=2):
    if pd.isna(value):
        return "-"

    return f"{value:,.{decimals}f}"


def format_decimal(value, decimals=4):
    if pd.isna(value):
        return "-"

    return f"{value:.{decimals}f}"


# =========================================================
# FORMAT TABEL PORTFOLIO
# =========================================================

def format_portfolio_table(weights_df):
    df = weights_df.copy()

    if "Weight" in df.columns:
        df["Weight"] = df["Weight"].apply(format_percent)

    if "Allocation" in df.columns:
        df["Allocation"] = df["Allocation"].apply(format_rupiah)

    percent_columns = [
        "expected_return",
        "annualized_return",
        "annualized_volatility",
        "expected_return_capm",
        "Expected_Return_CAPM",
        "Excess_Return",
        "mean_log_return",
        "std_log_return",
        "var_log_return",
        "sum_log_return"
    ]

    for col in percent_columns:
        if col in df.columns:
            df[col] = df[col].apply(format_percent)

    decimal_columns = [
        "beta",
        "Beta",
        "alpha",
        "sharpe_ratio",
        "ERB",
        "Ai",
        "Bi",
        "Ci",
        "Zi",
        "residual_variance"
    ]

    for col in decimal_columns:
        if col in df.columns:
            df[col] = df[col].apply(format_decimal)

    return df


def format_comparison_table(comparison_df):
    df = comparison_df.copy()

    percent_columns = [
        "Annualized_Return",
        "Annualized_Volatility",
        "Portfolio_Alpha"
    ]

    for col in percent_columns:
        if col in df.columns:
            df[col] = df[col].apply(format_percent)

    decimal_columns = [
        "Sharpe_Ratio",
        "Portfolio_Beta"
    ]

    for col in decimal_columns:
        if col in df.columns:
            df[col] = df[col].apply(format_decimal)

    return df


def format_stock_summary_table(stock_summary):
    df = stock_summary.copy()

    percent_columns = [
        "mean_daily_log_return",
        "std_daily_log_return",
        "var_daily_log_return",
        "mean_log_return",
        "std_log_return",
        "var_log_return",
        "sum_log_return",
        "annualized_return",
        "annualized_volatility",
        "expected_return_capm"
    ]

    for col in percent_columns:
        if col in df.columns:
            df[col] = df[col].apply(format_percent)

    decimal_columns = [
        "sharpe_ratio",
        "beta",
        "alpha"
    ]

    for col in decimal_columns:
        if col in df.columns:
            df[col] = df[col].apply(format_decimal)

    return df


# =========================================================
# SELECT DISPLAY COLUMNS
# =========================================================

def select_portfolio_display_columns(weights_df):
    selected_columns = [
        "Ticker",
        "Weight",
        "Allocation",

        # Stock summary / MVEP
        "annualized_return",
        "annualized_volatility",
        "sharpe_ratio",

        # SIM
        "expected_return",
        "beta",
        "alpha",
        "residual_variance",
        "ERB",
        "Ai",
        "Bi",
        "Ci",
        "Zi",

        # CAPM
        "Beta",
        "Expected_Return_CAPM",
        "Excess_Return"
    ]

    existing_columns = [
        col for col in selected_columns
        if col in weights_df.columns
    ]

    return weights_df[existing_columns].copy()


def select_eda_display_columns(eda_stock_summary):
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
    if value_type == "percent":
        return format_percent(value)

    if value_type == "rupiah":
        return format_rupiah(value)

    if value_type == "decimal":
        return format_decimal(value)

    if value_type == "number":
        return format_number(value)

    return str(value)


def get_best_model_by_sharpe(comparison_df):
    if comparison_df.empty:
        return None

    best_row = comparison_df.sort_values(
        by="Sharpe_Ratio",
        ascending=False
    ).iloc[0]

    return best_row["Model"]


def get_lowest_risk_model(comparison_df):
    if comparison_df.empty:
        return None

    best_row = comparison_df.sort_values(
        by="Annualized_Volatility",
        ascending=True
    ).iloc[0]

    return best_row["Model"]


def get_highest_return_model(comparison_df):
    if comparison_df.empty:
        return None

    best_row = comparison_df.sort_values(
        by="Annualized_Return",
        ascending=False
    ).iloc[0]

    return best_row["Model"]


# =========================================================
# VALIDATION HELPER
# =========================================================

def validate_investment_amount(investment_amount, minimum_amount=100_000):
    if investment_amount < minimum_amount:
        raise ValueError(
            f"Modal investasi minimal {format_rupiah(minimum_amount)}."
        )

    return investment_amount


def clean_positive_weights(weights_df):
    if "Weight" not in weights_df.columns:
        return weights_df

    return weights_df[weights_df["Weight"] > 0].copy()


def normalize_weights(weights_df):
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
        f"Analisis dilakukan terhadap {valid_ticker_count} saham valid. "
        f"Hasil ini bersifat decision support dan bukan merupakan saran finansial mutlak."
    )

    return advisor_text