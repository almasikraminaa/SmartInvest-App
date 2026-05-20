import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go


# =========================================================
# SMARTINVEST CHART THEME
# =========================================================

SMARTINVEST_COLORS = {
    "navy": "#0F172A",
    "navy_soft": "#1E293B",
    "blue_dark": "#1E3A8A",
    "blue": "#2563EB",
    "blue_soft": "#60A5FA",
    "sky": "#0EA5E9",
    "emerald": "#10B981",
    "emerald_soft": "#34D399",
    "red": "#EF4444",
    "red_soft": "#F87171",
    "amber": "#F59E0B",
    "slate": "#475569",
    "slate_soft": "#64748B",
    "grid": "rgba(148, 163, 184, 0.22)",
    "white": "#FFFFFF"
}

SMARTINVEST_PALETTE = [
    "#2563eb",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ef4444",
    "#06b6d4",
    "#84cc16",
    "#f97316",
    "#6366f1",
    "#14b8a6"
]

BLUE_PALETTE = [
    "#1E3A8A",
    "#2563EB",
    "#3B82F6",
    "#60A5FA",
    "#93C5FD",
    "#BFDBFE",
    "#0EA5E9",
    "#38BDF8",
    "#7DD3FC",
    "#BAE6FD",
    "#334155",
    "#475569"
]


def apply_smartinvest_theme(fig, height=420, show_legend=True):
    fig.update_layout(
        template="plotly_white",
        height=height,
        paper_bgcolor="#FFFFFF",
        plot_bgcolor="#FFFFFF",
        font=dict(
            family="Inter, Segoe UI, sans-serif",
            size=12,
            color=SMARTINVEST_COLORS["navy_soft"]
        ),
        title=dict(
            font=dict(
                size=16,
                color=SMARTINVEST_COLORS["navy"],
                family="Inter, Segoe UI, sans-serif"
            ),
            x=0.02,
            xanchor="left",
            y=0.96,
            yanchor="top"
        ),
        margin=dict(l=45, r=30, t=85, b=55),
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="center",
            x=0.5,
            font=dict(size=11),
            bgcolor="rgba(255,255,255,0)"
        ),
        showlegend=show_legend
    )

    fig.update_xaxes(
        showgrid=True,
        gridcolor=SMARTINVEST_COLORS["grid"],
        zeroline=False,
        linecolor="#CBD5E1",
        tickfont=dict(color=SMARTINVEST_COLORS["slate_soft"], size=10),
        title_font=dict(color=SMARTINVEST_COLORS["slate_soft"], size=12)
    )

    fig.update_yaxes(
        showgrid=True,
        gridcolor=SMARTINVEST_COLORS["grid"],
        zeroline=False,
        linecolor="#CBD5E1",
        tickfont=dict(color=SMARTINVEST_COLORS["slate_soft"], size=10),
        title_font=dict(color=SMARTINVEST_COLORS["slate_soft"], size=12)
    )

    return fig


# =========================================================
# EDA VISUALIZATION
# =========================================================

def plot_return_distribution(eda_log_return, index_name):
    data = eda_log_return.stack().reset_index()
    data.columns = ["Date", "Ticker", "Log Return"]

    fig = px.histogram(
        data,
        x="Log Return",
        nbins=80,
        title=f"Distribusi Daily Log Return Saham {index_name}",
        color_discrete_sequence=[SMARTINVEST_COLORS["blue"]]
    )

    fig.update_traces(
        opacity=0.9,
        marker_line_color="white",
        marker_line_width=0.4
    )

    fig.update_layout(
        xaxis_title="Daily Log Return",
        yaxis_title="Frekuensi"
    )

    return apply_smartinvest_theme(fig, height=390, show_legend=False)


def plot_volatility_distribution(eda_stock_summary, index_name):
    fig = px.histogram(
        eda_stock_summary,
        x="annualized_volatility",
        nbins=25,
        title=f"Distribusi Annualized Volatility Saham {index_name}",
        color_discrete_sequence=[SMARTINVEST_COLORS["sky"]]
    )

    fig.update_traces(
        opacity=0.9,
        marker_line_color="white",
        marker_line_width=0.4
    )

    fig.update_layout(
        xaxis_title="Annualized Volatility",
        yaxis_title="Jumlah Saham"
    )

    return apply_smartinvest_theme(fig, height=390, show_legend=False)


