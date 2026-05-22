import os
import requests
import pandas as pd

from io import StringIO
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)

URL = "https://www.bi.go.id/id/statistik/indikator/BI-Rate.aspx"

HEADERS = {
    "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}


def get_hidden_fields(soup):

    fields = {}

    for field in [
        "__VIEWSTATE",
        "__VIEWSTATEGENERATOR",
        "__EVENTVALIDATION"
    ]:

        tag = soup.find(
            "input",
            {"name": field}
        )

        fields[field] = (
            tag["value"]
            if tag else ""
        )

    return fields


def scrape_all_bi_rate():

    session = requests.Session()

    session.headers.update(
        HEADERS
    )

    response = session.get(URL)

    soup = BeautifulSoup(
        response.text,
        "html.parser"
    )

    all_data = []

    page = 1

    while True:

        print(f"Scraping halaman {page}")

        table = soup.find("table")

        if not table:
            break

        df = pd.read_html(
            StringIO(str(table))
        )[0]

        all_data.append(df)

        next_page = page + 1

        link = soup.find(
            "a",
            string=str(next_page)
        )

        if not link:
            print("Pagination selesai")
            break

        href = link.get("href")

        event_target = (
            href
            .split("'")[1]
        )

        hidden = get_hidden_fields(
            soup
        )

        payload = {
            "__EVENTTARGET":
            event_target,

            "__EVENTARGUMENT":
            "",

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


def save_bi_rate_to_supabase():

    print("Mengambil data BI Rate...")

    df = scrape_all_bi_rate()

    # pilih kolom penting
    df = df[
        ["Tanggal", "BI-Rate"]
    ]

    # rename
    df.columns = [
        "tanggal",
        "rate"
    ]

    # convert tanggal Indonesia
    bulan_map = {
        "Januari": "January",
        "Februari": "February",
        "Maret": "March",
        "April": "April",
        "Mei": "May",
        "Juni": "June",
        "Juli": "July",
        "Agustus": "August",
        "September": "September",
        "Oktober": "October",
        "November": "November",
        "Desember": "December"
    }

    for indo, eng in bulan_map.items():
        df["tanggal"] = (
            df["tanggal"]
            .str.replace(
                indo,
                eng,
                regex=False
            )
        )

    df["tanggal"] = pd.to_datetime(
        df["tanggal"],
        dayfirst=True
    )

    # bersihkan rate
    df["rate"] = (
        df["rate"]
        .astype(str)
        .str.replace(
            "%",
            "",
            regex=False
        )
        .str.replace(
            " ",
            "",
            regex=False
        )
        .str.replace(
            ",",
            ".",
            regex=False
        )
        .astype(float)
    )

    inserted = 0
    skipped = 0

    for _, row in df.iterrows():

        tanggal = (
            row["tanggal"]
            .strftime("%Y-%m-%d")
        )

        rate = float(
            row["rate"]
        )

        existing = (
            supabase
            .table("bi_rates")
            .select("tanggal")
            .eq(
                "tanggal",
                tanggal
            )
            .execute()
        )

        if existing.data:
            skipped += 1
            continue

        supabase.table(
            "bi_rates"
        ).insert({
            "tanggal": tanggal,
            "rate": rate
        }).execute()

        inserted += 1

    print(
        f"Update selesai "
        f"(baru={inserted}, "
        f"skip={skipped})"
    )