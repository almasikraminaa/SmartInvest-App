import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go


# =========================================================
# EDA VISUALIZATION
# =========================================================

def plot_return_distribution(eda_log_return, index_name):
    data = eda_log_return.stack().reset_index()
    data.columns = ["Date", "Ticker", "Log Return"]

    fig = px.histogram(
        data,
        x="Log Return",
        nbins=100,
        title=f"Distribusi Daily Log Return Saham {index_name}"
    )

    fig.update_layout(
        xaxis_title="Daily Log Return",
        yaxis_title="Frekuensi",
        template="plotly_white"
    )

    return fig


def plot_volatility_distribution(eda_stock_summary, index_name):
    fig = px.histogram(
        eda_stock_summary,
        x="annualized_volatility",
        nbins=30,
        title=f"Distribusi Annualized Volatility Saham {index_name}"
    )

    fig.update_layout(
        xaxis_title="Annualized Volatility",
        yaxis_title="Jumlah Saham",
        template="plotly_white"
    )

    return fig


def plot_top_return(top_return, index_name):
    fig = px.bar(
        top_return,
        x="Ticker",
        y="annualized_return",
        title=f"Top 10 Annualized Return Saham {index_name}",
        text="annualized_return"
    )

    fig.update_traces(
        texttemplate="%{text:.2%}",
        textposition="outside"
    )

    fig.update_layout(
        xaxis_title="Ticker",
        yaxis_title="Annualized Return",
        template="plotly_white"
    )

    return fig


def plot_bottom_return(bottom_return, index_name):
    fig = px.bar(
        bottom_return,
        x="Ticker",
        y="annualized_return",
        title=f"Bottom 10 Annualized Return Saham {index_name}",
        text="annualized_return"
    )

    fig.update_traces(
        texttemplate="%{text:.2%}",
        textposition="outside"
    )

    fig.update_layout(
        xaxis_title="Ticker",
        yaxis_title="Annualized Return",
        template="plotly_white"
    )

    return fig


def plot_top_risk(top_risk, index_name):
    fig = px.bar(
        top_risk,
        x="Ticker",
        y="annualized_volatility",
        title=f"Top 10 Annualized Volatility Saham {index_name}",
        text="annualized_volatility"
    )

    fig.update_traces(
        texttemplate="%{text:.2%}",
        textposition="outside"
    )

    fig.update_layout(
        xaxis_title="Ticker",
        yaxis_title="Annualized Volatility",
        template="plotly_white"
    )

    return fig


def plot_bottom_risk(bottom_risk, index_name):
    fig = px.bar(
        bottom_risk,
        x="Ticker",
        y="annualized_volatility",
        title=f"Bottom 10 Annualized Volatility Saham {index_name}",
        text="annualized_volatility"
    )

    fig.update_traces(
        texttemplate="%{text:.2%}",
        textposition="outside"
    )

    fig.update_layout(
        xaxis_title="Ticker",
        yaxis_title="Annualized Volatility",
        template="plotly_white"
    )

    return fig


def plot_top_sharpe(top_sharpe, index_name):
    fig = px.bar(
        top_sharpe,
        x="Ticker",
        y="sharpe_ratio",
        title=f"Top 10 Sharpe Ratio Saham {index_name}",
        text="sharpe_ratio"
    )

    fig.update_traces(
        texttemplate="%{text:.2f}",
        textposition="outside"
    )

    fig.update_layout(
        xaxis_title="Ticker",
        yaxis_title="Sharpe Ratio",
        template="plotly_white"
    )

    return fig


def plot_correlation_heatmap(correlation_matrix, index_name):
    fig = px.imshow(
        correlation_matrix,
        text_auto=False,
        aspect="auto",
        title=f"Correlation Heatmap Saham {index_name}"
    )

    fig.update_layout(
        template="plotly_white",
        xaxis_title="Ticker",
        yaxis_title="Ticker",
        height=700
    )

    return fig