def plot_top_return(top_return, index_name):
    fig = px.bar(
        top_return,
        x="Ticker",
        y="annualized_return",
        title=f"Top 10 Annualized Return Saham {index_name}",
        text="annualized_return",
        color_discrete_sequence=[SMARTINVEST_COLORS["blue"]]
    )

    fig.update_traces(
        texttemplate="%{text:.2%}",
        textposition="outside",
        marker_line_color="white",
        marker_line_width=0.6
    )

    fig.update_layout(
        xaxis_title="Ticker",
        yaxis_title="Annualized Return"
    )

    return apply_smartinvest_theme(fig, height=390, show_legend=False)


def plot_bottom_return(bottom_return, index_name):
    fig = px.bar(
        bottom_return,
        x="Ticker",
        y="annualized_return",
        title=f"Bottom 10 Annualized Return Saham {index_name}",
        text="annualized_return",
        color_discrete_sequence=[SMARTINVEST_COLORS["red_soft"]]
    )

    fig.update_traces(
        texttemplate="%{text:.2%}",
        textposition="outside",
        marker_line_color="white",
        marker_line_width=0.6
    )

    fig.update_layout(
        xaxis_title="Ticker",
        yaxis_title="Annualized Return"
    )

    return apply_smartinvest_theme(fig, height=390, show_legend=False)


def plot_top_risk(top_risk, index_name):
    fig = px.bar(
        top_risk,
        x="Ticker",
        y="annualized_volatility",
        title=f"Top 10 Annualized Volatility Saham {index_name}",
        text="annualized_volatility",
        color_discrete_sequence=[SMARTINVEST_COLORS["sky"]]
    )

    fig.update_traces(
        texttemplate="%{text:.2%}",
        textposition="outside",
        marker_line_color="white",
        marker_line_width=0.6
    )

    fig.update_layout(
        xaxis_title="Ticker",
        yaxis_title="Annualized Volatility"
    )

    return apply_smartinvest_theme(fig, height=390, show_legend=False)


def plot_bottom_risk(bottom_risk, index_name):
    fig = px.bar(
        bottom_risk,
        x="Ticker",
        y="annualized_volatility",
        title=f"Bottom 10 Annualized Volatility Saham {index_name}",
        text="annualized_volatility",
        color_discrete_sequence=[SMARTINVEST_COLORS["blue_soft"]]
    )

    fig.update_traces(
        texttemplate="%{text:.2%}",
        textposition="outside",
        marker_line_color="white",
        marker_line_width=0.6
    )

    fig.update_layout(
        xaxis_title="Ticker",
        yaxis_title="Annualized Volatility"
    )

    return apply_smartinvest_theme(fig, height=390, show_legend=False)


def plot_top_sharpe(top_sharpe, index_name):
    fig = px.bar(
        top_sharpe,
        x="Ticker",
        y="sharpe_ratio",
        title=f"Top 10 Sharpe Ratio Saham {index_name}",
        text="sharpe_ratio",
        color_discrete_sequence=[SMARTINVEST_COLORS["slate"]]
    )

    fig.update_traces(
        texttemplate="%{text:.2f}",
        textposition="outside",
        marker_line_color="white",
        marker_line_width=0.6
    )

    fig.update_layout(
        xaxis_title="Ticker",
        yaxis_title="Sharpe Ratio"
    )

    return apply_smartinvest_theme(fig, height=390, show_legend=False)


def plot_correlation_heatmap(correlation_matrix, index_name):
    fig = px.imshow(
        correlation_matrix,
        text_auto=False,
        aspect="auto",
        title=f"Correlation Heatmap Saham {index_name}",
        color_continuous_scale="RdBu_r",
        zmin=-1,
        zmax=1
    )

    fig.update_layout(
        xaxis_title="Ticker",
        yaxis_title="Ticker",
        coloraxis_colorbar=dict(title="Correlation")
    )

    return apply_smartinvest_theme(fig, height=560, show_legend=False)


