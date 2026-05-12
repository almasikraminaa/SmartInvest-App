from utils.data_loader import (
    load_price_matrix,
    load_market_price,
    load_bi_rate
)

from utils.dynamic_filtering import dynamic_filtering


# ==========================================
# INDEX MAP
# ==========================================
# Sesuaikan dengan ticker yang ada di notebook kamu

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


# ==========================================
# LOAD DATA
# ==========================================

price_matrix = load_price_matrix()
market_price = load_market_price()
bi_rate_daily = load_bi_rate()


print("=== DATA BERHASIL DI-LOAD ===")
print("Price Matrix:", price_matrix.shape)
print("Market Price:", market_price.shape)
print("BI Rate:", bi_rate_daily.shape)


# ==========================================
# TEST DYNAMIC FILTERING
# ==========================================

filtered_result = dynamic_filtering(
    index_choice="LQ45",
    start_date="2023-06-21",
    end_date="2024-09-30",
    price_matrix=price_matrix,
    market_price=market_price,
    bi_rate_daily=bi_rate_daily,
    index_map=index_map,
    min_months=6
)


# ==========================================
# AMBIL OUTPUT
# ==========================================

filtered_price = filtered_result["filtered_price"]
filtered_market = filtered_result["filtered_market"]
filtered_bi_rate = filtered_result["filtered_bi_rate"]

valid_tickers = filtered_result["valid_tickers"]
removed_tickers = filtered_result["removed_tickers"]
filtering_summary = filtered_result["filtering_summary"]


# ==========================================
# PRINT RINGKASAN
# ==========================================

print("\n=== RINGKASAN DYNAMIC FILTERING ===")

for key, value in filtering_summary.items():
    print(f"{key}: {value}")


# ==========================================
# CEK OUTPUT
# ==========================================

print("\n=== SHAPE OUTPUT ===")
print("Filtered Price:", filtered_price.shape)
print("Filtered Market:", filtered_market.shape)
print("Filtered BI Rate:", filtered_bi_rate.shape)


print("\n=== VALID TICKERS ===")
print(valid_tickers)


print("\n=== REMOVED TICKERS ===")
print(removed_tickers)


# ==========================================
# CEK MISSING VALUE
# ==========================================

print("\n=== CEK MISSING VALUE ===")
print("Filtered Price Missing:", filtered_price.isnull().sum().sum())
print("Filtered Market Missing:", filtered_market.isnull().sum().sum())
print("Filtered BI Rate Missing:", filtered_bi_rate.isnull().sum().sum())


# ==========================================
# CEK DATE RANGE
# ==========================================

print("\n=== DATE RANGE OUTPUT ===")
print("Filtered Price:", filtered_price.index.min(), "sampai", filtered_price.index.max())
print("Filtered Market:", filtered_market.index.min(), "sampai", filtered_market.index.max())
print("Filtered BI Rate:", filtered_bi_rate.index.min(), "sampai", filtered_bi_rate.index.max())


print("\nDYNAMIC FILTERING BERHASIL DIJALANKAN")