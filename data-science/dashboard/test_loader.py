from utils.data_loader import (
    load_price_matrix,
    load_market_price,
    load_bi_rate,
    load_clean_master_stock_data,
    load_stock_completeness
)


# ==============================
# TEST LOAD DATA
# ==============================

price_matrix = load_price_matrix()
market_price = load_market_price()
bi_rate = load_bi_rate()
clean_stock_data = load_clean_master_stock_data()
stock_completeness = load_stock_completeness()


# ==============================
# CEK SHAPE
# ==============================

print("=== SHAPE DATA ===")
print("Price Matrix:", price_matrix.shape)
print("Market Price:", market_price.shape)
print("BI Rate:", bi_rate.shape)
print("Clean Stock Data:", clean_stock_data.shape)
print("Stock Completeness:", stock_completeness.shape)


# ==============================
# CEK INDEX DAN KOLOM
# ==============================

print("\n=== PRICE MATRIX INFO ===")
print(price_matrix.head())
print(price_matrix.index.dtype)
print(price_matrix.columns[:10])


print("\n=== MARKET PRICE INFO ===")
print(market_price.head())
print(market_price.index.dtype)
print(market_price.columns)


print("\n=== BI RATE INFO ===")
print(bi_rate.head())
print(bi_rate.index.dtype)
print(bi_rate.columns)


# ==============================
# CEK MISSING VALUE
# ==============================

print("\n=== MISSING VALUE ===")
print("Price Matrix Missing:", price_matrix.isnull().sum().sum())
print("Market Price Missing:", market_price.isnull().sum().sum())
print("BI Rate Missing:", bi_rate.isnull().sum().sum())


# ==============================
# CEK RENTANG TANGGAL
# ==============================

print("\n=== DATE RANGE ===")
print("Price Matrix:", price_matrix.index.min(), "sampai", price_matrix.index.max())
print("Market Price:", market_price.index.min(), "sampai", market_price.index.max())
print("BI Rate:", bi_rate.index.min(), "sampai", bi_rate.index.max())


print("\nDATA LOADER BERHASIL DIJALANKAN")