import streamlit as st
from pathlib import Path
from datetime import date

from utils.data_loader import (
    load_price_matrix,
    load_market_price,
    load_bi_rate,
    load_raw_stock_data
)

from utils.dynamic_filtering import dynamic_filtering
from utils.feature_engineering import feature_engineering
from utils.portfolio_models import compare_all_models
from utils.eda import run_eda

from utils.visualization import (
    plot_return_distribution,
    plot_volatility_distribution,
    plot_top_return,
    plot_bottom_return,
    plot_top_risk,
    plot_bottom_risk,
    plot_top_sharpe,
    plot_correlation_heatmap,
    plot_risk_return_scatter,
    plot_cumulative_return,
    plot_rolling_volatility,
    plot_portfolio_allocation,
    plot_portfolio_allocation_bar,
    plot_portfolio_cumulative_return,
    plot_model_comparison,
    plot_model_return_risk_scatter,
    plot_selected_portfolio_risk_return,
    plot_portfolio_beta_comparison,
    plot_portfolio_alpha_comparison,
    plot_portfolio_weight_comparison
)

from utils.helper import (
    format_rupiah,
    format_percent,
    format_decimal,
    format_portfolio_table,
    format_comparison_table,
    format_stock_summary_table,
    select_portfolio_display_columns,
    generate_simple_advisor,
    get_best_model_by_sharpe,
    get_lowest_risk_model,
    get_highest_return_model
)


# =========================================================
# LOAD CSS
# =========================================================

def load_css(file_path):
    if file_path.exists():
        with open(file_path) as f:
            st.markdown(
                f"<style>{f.read()}</style>",
                unsafe_allow_html=True
            )


# =========================================================
# PAGE CONFIG
# =========================================================

st.set_page_config(
    page_title="SmartInvest",
    layout="wide"
)

load_css(Path("assets/style.css"))


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

@st.cache_data
def load_all_data():
    price_matrix = load_price_matrix()
    market_price = load_market_price()
    bi_rate_daily = load_bi_rate()
    raw_price_matrix = load_raw_stock_data()

    return price_matrix, market_price, bi_rate_daily, raw_price_matrix


@st.cache_data
def cached_run_eda(index_choice, price_matrix, index_map):
    return run_eda(
        index_choice=index_choice,
        price_matrix=price_matrix,
        index_map=index_map,
        trading_days=252,
        risk_free_rate=0.05,
        top_n=10
    )


price_matrix, market_price, bi_rate_daily, raw_price_matrix = load_all_data()


# =========================================================
# SIDEBAR
# =========================================================

st.sidebar.title("📈 SmartInvest")
st.sidebar.markdown("Portfolio Recommendation System")

st.sidebar.divider()
st.sidebar.subheader("Calculation Settings")

model_choice = st.sidebar.selectbox(
    "Method",
    ["MVEP", "SIM", "CAPM"]
)

index_choice = st.sidebar.selectbox(
    "Target Index",
    ["LQ45", "IDX30"]
)

min_date = price_matrix.index.min().date()
max_date = price_matrix.index.max().date()

st.sidebar.caption(
    f"Available modeling data: {min_date} until {max_date}"
)

default_start_date = date(2023, 6, 21)

if default_start_date < min_date or default_start_date > max_date:
    default_start_date = min_date

start_date = st.sidebar.date_input(
    "Start Date",
    value=default_start_date,
    min_value=min_date,
    max_value=max_date
)

end_date = st.sidebar.date_input(
    "End Date",
    value=max_date,
    min_value=min_date,
    max_value=max_date
)

investment_amount = st.sidebar.number_input(
    "Capital Allocation",
    min_value=100000,
    value=10000000,
    step=100000
)

run_button = st.sidebar.button(
    "Run Analysis",
    use_container_width=True
)

st.sidebar.divider()
st.sidebar.caption(
    "Hasil analisis bersifat decision support dan bukan saran finansial mutlak."
)


# =========================================================
# SESSION STATE
# =========================================================

if "analysis_result" not in st.session_state:
    st.session_state.analysis_result = None


# =========================================================
# RUN ANALYSIS
# =========================================================

