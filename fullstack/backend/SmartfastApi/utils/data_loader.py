import os
import pandas as pd
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

# Load file .env
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Inisialisasi client Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Lokasi folder data untuk file lokal lainnya
BASE_DIR = Path(__file__).resolve().parent.parent
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
    Load data BI Rate langsung dari database Supabase sebagai risk-free rate.
    Data berbentuk:
    index = Date
    columns = BI-Rate
    """
    try:
        # Ambil data dari tabel Supabase
        response = (
            supabase.table("bi_rates")
            .select("tanggal, rate")
            .order("tanggal", desc=False) # Diurutkan maju agar runtun waktu (time-series) benar
            .execute()
        )
        
        # Ubah ke DataFrame Pandas
        bi_rate = pd.DataFrame(response.data)
        
        if bi_rate.empty:
            print("Peringatan: Tabel bi_rates di Supabase kosong.")
            return pd.DataFrame(columns=["BI-Rate"], index=pd.DatetimeIndex([]))

        # 1. Ubah nama kolom agar sesuai dengan format analisis data Anda sebelumnya
        bi_rate = bi_rate.rename(columns={"tanggal": "Date", "rate": "BI-Rate"})
        
        # 2. Parse kolom Date menjadi tipe datetime
        bi_rate["Date"] = pd.to_datetime(bi_rate["Date"])
        
        # 3. Set Date sebagai index DataFrame
        bi_rate.set_index("Date", inplace=True)
        
        return bi_rate
        
    except Exception as e:
        print(f"Error saat mengambil BI Rate dari Supabase: {e}")
        # Mengembalikan DataFrame kosong dengan struktur kolom yang benar agar sistem tidak crash
        return pd.DataFrame(columns=["BI-Rate"])


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