def plot_risk_return_scatter(eda_stock_summary, index_name):
    fig = px.scatter(
        eda_stock_summary,
        x="annualized_volatility",
        y="annualized_return",
        text="Ticker",
        color="sharpe_ratio",
        color_continuous_scale="Viridis",
        hover_data=[
            "Ticker",
            "annualized_return",
            "annualized_volatility",
            "sharpe_ratio"
        ],
        title=f"Risk vs Return Saham {index_name}"
    )

    fig.update_traces(
        textposition="top center",
        marker=dict(
            size=9,
            line=dict(width=1, color="white")
        )
    )

    fig.update_layout(
        xaxis_title="Annualized Volatility",
        yaxis_title="Annualized Return",
        coloraxis_colorbar=dict(title="Sharpe")
    )

    return apply_smartinvest_theme(fig, height=470, show_legend=False)


def plot_cumulative_return(cumulative_return, selected_tickers, index_name):
    fig = go.Figure()

    for i, ticker in enumerate(selected_tickers):
        if ticker in cumulative_return.columns:
            fig.add_trace(
                go.Scatter(
                    x=cumulative_return.index,
                    y=cumulative_return[ticker],
                    mode="lines",
                    name=ticker,
                    line=dict(
                        width=2.3,
                        color=SMARTINVEST_PALETTE[i % len(SMARTINVEST_PALETTE)]
                    )
                )
            )

    fig.update_layout(
        title=f"Cumulative Return Top 5 Saham {index_name}",
        xaxis_title="Date",
        yaxis_title="Cumulative Return"
    )

    return apply_smartinvest_theme(fig, height=420, show_legend=True)


def plot_rolling_volatility(rolling_volatility, selected_tickers, index_name):
    fig = go.Figure()

    for i, ticker in enumerate(selected_tickers):
        if ticker in rolling_volatility.columns:
            fig.add_trace(
                go.Scatter(
                    x=rolling_volatility.index,
                    y=rolling_volatility[ticker],
                    mode="lines",
                    name=ticker,
                    line=dict(
                        width=2.3,
                        color=SMARTINVEST_PALETTE[i % len(SMARTINVEST_PALETTE)]
                    )
                )
            )

    fig.update_layout(
        title=f"30-Day Rolling Volatility Top 5 Saham {index_name}",
        xaxis_title="Date",
        yaxis_title="Annualized Volatility"
    )

    return apply_smartinvest_theme(fig, height=420, show_legend=True)


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
        title=f"Komposisi Portfolio {method_name}",
        hole=0.52,
        color_discrete_sequence=BLUE_PALETTE
    )

    fig.update_traces(
        textposition="inside",
        textinfo="percent+label",
        marker=dict(line=dict(color="white", width=2))
    )

    fig.update_layout(
        legend_title_text="Ticker",
        margin=dict(l=25, r=25, t=95, b=25)
    )

    return apply_smartinvest_theme(fig, height=430, show_legend=True)


def plot_portfolio_allocation_bar(weights_df, method_name):
    plot_df = weights_df.copy()

    if "Weight" not in plot_df.columns:
        return None

    plot_df = plot_df.replace([np.inf, -np.inf], np.nan)
    plot_df = plot_df.dropna(subset=["Weight"])
    plot_df = plot_df.sort_values(by="Weight", ascending=False)

    if plot_df.empty:
        return None

    fig = px.bar(
        plot_df,
        x="Ticker",
        y="Weight",
        title=f"Bobot Portfolio {method_name}",
        text="Weight",
        color_discrete_sequence=[SMARTINVEST_COLORS["blue"]]
    )

    fig.update_traces(
        texttemplate="%{text:.2%}",
        textposition="outside",
        marker_line_color="white",
        marker_line_width=0.6
    )

    fig.add_hline(
        y=0,
        line_width=1,
        line_color=SMARTINVEST_COLORS["slate_soft"]
    )

    fig.update_layout(
        xaxis_title="Ticker",
        yaxis_title="Weight"
    )

    return apply_smartinvest_theme(fig, height=430, show_legend=False)