if run_button:
    try:
        filtered_result = dynamic_filtering(
            index_choice=index_choice,
            start_date=start_date,
            end_date=end_date,
            price_matrix=price_matrix,
            market_price=market_price,
            bi_rate_daily=bi_rate_daily,
            index_map=index_map,
            min_months=6
        )

        feature_result = feature_engineering(
            filtered_price=filtered_result["filtered_price"],
            filtered_market=filtered_result["filtered_market"],
            filtered_bi_rate=filtered_result["filtered_bi_rate"],
            trading_days=252
        )

        all_model_result = compare_all_models(
            feature_result=feature_result,
            investment_amount=investment_amount,
            trading_days=252
        )

        selected_result = all_model_result[model_choice]

        st.session_state.analysis_result = {
            "user_input": {
                "model_choice": model_choice,
                "index_choice": index_choice,
                "start_date": start_date,
                "end_date": end_date,
                "investment_amount": investment_amount
            },
            "filtered_result": filtered_result,
            "feature_result": feature_result,
            "all_model_result": all_model_result,
            "selected_result": selected_result
        }

        st.success(
            "Analisis berhasil dijalankan. Tab EDA dan Portfolio Analysis sudah diperbarui."
        )

    except Exception as e:
        st.error(f"Terjadi error saat menjalankan analisis: {e}")


# =========================================================
# HEADER
# =========================================================

st.title("📈 SmartInvest Dashboard")

st.markdown(
    """
    SmartInvest adalah dashboard analisis saham dan rekomendasi portofolio berbasis
    **MVEP**, **SIM**, dan **CAPM** untuk membantu investor pemula memahami risiko,
    return, dan alokasi investasi secara lebih terarah.
    """
)


# =========================================================
# TABS
# =========================================================

tab_eda, tab_portfolio = st.tabs(
    ["📊 Stock EDA", "💼 Portfolio Analysis"]
)


# =========================================================
# TAB 1: STOCK EDA
# =========================================================

