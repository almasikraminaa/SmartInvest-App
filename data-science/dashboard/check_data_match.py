# dashboard/check_data_match.py

from utils.data_loader import load_price_matrix
from utils.eda import run_eda

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
    ]
}

price_matrix = load_price_matrix()

eda = run_eda("LQ45", price_matrix, index_map)

print("Price Matrix:", price_matrix.shape)
print("Date range:", price_matrix.index.min(), price_matrix.index.max())
print("EDA Price:", eda["eda_price"].shape)
print("Log Return:", eda["eda_log_return"].shape)
print("Stack Count:", eda["eda_log_return"].stack().dropna().shape)
print("Min Return:", eda["eda_log_return"].min().min())
print("Max Return:", eda["eda_log_return"].max().max())
print("Volatility Min:", eda["eda_stock_summary"]["annualized_volatility"].min())
print("Volatility Max:", eda["eda_stock_summary"]["annualized_volatility"].max())

print("\n=== TICKER DI INDEX MAP LQ45 ===")
print(len(index_map["LQ45"]))
print(index_map["LQ45"])

print("\n=== TICKER DI PRICE MATRIX ===")
print(len(price_matrix.columns))
print(price_matrix.columns.tolist())

available = [
    ticker for ticker in index_map["LQ45"]
    if ticker in price_matrix.columns
]

missing_from_price_matrix = [
    ticker for ticker in index_map["LQ45"]
    if ticker not in price_matrix.columns
]

extra_in_price_matrix = [
    ticker for ticker in price_matrix.columns
    if ticker not in index_map["LQ45"]
]

print("\n=== AVAILABLE ===")
print(len(available))
print(available)

print("\n=== MISSING FROM PRICE MATRIX ===")
print(len(missing_from_price_matrix))
print(missing_from_price_matrix)

print("\n=== EXTRA IN PRICE MATRIX BUT NOT IN INDEX MAP ===")
print(len(extra_in_price_matrix))
print(extra_in_price_matrix)