def plot_portfolio_cumulative_return(
    portfolio_daily_return,
    investment_amount,
    method_name
):
    portfolio_cumulative_return = np.exp(
        portfolio_daily_return.cumsum()
    )

    portfolio_value = portfolio_cumulative_return * investment_amount

    fig = go.Figure()

    fig.add_trace(
        go.Scatter(
            x=portfolio_value.index,
            y=portfolio_value.values,
            mode="lines",
            name="Portfolio Value",
            line=dict(
                width=2.7,
                color=SMARTINVEST_COLORS["blue"]
            ),
            fill="tozeroy",
            fillcolor="rgba(37, 99, 235, 0.10)"
        )
    )

    fig.update_layout(
        title=f"Cumulative Portfolio Value - {method_name}",
        xaxis_title="Date",
        yaxis_title="Portfolio Value"
    )

    return apply_smartinvest_theme(fig, height=430, show_legend=False)


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
        color="Weight",
        color_continuous_scale=[
            "#E2E8F0",
            "#BFDBFE",
            "#60A5FA",
            "#2563EB",
            "#1E3A8A"
        ],
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

    fig.update_traces(
        textposition="top center",
        marker=dict(
            line=dict(width=1.1, color="white"),
            sizemin=7
        )
    )

    fig.update_layout(
        xaxis_title="Annualized Volatility",
        yaxis_title="Annualized Return",
        coloraxis_colorbar=dict(title="Weight")
    )

    return apply_smartinvest_theme(fig, height=470, show_legend=False)


# =========================================================
# MODEL COMPARISON VISUALIZATION
# =========================================================

def plot_model_comparison(comparison_df):
    fig = go.Figure()

    fig.add_trace(
        go.Bar(
            x=comparison_df["Model"],
            y=comparison_df["Annualized_Return"],
            name="Return",
            text=comparison_df["Annualized_Return"],
            marker_color=SMARTINVEST_COLORS["blue"]
        )
    )

    fig.add_trace(
        go.Bar(
            x=comparison_df["Model"],
            y=comparison_df["Annualized_Volatility"],
            name="Volatility",
            text=comparison_df["Annualized_Volatility"],
            marker_color=SMARTINVEST_COLORS["blue_soft"]
        )
    )

    fig.add_trace(
        go.Bar(
            x=comparison_df["Model"],
            y=comparison_df["Sharpe_Ratio"],
            name="Sharpe",
            text=comparison_df["Sharpe_Ratio"],
            marker_color=SMARTINVEST_COLORS["slate"]
        )
    )

    fig.update_traces(
        texttemplate="%{text:.2f}",
        textposition="outside",
        marker_line_color="white",
        marker_line_width=0.6
    )

    fig.update_layout(
        title="Perbandingan Performa Model Portfolio",
        xaxis_title="Model Portfolio",
        yaxis_title="Value",
        barmode="group"
    )

    return apply_smartinvest_theme(fig, height=430, show_legend=True)


def plot_model_return_risk_scatter(comparison_df):
    plot_df = comparison_df.copy()

    plot_df["Sharpe_Size"] = plot_df["Sharpe_Ratio"].abs()

    if plot_df["Sharpe_Size"].sum() == 0:
        plot_df["Sharpe_Size"] = 1

    fig = px.scatter(
        plot_df,
        x="Annualized_Volatility",
        y="Annualized_Return",
        text="Model",
        size="Sharpe_Size",
        color="Model",
        color_discrete_sequence=[
            SMARTINVEST_COLORS["blue_dark"],
            SMARTINVEST_COLORS["blue"],
            SMARTINVEST_COLORS["sky"]
        ],
        hover_data=[
            "Model",
            "Annualized_Return",
            "Annualized_Volatility",
            "Sharpe_Ratio",
            "Portfolio_Beta",
            "Portfolio_Alpha",
            "Selected_Stock_Count"
        ],
        title="Risk vs Return Portfolio Comparison"
    )

    fig.update_traces(
        textposition="top center",
        marker=dict(
            line=dict(width=1.2, color="white")
        )
    )

    fig.update_layout(
        xaxis_title="Annualized Volatility",
        yaxis_title="Annualized Return"
    )

    return apply_smartinvest_theme(fig, height=450, show_legend=True)