with tab_eda:

    st.header("📊 Stock Exploratory Data Analysis")

    st.caption(
        """
        Visualisasi EDA menampilkan gambaran umum pergerakan dan karakteristik saham
        berdasarkan data historis pasar.
        """
    )

    # =====================================================
    # DEFAULT EDA MODE: RAW DATA
    # AFTER RUN ANALYSIS: FILTERED PRICE MATRIX
    # =====================================================

    if st.session_state.analysis_result is None:

        eda_index_choice = st.radio(
            "Pilih indeks untuk EDA",
            ["LQ45", "IDX30"],
            horizontal=True
        )

        eda_price_matrix = raw_price_matrix

        eda_index_map = {
            "LQ45": [
                ticker for ticker in raw_price_matrix.columns
            ],
            "IDX30": [
                ticker for ticker in index_map["IDX30"]
                if ticker in raw_price_matrix.columns
            ]
        }

        st.info(
            f"""
            EDA awal menampilkan gambaran umum data historis 5 tahun.  
            Jumlah saham tersedia untuk visualisasi: **{len(eda_index_map[eda_index_choice])} saham**.
            """
        )

    else:
        result = st.session_state.analysis_result
        user_input = result["user_input"]
        filtered_result = result["filtered_result"]

        eda_index_choice = user_input["index_choice"]
        eda_price_matrix = filtered_result["filtered_price"]

        eda_index_map = {
            eda_index_choice: eda_price_matrix.columns.tolist()
        }

        st.info(
            f"""
            EDA saat ini mengikuti input user untuk indeks **{eda_index_choice}**
            pada periode **{user_input['start_date']}** sampai **{user_input['end_date']}**.  
            Jumlah saham valid setelah dynamic filtering: **{eda_price_matrix.shape[1]} saham**.
            """
        )

    st.markdown(
        """
        EDA digunakan untuk memahami karakteristik saham berdasarkan return, risiko,
        volatilitas, Sharpe Ratio, korelasi, dan hubungan risk-return.
        """
    )

    with st.spinner(f"Menjalankan EDA untuk {eda_index_choice}..."):
        eda_result = cached_run_eda(
            index_choice=eda_index_choice,
            price_matrix=eda_price_matrix,
            index_map=eda_index_map
        )

    kpi = eda_result["kpi_summary"]

    st.subheader(f"KPI Summary - {eda_index_choice}")

    col1, col2, col3, col4 = st.columns(4)

    col1.metric("Total Saham", kpi["total_stocks"])
    col2.metric("Average Return", format_percent(kpi["avg_return"]))
    col3.metric("Average Volatility", format_percent(kpi["avg_volatility"]))
    col4.metric("Average Sharpe", format_decimal(kpi["avg_sharpe"]))

    col5, col6, col7 = st.columns(3)

    col5.metric(
        "Best Return",
        kpi["best_return_ticker"],
        format_percent(kpi["best_return_value"])
    )

    col6.metric(
        "Highest Risk",
        kpi["highest_risk_ticker"],
        format_percent(kpi["highest_risk_value"])
    )

    col7.metric(
        "Best Sharpe",
        kpi["best_sharpe_ticker"],
        format_decimal(kpi["best_sharpe_value"])
    )

    st.divider()

    st.subheader("Distribusi Return dan Volatility")

    col_a, col_b = st.columns(2)

    with col_a:
        st.plotly_chart(
            plot_return_distribution(
                eda_result["eda_log_return"],
                eda_index_choice
            ),
            use_container_width=True
        )

    with col_b:
        st.plotly_chart(
            plot_volatility_distribution(
                eda_result["eda_stock_summary"],
                eda_index_choice
            ),
            use_container_width=True
        )

    st.divider()

    st.subheader("Top dan Bottom Return")

    col_c, col_d = st.columns(2)

    with col_c:
        st.plotly_chart(
            plot_top_return(
                eda_result["top_return"],
                eda_index_choice
            ),
            use_container_width=True
        )

    with col_d:
        st.plotly_chart(
            plot_bottom_return(
                eda_result["bottom_return"],
                eda_index_choice
            ),
            use_container_width=True
        )

    st.divider()

    st.subheader("Top dan Bottom Risk")

    col_e, col_f = st.columns(2)

    with col_e:
        st.plotly_chart(
            plot_top_risk(
                eda_result["top_risk"],
                eda_index_choice
            ),
            use_container_width=True
        )

    with col_f:
        st.plotly_chart(
            plot_bottom_risk(
                eda_result["bottom_risk"],
                eda_index_choice
            ),
            use_container_width=True
        )

    st.divider()

    st.subheader("Sharpe Ratio Ranking")

    st.plotly_chart(
        plot_top_sharpe(
            eda_result["top_sharpe"],
            eda_index_choice
        ),
        use_container_width=True
    )

    st.dataframe(
        format_stock_summary_table(eda_result["top_sharpe"]),
        use_container_width=True
    )

    st.divider()

    st.subheader("Risk vs Return")

    st.plotly_chart(
        plot_risk_return_scatter(
            eda_result["eda_stock_summary"],
            eda_index_choice
        ),
        use_container_width=True
    )

    st.divider()

    st.subheader("Correlation Heatmap")

    st.plotly_chart(
        plot_correlation_heatmap(
            eda_result["correlation_matrix"],
            eda_index_choice
        ),
        use_container_width=True
    )

    st.divider()

    st.subheader("Cumulative Return dan Rolling Volatility")

    selected_tickers = eda_result["top_return"]["Ticker"].head(5).tolist()

    col_g, col_h = st.columns(2)

    with col_g:
        st.plotly_chart(
            plot_cumulative_return(
                eda_result["cumulative_return"],
                selected_tickers,
                eda_index_choice
            ),
            use_container_width=True
        )

    with col_h:
        st.plotly_chart(
            plot_rolling_volatility(
                eda_result["rolling_volatility"],
                selected_tickers,
                eda_index_choice
            ),
            use_container_width=True
        )


# =========================================================
# TAB 2: PORTFOLIO ANALYSIS
# =========================================================

