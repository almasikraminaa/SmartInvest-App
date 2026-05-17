import pandas as pd
from pathlib import Path

# Lokasi folder dashboard
BASE_DIR = Path(__file__).resolve().parent.parent

# Lokasi folder data
DATA_DIR = BASE_DIR / "data"


def load_price_matrix():
    """
    Load price_matrix_master.csv
    Data berbentuk:
    index = Date
    columns = ticker saham
    values = harga saham
    """

    price_matrix = pd.read_csv(
        DATA_DIR / "price_matrix_master.csv",
        index_col=0,
        parse_dates=True
    )

    price_matrix.index.name = "Date"

    return price_matrix


def load_market_price():
    """
    Load market_price_ihsg.csv
    Data IHSG untuk perhitungan market return, beta, SIM, dan CAPM.
    """

    market_price = pd.read_csv(
        DATA_DIR / "market_price_ihsg.csv",
        index_col=0,
        parse_dates=True
    )

    market_price.index.name = "Date"

    return market_price


def load_bi_rate():
    """
    Load bi_rate_daily.csv
    Data BI Rate harian sebagai risk-free rate.
    """

    bi_rate = pd.read_csv(
        DATA_DIR / "bi_rate_daily.csv",
        index_col=0,
        parse_dates=True
    )

    bi_rate.index.name = "Date"

    return bi_rate


def load_clean_master_stock_data():
    """
    Optional.
    Load clean_master_stock_data.csv untuk kebutuhan EDA atau debugging.
    """

    clean_stock_data = pd.read_csv(
        DATA_DIR / "clean_master_stock_data.csv",
        parse_dates=["Date"]
    )

    return clean_stock_data


def load_stock_completeness():
    """
    Optional.
    Load stock_completeness_master.csv untuk melihat kelengkapan data saham.
    """

    stock_completeness = pd.read_csv(
        DATA_DIR / "stock_completeness_master.csv"
    )

    return stock_completeness

def load_all_data():
    """
    Load seluruh data utama SmartInvest.
    """

    return {
        "price_matrix": load_price_matrix(),
        "market_price": load_market_price(),
        "bi_rate": load_bi_rate(),
        "clean_stock_data": load_clean_master_stock_data(),
        "stock_completeness": load_stock_completeness()
    }