def plot_risk_return_scatter(eda_stock_summary, index_name):
    fig = px.scatter(
        eda_stock_summary,
        x="annualized_volatility",
        y="annualized_return",
        text="Ticker",
        hover_data=[
            "Ticker",
            "annualized_return",
            "annualized_volatility",
            "sharpe_ratio"
        ],
        title=f"Risk vs Return Saham {index_name}"
    )

    fig.update_traces(textposition="top center")

    fig.update_layout(
        xaxis_title="Annualized Volatility",
        yaxis_title="Annualized Return",
        template="plotly_white",
        height=650
    )

    return fig


def plot_cumulative_return(cumulative_return, selected_tickers, index_name):
    fig = go.Figure()

    for ticker in selected_tickers:
        if ticker in cumulative_return.columns:
            fig.add_trace(
                go.Scatter(
                    x=cumulative_return.index,
                    y=cumulative_return[ticker],
                    mode="lines",
                    name=ticker
                )
            )

    fig.update_layout(
        title=f"Cumulative Return Saham {index_name}",
        xaxis_title="Date",
        yaxis_title="Cumulative Return",
        template="plotly_white",
        height=500
    )

    return fig


def plot_rolling_volatility(rolling_volatility, selected_tickers, index_name):
    fig = go.Figure()

    for ticker in selected_tickers:
        if ticker in rolling_volatility.columns:
            fig.add_trace(
                go.Scatter(
                    x=rolling_volatility.index,
                    y=rolling_volatility[ticker],
                    mode="lines",
                    name=ticker
                )
            )

    fig.update_layout(
        title=f"30-Day Rolling Volatility Saham {index_name}",
        xaxis_title="Date",
        yaxis_title="Annualized Volatility",
        template="plotly_white",
        height=500
    )

    return fig


# =========================================================
# PORTFOLIO VISUALIZATION
# =========================================================

def _prepare_positive_weights(weights_df):
    plot_df = weights_df.copy()

    if "Weight" not in plot_df.columns:
        return plot_df.iloc[0:0]

    plot_df = plot_df.replace([np.inf, -np.inf], np.nan)
    plot_df = plot_df.dropna(subset=["Weight"])
    plot_df = plot_df[plot_df["Weight"] > 0].copy()

    if plot_df.empty:
        return plot_df

    total_weight = plot_df["Weight"].sum()

    if total_weight <= 0:
        return plot_df.iloc[0:0]

    plot_df["Weight"] = plot_df["Weight"] / total_weight

    return plot_df


def plot_portfolio_allocation(weights_df, method_name):
    plot_df = _prepare_positive_weights(weights_df)

    if plot_df.empty:
        return None

    fig = px.pie(
        plot_df,
        names="Ticker",
        values="Weight",
        title=f"Portfolio Allocation - {method_name}",
        hole=0.35
    )

    fig.update_traces(
        textposition="inside",
        textinfo="percent+label"
    )

    fig.update_layout(
        template="plotly_white",
        height=500
    )

    return fig


def plot_portfolio_allocation_bar(weights_df, method_name):
    plot_df = _prepare_positive_weights(weights_df)

    if plot_df.empty:
        return None

    plot_df = plot_df.sort_values(by="Weight", ascending=False)

    fig = px.bar(
        plot_df,
        x="Ticker",
        y="Weight",
        title=f"Portfolio Weight Allocation - {method_name}",
        text="Weight"
    )

    fig.update_traces(
        texttemplate="%{text:.2%}",
        textposition="outside"
    )

    fig.update_layout(
        xaxis_title="Ticker",
        yaxis_title="Weight",
        template="plotly_white"
    )

    return fig


def plot_portfolio_cumulative_return(portfolio_daily_return, investment_amount, method_name):
    """
    portfolio_daily_return berasal dari log return.
    Maka cumulative return yang benar adalah exp(cumsum(log_return)).
    """

    portfolio_cumulative_return = np.exp(portfolio_daily_return.cumsum())
    portfolio_value = portfolio_cumulative_return * investment_amount

    fig = go.Figure()

    fig.add_trace(
        go.Scatter(
            x=portfolio_value.index,
            y=portfolio_value.values,
            mode="lines",
            name="Portfolio Value"
        )
    )

    fig.update_layout(
        title=f"Cumulative Portfolio Value - {method_name}",
        xaxis_title="Date",
        yaxis_title="Portfolio Value",
        template="plotly_white",
        height=500
    )

    return fig


