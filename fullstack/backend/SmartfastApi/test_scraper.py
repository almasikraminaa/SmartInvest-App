import requests
import pandas as pd
from bs4 import BeautifulSoup
from io import StringIO

URL = "https://www.bi.go.id/id/statistik/indikator/BI-Rate.aspx"

HEADERS = {
    "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}


def get_hidden_fields(soup):
    """
    Ambil hidden ASP.NET fields
    """
    fields = {}

    for field in [
        "__VIEWSTATE",
        "__VIEWSTATEGENERATOR",
        "__EVENTVALIDATION"
    ]:
        tag = soup.find("input", {"name": field})
        fields[field] = tag["value"] if tag else ""

    return fields


def scrape_all_bi_rate():

    session = requests.Session()
    session.headers.update(HEADERS)

    # buka halaman pertama
    response = session.get(URL)

    soup = BeautifulSoup(response.text, "html.parser")

    all_data = []

    page = 1

    while True:

        print(f"Scraping halaman {page}")

        table = soup.find("table")

        if not table:
            print("Table tidak ditemukan")
            break

        df = pd.read_html(
            StringIO(str(table))
        )[0]

        all_data.append(df)

        # cari pagination berikutnya
        next_page = page + 1

        link = soup.find(
            "a",
            string=str(next_page)
        )

        if not link:
            print("Pagination selesai")
            break

        href = link.get("href")

        if "__doPostBack" not in href:
            break

        # extract __EVENTTARGET
        event_target = (
            href
            .split("'")[1]
        )

        hidden = get_hidden_fields(soup)

        payload = {
            "__EVENTTARGET": event_target,
            "__EVENTARGUMENT": "",
            **hidden
        }

        response = session.post(
            URL,
            data=payload
        )

        soup = BeautifulSoup(
            response.text,
            "html.parser"
        )

        page += 1

    final_df = pd.concat(
        all_data,
        ignore_index=True
    )

    return final_df


df = scrape_all_bi_rate()

# tampilkan semua row
pd.set_option("display.max_rows", None)

# tampilkan semua kolom
pd.set_option("display.max_columns", None)

# biar teks tidak kepotong
pd.set_option("display.max_colwidth", None)

print(df)

print("\nJumlah data:", len(df))
df.to_csv(
    "bi_rate_full.csv",
    index=False,
    encoding="utf-8-sig"
)

print("CSV berhasil dibuat")