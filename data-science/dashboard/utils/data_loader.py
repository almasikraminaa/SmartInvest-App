import pandas as pd
from pathlib import Path


# =========================================================
# PATH CONFIG
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"


# =========================================================
# BASIC VALIDATION
# =========================================================

def _check_file_exists(file_path):
    if not file_path.exists():
        raise FileNotFoundError(
            f"File tidak ditemukan: {file_path}"
        )


def _clean_columns(df):
    df.columns = df.columns.astype(str).str.strip()
    return df


# =========================================================
# LOAD CLEAN / MODELING DATA
# =========================================================

def load_price_matrix():
    """
    Load price_matrix_master.csv.
    Dataset ini digunakan untuk dynamic filtering, feature engineering,
    dan portfolio modeling.
    """

    file_path = DATA_DIR / "price_matrix_master.csv"
    _check_file_exists(file_path)

    price_matrix = pd.read_csv(
        file_path,
        index_col=0,
        parse_dates=True
    )

    price_matrix = _clean_columns(price_matrix)
    price_matrix.index.name = "Date"
    price_matrix = price_matrix.sort_index()

    return price_matrix


def load_market_price():
    """
    Load market_price_ihsg.csv.
    Data IHSG digunakan untuk market return, beta, SIM, dan CAPM.
    """

    file_path = DATA_DIR / "market_price_ihsg.csv"
    _check_file_exists(file_path)

    market_price = pd.read_csv(
        file_path,
        index_col=0,
        parse_dates=True
    )

    market_price = _clean_columns(market_price)
    market_price.index.name = "Date"
    market_price = market_price.sort_index()

    return market_price


def load_bi_rate():
    """
    Load bi_rate_daily.csv.
    Data BI Rate harian digunakan sebagai risk-free rate.
    """

    file_path = DATA_DIR / "bi_rate_daily.csv"
    _check_file_exists(file_path)

    bi_rate = pd.read_csv(
        file_path,
        index_col=0,
        parse_dates=True
    )

    bi_rate = _clean_columns(bi_rate)
    bi_rate.index.name = "Date"
    bi_rate = bi_rate.sort_index()

    return bi_rate


def load_clean_master_stock_data():
    """
    Optional.
    Load clean_master_stock_data.csv untuk kebutuhan debugging atau inspeksi data.
    """

    file_path = DATA_DIR / "clean_master_stock_data.csv"
    _check_file_exists(file_path)

    clean_stock_data = pd.read_csv(file_path)

    clean_stock_data = _clean_columns(clean_stock_data)

    if "Date" in clean_stock_data.columns:
        clean_stock_data["Date"] = pd.to_datetime(
            clean_stock_data["Date"],
            errors="coerce"
        )

    return clean_stock_data


def load_stock_completeness():
    """
    Optional.
    Load stock_completeness_master.csv untuk melihat kelengkapan data saham.
    """

    file_path = DATA_DIR / "stock_completeness_master.csv"
    _check_file_exists(file_path)

    stock_completeness = pd.read_csv(file_path)
    stock_completeness = _clean_columns(stock_completeness)

    return stock_completeness


# =========================================================
# LOAD RAW DATA FOR GLOBAL EDA
# =========================================================

def load_raw_stock_data():
    """
    Load raw_stock_data_lq45_idx30.csv untuk EDA awal.

    Function ini mendukung 2 kemungkinan format:
    1. Long format:
       Date | Ticker | Adj Close / Close | ...
    2. Price matrix format:
       Date sebagai index, kolom = ticker, value = harga saham
    """

    file_path = DATA_DIR / "raw_stock_data_lq45_idx30.csv"
    _check_file_exists(file_path)

    raw_data = pd.read_csv(file_path)
    raw_data = _clean_columns(raw_data)

    # =====================================================
    # CASE 1: Long format
    # =====================================================

    if "Date" in raw_data.columns and "Ticker" in raw_data.columns:

        raw_data["Date"] = pd.to_datetime(
            raw_data["Date"],
            errors="coerce"
        )

        raw_data = raw_data.dropna(subset=["Date", "Ticker"])

        if "Adj Close" in raw_data.columns:
            price_col = "Adj Close"
        elif "Close" in raw_data.columns:
            price_col = "Close"
        else:
            raise ValueError(
                "Kolom harga tidak ditemukan. Butuh kolom 'Adj Close' atau 'Close'."
            )

        raw_price_matrix = raw_data.pivot_table(
            index="Date",
            columns="Ticker",
            values=price_col,
            aggfunc="last"
        )

    # =====================================================
    # CASE 2: Price matrix format
    # =====================================================

    else:
        raw_price_matrix = pd.read_csv(
            file_path,
            index_col=0,
            parse_dates=True
        )

        raw_price_matrix = _clean_columns(raw_price_matrix)

    raw_price_matrix.index.name = "Date"
    raw_price_matrix = raw_price_matrix.sort_index()

    # Pastikan semua value harga numerik
    raw_price_matrix = raw_price_matrix.apply(
        pd.to_numeric,
        errors="coerce"
    )

    # Hapus kolom yang seluruhnya kosong
    raw_price_matrix = raw_price_matrix.dropna(
        axis=1,
        how="all"
    )

    return raw_price_matrix