with tab_portfolio:

    st.header("💼 Portfolio Analysis")

    if st.session_state.analysis_result is None:

        st.info(
            "Silakan isi parameter di sidebar lalu klik **Run Analysis** untuk menampilkan hasil portfolio."
        )

    else:
        result = st.session_state.analysis_result

        user_input = result["user_input"]
        filtered_result = result["filtered_result"]
        feature_result = result["feature_result"]
        all_model_result = result["all_model_result"]
        selected_result = result["selected_result"]

        filtering_summary = filtered_result["filtering_summary"]
        feature_summary = feature_result["feature_engineering_summary"]
        comparison_df = all_model_result["comparison_df"]

        weights_df = selected_result["weights"]

        st.subheader("Input Summary")

        col1, col2, col3, col4 = st.columns(4)

        col1.metric("Selected Model", user_input["model_choice"])
        col2.metric("Target Index", user_input["index_choice"])
        col3.metric("Capital", format_rupiah(user_input["investment_amount"]))
        col4.metric("Trading Days", feature_summary["trading_days_used"])

        st.write(
            f"Periode analisis: **{user_input['start_date']}** sampai **{user_input['end_date']}**"
        )

        st.divider()

        st.subheader("Dynamic Filtering Summary")

        col5, col6, col7, col8 = st.columns(4)

        col5.metric("Initial Tickers", filtering_summary["initial_ticker_count"])
        col6.metric("Available Tickers", filtering_summary["available_ticker_count"])
        col7.metric("Valid Tickers", filtering_summary["valid_ticker_count"])
        col8.metric("Removed Tickers", filtering_summary["removed_ticker_count"])

        with st.expander("Lihat Detail Dynamic Filtering"):
            st.json(filtering_summary)

        st.divider()

        st.subheader("Feature Engineering Summary")

        col_fe1, col_fe2, col_fe3, col_fe4 = st.columns(4)

        col_fe1.metric(
            "Initial Stocks",
            feature_summary["initial_ticker_count"]
        )

        col_fe2.metric(
            "Removed Negative Return",
            feature_summary["removed_negative_return_count"]
        )

        col_fe3.metric(
            "Final Stocks",
            feature_summary["final_ticker_count"]
        )

        col_fe4.metric(
            "Risk-Free Rate",
            format_percent(feature_summary["risk_free_rate_annual"])
        )

        with st.expander("Lihat Saham yang Dieliminasi karena Return Negatif"):
            st.write(feature_summary["removed_negative_return_tickers"])

        st.divider()

        st.subheader(f"Portfolio Metrics - {selected_result['method']}")

        col9, col10, col11, col12 = st.columns(4)

        col9.metric(
            "Annualized Return",
            format_percent(selected_result["portfolio_annual_return"])
        )

        col10.metric(
            "Annualized Volatility",
            format_percent(selected_result["portfolio_annual_risk"])
        )

        col11.metric(
            "Sharpe Ratio",
            format_decimal(selected_result["sharpe_ratio"])
        )

        col12.metric(
            "Selected Stocks",
            selected_result.get("selected_stock_count", len(weights_df))
        )

        if selected_result["method"] == "MVEP":
            st.info(
                f"MVEP menggunakan 10 pasangan saham dengan korelasi terendah. "
                f"Jumlah saham terpilih: {selected_result.get('selected_stock_count', len(weights_df))}. "
                f"Bobot negatif tetap ditampilkan karena mengikuti hasil matematis MVEP."
            )

            with st.expander("Lihat Top 10 Pasangan Korelasi Terendah"):
                if "top_low_corr_pairs" in selected_result:
                    st.dataframe(
                        selected_result["top_low_corr_pairs"],
                        use_container_width=True
                    )

        elif selected_result["method"] == "SIM":
            st.info(
                f"SIM menggunakan cut-off point C* = "
                f"{format_decimal(selected_result.get('C_star'))}. "
                f"Saham dipilih berdasarkan kriteria ERB > C*."
            )

            with st.expander("Lihat Tabel Perhitungan SIM"):
                if "sim_calculation_table" in selected_result:
                    st.dataframe(
                        selected_result["sim_calculation_table"],
                        use_container_width=True
                    )

        elif selected_result["method"] == "CAPM":
            st.info(
                "CAPM menggunakan cut-off Top 10 saham berdasarkan bobot terbesar, "
                "lalu bobot dinormalisasi ulang agar total bobot = 1."
            )

            with st.expander("Lihat Bobot CAPM Sebelum Cut-Off"):
                if "all_weights_before_cutoff" in selected_result:
                    st.dataframe(
                        selected_result["all_weights_before_cutoff"],
                        use_container_width=True
                    )

        st.divider()

        st.subheader("Portfolio Allocation")

        col13, col14 = st.columns(2)

        with col13:
            fig_pie = plot_portfolio_allocation(
                weights_df,
                selected_result["method"]
            )

            if fig_pie is not None:
                st.plotly_chart(fig_pie, use_container_width=True)
            else:
                st.warning("Grafik pie tidak tersedia karena tidak ada bobot positif.")

        with col14:
            fig_bar = plot_portfolio_allocation_bar(
                weights_df,
                selected_result["method"]
            )

            if fig_bar is not None:
                st.plotly_chart(fig_bar, use_container_width=True)
            else:
                st.warning("Grafik bar tidak tersedia.")

        st.divider()

        st.subheader("Recommended Stocks Table")

        display_portfolio_df = select_portfolio_display_columns(weights_df)
        display_portfolio_df = format_portfolio_table(display_portfolio_df)

        st.dataframe(
            display_portfolio_df,
            use_container_width=True
        )

        st.divider()

        st.subheader("Cumulative Portfolio Return")

        st.plotly_chart(
            plot_portfolio_cumulative_return(
                selected_result["portfolio_daily_return"],
                user_input["investment_amount"],
                selected_result["method"]
            ),
            use_container_width=True
        )

        st.divider()

        st.subheader("Risk vs Return Saham dalam Portfolio")

        fig_selected_rr = plot_selected_portfolio_risk_return(
            weights_df,
            selected_result["method"]
        )

        if fig_selected_rr is not None:
            st.plotly_chart(fig_selected_rr, use_container_width=True)
        else:
            st.warning("Data risk-return tidak tersedia untuk visualisasi ini.")

        st.divider()

        st.subheader("Perbandingan 3 Model Portfolio")

        best_sharpe_model = get_best_model_by_sharpe(comparison_df)
        lowest_risk_model = get_lowest_risk_model(comparison_df)
        highest_return_model = get_highest_return_model(comparison_df)

        col15, col16, col17 = st.columns(3)

        col15.metric("Best Sharpe Model", best_sharpe_model)
        col16.metric("Lowest Risk Model", lowest_risk_model)
        col17.metric("Highest Return Model", highest_return_model)

        st.dataframe(
            format_comparison_table(comparison_df),
            use_container_width=True
        )

        st.plotly_chart(
            plot_model_comparison(comparison_df),
            use_container_width=True
        )

        st.plotly_chart(
            plot_model_return_risk_scatter(comparison_df),
            use_container_width=True
        )

        fig_beta = plot_portfolio_beta_comparison(comparison_df)

        if fig_beta is not None:
            st.plotly_chart(fig_beta, use_container_width=True)

        fig_alpha = plot_portfolio_alpha_comparison(comparison_df)

        if fig_alpha is not None:
            st.plotly_chart(fig_alpha, use_container_width=True)

        portfolio_weight_comparison = all_model_result.get(
            "portfolio_weight_comparison"
        )

        if portfolio_weight_comparison is not None:

            st.subheader("Perbandingan Bobot Saham Tiap Model")

            weight_model_choice = st.selectbox(
                "Pilih model untuk melihat bobot portfolio",
                ["MVEP", "SIM", "CAPM"]
            )

            fig_weight = plot_portfolio_weight_comparison(
                portfolio_weight_comparison,
                weight_model_choice
            )

            if fig_weight is not None:
                st.plotly_chart(fig_weight, use_container_width=True)

            with st.expander("Lihat Tabel Perbandingan Bobot"):
                st.dataframe(
                    portfolio_weight_comparison,
                    use_container_width=True
                )

        st.divider()

        st.subheader("AI Advisor / Portfolio Insight")

        advisor_text = generate_simple_advisor(
            selected_model=selected_result["method"],
            portfolio_return=selected_result["portfolio_annual_return"],
            portfolio_risk=selected_result["portfolio_annual_risk"],
            sharpe_ratio=selected_result["sharpe_ratio"],
            valid_ticker_count=feature_summary["final_ticker_count"]
        )

        st.info(advisor_text)