def plot_portfolio_beta_comparison(comparison_df):
    if "Portfolio_Beta" not in comparison_df.columns:
        return None

    beta_df = comparison_df.dropna(
        subset=["Portfolio_Beta"]
    ).copy()

    if beta_df.empty:
        return None

    fig = px.bar(
        beta_df,
        x="Model",
        y="Portfolio_Beta",
        title="Perbandingan Portfolio Beta",
        text="Portfolio_Beta",
        color_discrete_sequence=[SMARTINVEST_COLORS["blue"]]
    )

    fig.update_traces(
        texttemplate="%{text:.4f}",
        textposition="outside",
        marker_line_color="white",
        marker_line_width=0.6
    )

    fig.update_layout(
        xaxis_title="Model Portfolio",
        yaxis_title="Portfolio Beta"
    )

    return apply_smartinvest_theme(fig, height=390, show_legend=False)


def plot_portfolio_alpha_comparison(comparison_df):
    if "Portfolio_Alpha" not in comparison_df.columns:
        return None

    alpha_df = comparison_df.dropna(
        subset=["Portfolio_Alpha"]
    ).copy()

    if alpha_df.empty:
        return None

    fig = px.bar(
        alpha_df,
        x="Model",
        y="Portfolio_Alpha",
        title="Perbandingan Portfolio Alpha",
        text="Portfolio_Alpha",
        color_discrete_sequence=[SMARTINVEST_COLORS["sky"]]
    )

    fig.update_traces(
        texttemplate="%{text:.2%}",
        textposition="outside",
        marker_line_color="white",
        marker_line_width=0.6
    )

    fig.update_layout(
        xaxis_title="Model Portfolio",
        yaxis_title="Portfolio Alpha"
    )

    return apply_smartinvest_theme(fig, height=390, show_legend=False)


def plot_portfolio_weight_comparison(portfolio_weight_comparison, model_name):
    column_map = {
        "MVEP": "MVEP_Weight",
        "SIM": "SIM_Weight",
        "CAPM": "CAPM_Weight"
    }

    weight_col = column_map.get(model_name)

    if weight_col is None:
        return None

    if weight_col not in portfolio_weight_comparison.columns:
        return None

    plot_df = portfolio_weight_comparison[
        portfolio_weight_comparison[weight_col] != 0
    ].copy()

    if plot_df.empty:
        return None

    plot_df = plot_df.sort_values(
        by=weight_col,
        ascending=False
    )

    fig = px.bar(
        plot_df,
        x="Ticker",
        y=weight_col,
        title=f"Bobot Portfolio {model_name}",
        text=weight_col,
        color_discrete_sequence=[SMARTINVEST_COLORS["blue"]]
    )

    fig.update_traces(
        texttemplate="%{text:.2%}",
        textposition="outside",
        marker_line_color="white",
        marker_line_width=0.6
    )

    fig.add_hline(
        y=0,
        line_width=1,
        line_color=SMARTINVEST_COLORS["slate_soft"]
    )

    fig.update_layout(
        xaxis_title="Ticker",
        yaxis_title="Weight"
    )

    return apply_smartinvest_theme(fig, height=430, show_legend=False)


# =========================================================
# TABLE FORMATTER OPTIONAL
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
            "Beta",
            "sharpe_ratio",
            "expected_return",
            "Expected_Return_CAPM",
            "Excess_Return"
        ]
        if col in formatted_df.columns
    ]

    return formatted_df[display_columns]


def format_comparison_table(comparison_df):
    formatted_df = comparison_df.copy()

    percent_columns = [
        "Annualized_Return",
        "Annualized_Volatility",
        "Portfolio_Alpha"
    ]

    for col in percent_columns:
        if col in formatted_df.columns:
            formatted_df[col] = formatted_df[col] * 100

    return formatted_df