def plot_model_comparison(comparison_df):
    fig = go.Figure()

    fig.add_trace(
        go.Bar(
            x=comparison_df["Model"],
            y=comparison_df["Annual Return"],
            name="Annual Return",
            text=comparison_df["Annual Return"]
        )
    )

    fig.add_trace(
        go.Bar(
            x=comparison_df["Model"],
            y=comparison_df["Annual Risk"],
            name="Annual Risk",
            text=comparison_df["Annual Risk"]
        )
    )

    fig.add_trace(
        go.Bar(
            x=comparison_df["Model"],
            y=comparison_df["Sharpe Ratio"],
            name="Sharpe Ratio",
            text=comparison_df["Sharpe Ratio"]
        )
    )

    fig.update_traces(
        texttemplate="%{text:.2f}",
        textposition="outside"
    )

    fig.update_layout(
        title="Perbandingan Performa Model Portfolio",
        xaxis_title="Model",
        yaxis_title="Value",
        barmode="group",
        template="plotly_white",
        height=500
    )

    return fig


def plot_model_return_risk_scatter(comparison_df):
    plot_df = comparison_df.copy()

    plot_df["Sharpe Size"] = plot_df["Sharpe Ratio"].abs()

    if plot_df["Sharpe Size"].sum() == 0:
        plot_df["Sharpe Size"] = 1

    fig = px.scatter(
        plot_df,
        x="Annual Risk",
        y="Annual Return",
        text="Model",
        size="Sharpe Size",
        hover_data=[
            "Model",
            "Annual Return",
            "Annual Risk",
            "Sharpe Ratio",
            "Number of Stocks"
        ],
        title="Risk vs Return Comparison antar Model"
    )

    fig.update_traces(textposition="top center")

    fig.update_layout(
        xaxis_title="Annual Risk",
        yaxis_title="Annual Return",
        template="plotly_white",
        height=550
    )

    return fig


def plot_selected_portfolio_risk_return(weights_df, method_name):
    required_columns = [
        "Weight",
        "annualized_volatility",
        "annualized_return"
    ]

    for col in required_columns:
        if col not in weights_df.columns:
            return None

    plot_df = _prepare_positive_weights(weights_df)

    if plot_df.empty:
        return None

    fig = px.scatter(
        plot_df,
        x="annualized_volatility",
        y="annualized_return",
        size="Weight",
        text="Ticker",
        hover_data=[
            "Ticker",
            "Weight",
            "Allocation",
            "annualized_return",
            "annualized_volatility",
            "sharpe_ratio"
        ],
        title=f"Risk vs Return Saham dalam Portfolio - {method_name}"
    )

    fig.update_traces(textposition="top center")

    fig.update_layout(
        xaxis_title="Annualized Volatility",
        yaxis_title="Annualized Return",
        template="plotly_white",
        height=600
    )

    return fig


# =========================================================
# TABLE FORMATTER
# =========================================================

def format_weights_table(weights_df):
    formatted_df = weights_df.copy()

    if "Weight" in formatted_df.columns:
        formatted_df["Weight (%)"] = formatted_df["Weight"] * 100

    if "Allocation" in formatted_df.columns:
        formatted_df["Allocation (Rp)"] = formatted_df["Allocation"]

    display_columns = [
        col for col in [
            "Ticker",
            "Weight (%)",
            "Allocation (Rp)",
            "annualized_return",
            "annualized_volatility",
            "beta",
            "sharpe_ratio"
        ]
        if col in formatted_df.columns
    ]

    return formatted_df[display_columns]


def format_comparison_table(comparison_df):
    formatted_df = comparison_df.copy()

    percent_columns = [
        "Annual Return",
        "Annual Risk"
    ]

    for col in percent_columns:
        if col in formatted_df.columns:
            formatted_df[col] = formatted_df[col] * 100

    return formatted_df