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
        with open(file_path, encoding="utf-8") as f:
            st.markdown(
                f"<style>{f.read()}</style>",
                unsafe_allow_html=True
            )


# =========================================================
# PAGE CONFIG
# =========================================================

st.set_page_config(
    page_title="SmartInvest",
    page_icon="📈",
    layout="wide"
)

load_css(Path("assets/style.css"))


# =========================================================
# UI HELPER
# =========================================================

def section_header(title, description=None):
    st.markdown(f"### {title}")
    if description:
        st.caption(description)


def render_chart(fig, warning_text="Grafik tidak tersedia."):
    if fig is not None:
        st.plotly_chart(
            fig,
            use_container_width=True,
            config={
                "displayModeBar": False,
                "responsive": True
            }
        )
    else:
        st.warning(warning_text)


# =========================================================
# INDEX MAP
# =========================================================

index_map = {
    "LQ45": [
        "AADI.JK", "ADMR.JK", "ADRO.JK", "AKRA.JK", "AMMN.JK", "AMRT.JK",
        "ANTM.JK", "ASII.JK", "BBCA.JK", "BBNI.JK", "BBRI.JK", "BBTN.JK",
        "BMRI.JK", "BRPT.JK", "BUMI.JK", "CPIN.JK", "CUAN.JK", "DEWA.JK",
        "EMTK.JK", "ESSA.JK", "EXCL.JK", "GOTO.JK", "HRTA.JK", "ICBP.JK",
        "INCO.JK", "INDF.JK", "INKP.JK", "ISAT.JK", "ITMG.JK", "JPFA.JK",
        "KLBF.JK", "MAPI.JK", "MBMA.JK", "MDKA.JK", "MEDC.JK", "PGAS.JK",
        "PGEO.JK", "PTBA.JK", "SCMA.JK", "SMGR.JK", "TLKM.JK", "TOWR.JK",
        "UNTR.JK", "UNVR.JK", "WIFI.JK"
    ],
    "IDX30": [
        "AADI.JK", "ADMR.JK", "ADRO.JK", "AMRT.JK", "ANTM.JK", "ASII.JK",
        "BBCA.JK", "BBNI.JK", "BBRI.JK", "BMRI.JK", "BRPT.JK", "BUMI.JK",
        "CPIN.JK", "EMTK.JK", "GOTO.JK", "ICBP.JK", "INCO.JK", "INDF.JK",
        "INKP.JK", "JPFA.JK", "KLBF.JK", "MBMA.JK", "MDKA.JK", "MEDC.JK",
        "PGAS.JK", "PGEO.JK", "PTBA.JK", "TLKM.JK", "UNTR.JK", "UNVR.JK"
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
        "EDA digunakan untuk memahami karakteristik saham berdasarkan return, risiko, "
        "volatilitas, Sharpe Ratio, korelasi, dan hubungan risk-return."
    )

    if st.session_state.analysis_result is None:

        eda_index_choice = st.radio(
            "Pilih indeks untuk EDA",
            ["LQ45", "IDX30"],
            horizontal=True
        )

        eda_price_matrix = raw_price_matrix

        eda_index_map = {
            "LQ45": raw_price_matrix.columns.tolist(),
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

    with st.spinner(f"Menjalankan EDA untuk {eda_index_choice}..."):
        eda_result = cached_run_eda(
            index_choice=eda_index_choice,
            price_matrix=eda_price_matrix,
            index_map=eda_index_map
        )

    kpi = eda_result["kpi_summary"]

    section_header(
        f"KPI Summary - {eda_index_choice}",
        "Ringkasan performa umum saham berdasarkan data historis yang dianalisis."
    )

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

    section_header(
        "Distribusi Return dan Volatility",
        "Melihat sebaran return harian dan tingkat volatilitas tahunan saham."
    )

    col_a, col_b = st.columns(2)

    with col_a:
        render_chart(
            plot_return_distribution(
                eda_result["eda_log_return"],
                eda_index_choice
            )
        )

    with col_b:
        render_chart(
            plot_volatility_distribution(
                eda_result["eda_stock_summary"],
                eda_index_choice
            )
        )

    st.divider()

    section_header(
        "Top dan Bottom Return",
        "Membandingkan saham dengan return tahunan tertinggi dan terendah."
    )

    col_c, col_d = st.columns(2)

    with col_c:
        render_chart(
            plot_top_return(
                eda_result["top_return"],
                eda_index_choice
            )
        )

    with col_d:
        render_chart(
            plot_bottom_return(
                eda_result["bottom_return"],
                eda_index_choice
            )
        )

    st.divider()

    section_header(
        "Top dan Bottom Risk",
        "Membandingkan saham dengan volatilitas tahunan tertinggi dan terendah."
    )

    col_e, col_f = st.columns(2)

    with col_e:
        render_chart(
            plot_top_risk(
                eda_result["top_risk"],
                eda_index_choice
            )
        )

    with col_f:
        render_chart(
            plot_bottom_risk(
                eda_result["bottom_risk"],
                eda_index_choice
            )
        )

    st.divider()

    section_header(
        "Sharpe Ratio Ranking",
        "Saham dengan efisiensi return terhadap risiko terbaik."
    )

    render_chart(
        plot_top_sharpe(
            eda_result["top_sharpe"],
            eda_index_choice
        )
    )

    st.dataframe(
        format_stock_summary_table(eda_result["top_sharpe"]),
        use_container_width=True
    )

    st.divider()

    section_header(
        "Risk vs Return",
        "Visualisasi hubungan antara risiko dan return setiap saham."
    )

    render_chart(
        plot_risk_return_scatter(
            eda_result["eda_stock_summary"],
            eda_index_choice
        )
    )

    st.divider()

    section_header(
        "Correlation Heatmap",
        "Menganalisis hubungan korelasi antar saham sebagai dasar diversifikasi."
    )

    render_chart(
        plot_correlation_heatmap(
            eda_result["correlation_matrix"],
            eda_index_choice
        )
    )

    st.divider()

    section_header(
        "Cumulative Return dan Rolling Volatility",
        "Melihat pertumbuhan return kumulatif dan perubahan volatilitas dari waktu ke waktu."
    )

    selected_tickers = eda_result["top_return"]["Ticker"].head(5).tolist()

    render_chart(
        plot_cumulative_return(
            eda_result["cumulative_return"],
            selected_tickers,
            eda_index_choice
        )
    )

    render_chart(
        plot_rolling_volatility(
            eda_result["rolling_volatility"],
            selected_tickers,
            eda_index_choice
        )
    )


# =========================================================
# TAB 2: PORTFOLIO ANALYSIS
# =========================================================

with tab_portfolio:

    st.header("💼 Portfolio Analysis")
    st.caption(
        "Analisis portfolio menampilkan rekomendasi alokasi dana, performa portfolio, "
        "perbandingan model, dan detail teknis proses perhitungan."
    )

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

        best_sharpe_model = get_best_model_by_sharpe(comparison_df)
        lowest_risk_model = get_lowest_risk_model(comparison_df)
        highest_return_model = get_highest_return_model(comparison_df)

        # =========================================================
        # 1. EXECUTIVE SUMMARY
        # =========================================================

        section_header(
            "Executive Summary",
            "Ringkasan hasil utama agar pengguna langsung memahami performa portfolio."
        )

        col1, col2, col3, col4 = st.columns(4)

        col1.metric("Selected Model", selected_result["method"])
        col2.metric(
            "Annualized Return",
            format_percent(selected_result["portfolio_annual_return"])
        )
        col3.metric(
            "Annualized Volatility",
            format_percent(selected_result["portfolio_annual_risk"])
        )
        col4.metric(
            "Sharpe Ratio",
            format_decimal(selected_result["sharpe_ratio"])
        )

        col5, col6, col7 = st.columns(3)

        col5.metric("Best Sharpe Model", best_sharpe_model)
        col6.metric("Lowest Risk Model", lowest_risk_model)
        col7.metric("Highest Return Model", highest_return_model)

        st.info(
            f"Analisis dilakukan pada indeks **{user_input['index_choice']}** "
            f"periode **{user_input['start_date']}** sampai **{user_input['end_date']}** "
            f"dengan modal investasi **{format_rupiah(user_input['investment_amount'])}**."
        )

        st.divider()

        # =========================================================
        # 2. PORTFOLIO RECOMMENDATION
        # =========================================================

        section_header(
            f"Portfolio Recommendation - {selected_result['method']}",
            "Komposisi alokasi dana berdasarkan metode portfolio yang dipilih."
        )

        render_chart(
            plot_portfolio_allocation(
                weights_df,
                selected_result["method"]
            ),
            warning_text="Grafik pie tidak tersedia karena tidak ada bobot positif."
        )

        render_chart(
            plot_portfolio_allocation_bar(
                weights_df,
                selected_result["method"]
            ),
            warning_text="Grafik bar tidak tersedia."
        )

        section_header(
            "Recommended Stocks Table",
            "Daftar saham terpilih beserta bobot, alokasi dana, return, risiko, dan metrik pendukung."
        )

        display_portfolio_df = select_portfolio_display_columns(weights_df)
        display_portfolio_df = format_portfolio_table(display_portfolio_df)

        st.dataframe(
            display_portfolio_df,
            use_container_width=True
        )

        st.divider()

        # =========================================================
        # 3. PORTFOLIO PERFORMANCE
        # =========================================================

        section_header(
            "Portfolio Performance",
            "Evaluasi performa portfolio berdasarkan return historis, risiko, dan rasio efisiensi."
        )

        col10, col11, col12, col13 = st.columns(4)

        col10.metric(
            "Annualized Return",
            format_percent(selected_result["portfolio_annual_return"])
        )

        col11.metric(
            "Annualized Volatility",
            format_percent(selected_result["portfolio_annual_risk"])
        )

        col12.metric(
            "Sharpe Ratio",
            format_decimal(selected_result["sharpe_ratio"])
        )

        col13.metric(
            "Selected Stocks",
            selected_result.get("selected_stock_count", len(weights_df))
        )

        render_chart(
            plot_portfolio_cumulative_return(
                selected_result["portfolio_daily_return"],
                user_input["investment_amount"],
                selected_result["method"]
            )
        )

        render_chart(
            plot_selected_portfolio_risk_return(
                weights_df,
                selected_result["method"]
            ),
            warning_text="Data risk-return tidak tersedia untuk visualisasi ini."
        )

        st.divider()

        # =========================================================
        # 4. MODEL COMPARISON
        # =========================================================

        section_header(
            "Perbandingan 3 Model Portfolio",
            "Membandingkan MVEP, SIM, dan CAPM berdasarkan return, risiko, Sharpe Ratio, beta, dan alpha."
        )

        col14, col15, col16 = st.columns(3)

        col14.metric("Best Sharpe Model", best_sharpe_model)
        col15.metric("Lowest Risk Model", lowest_risk_model)
        col16.metric("Highest Return Model", highest_return_model)

        st.dataframe(
            format_comparison_table(comparison_df),
            use_container_width=True
        )

        render_chart(
            plot_model_comparison(comparison_df)
        )

        render_chart(
            plot_model_return_risk_scatter(comparison_df)
        )

        render_chart(
            plot_portfolio_beta_comparison(comparison_df)
        )

        render_chart(
            plot_portfolio_alpha_comparison(comparison_df)
        )

        portfolio_weight_comparison = all_model_result.get(
            "portfolio_weight_comparison"
        )

        if portfolio_weight_comparison is not None:

            section_header(
                "Perbandingan Bobot Saham Tiap Model",
                "Melihat perbedaan komposisi bobot saham dari setiap metode portfolio."
            )

            weight_model_choice = st.selectbox(
                "Pilih model untuk melihat bobot portfolio",
                ["MVEP", "SIM", "CAPM"]
            )

            render_chart(
                plot_portfolio_weight_comparison(
                    portfolio_weight_comparison,
                    weight_model_choice
                )
            )

            with st.expander("Lihat Tabel Perbandingan Bobot"):
                st.dataframe(
                    portfolio_weight_comparison,
                    use_container_width=True
                )

        st.divider()

        # =========================================================
        # 5. AI ADVISOR
        # =========================================================

        section_header(
            "AI Advisor / Portfolio Insight",
            "Interpretasi sederhana dari hasil portfolio untuk membantu pengguna memahami risiko dan potensi return."
        )

        advisor_text = generate_simple_advisor(
            selected_model=selected_result["method"],
            portfolio_return=selected_result["portfolio_annual_return"],
            portfolio_risk=selected_result["portfolio_annual_risk"],
            sharpe_ratio=selected_result["sharpe_ratio"],
            valid_ticker_count=feature_summary["final_ticker_count"]
        )

        st.info(advisor_text)

        st.divider()

        # =========================================================
        # 6. TECHNICAL DETAILS
        # =========================================================

        section_header(
            "Technical Details",
            "Detail proses input, dynamic filtering, feature engineering, dan perhitungan model."
        )

        with st.expander("Input Summary"):
            col17, col18, col19, col20 = st.columns(4)

            col17.metric("Selected Model", user_input["model_choice"])
            col18.metric("Target Index", user_input["index_choice"])
            col19.metric("Capital", format_rupiah(user_input["investment_amount"]))
            col20.metric("Trading Days", feature_summary["trading_days_used"])

            st.write(
                f"Periode analisis: **{user_input['start_date']}** sampai **{user_input['end_date']}**"
            )

        with st.expander("Dynamic Filtering Summary"):
            col21, col22, col23, col24 = st.columns(4)

            col21.metric("Initial Tickers", filtering_summary["initial_ticker_count"])
            col22.metric("Available Tickers", filtering_summary["available_ticker_count"])
            col23.metric("Valid Tickers", filtering_summary["valid_ticker_count"])
            col24.metric("Removed Tickers", filtering_summary["removed_ticker_count"])

            st.json(filtering_summary)

        with st.expander("Feature Engineering Summary"):
            col25, col26, col27, col28 = st.columns(4)

            col25.metric("Initial Stocks", feature_summary["initial_ticker_count"])
            col26.metric("Removed Negative Return", feature_summary["removed_negative_return_count"])
            col27.metric("Final Stocks", feature_summary["final_ticker_count"])
            col28.metric("Risk-Free Rate", format_percent(feature_summary["risk_free_rate_annual"]))

            st.write("Saham yang dieliminasi karena return negatif:")
            st.write(feature_summary["removed_negative_return_tickers"])

        with st.expander(f"Detail Perhitungan Model {selected_result['method']}"):

            if selected_result["method"] == "MVEP":
                st.info(
                    f"MVEP menggunakan 10 pasangan saham dengan korelasi terendah. "
                    f"Jumlah saham terpilih: {selected_result.get('selected_stock_count', len(weights_df))}. "
                    f"Bobot negatif tetap ditampilkan karena mengikuti hasil matematis MVEP."
                )

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

                if "all_weights_before_cutoff" in selected_result:
                    st.dataframe(
                        selected_result["all_weights_before_cutoff"],
                        use_container_width=True
                    )