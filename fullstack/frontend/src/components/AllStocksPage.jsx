// src/components/AllStocksPage.jsx
import { useEffect, useState } from "react";

const LQ45_LIST = [
  {
    code: "BBCA.JK",
    label: "BBCA",
    name: "Bank Central Asia",
    sector: "Perbankan",
    index: "LQ45",
  },
  {
    code: "BBRI.JK",
    label: "BBRI",
    name: "Bank Rakyat Indonesia",
    sector: "Perbankan",
    index: "LQ45",
  },
  {
    code: "BMRI.JK",
    label: "BMRI",
    name: "Bank Mandiri",
    sector: "Perbankan",
    index: "LQ45",
  },
  {
    code: "BBNI.JK",
    label: "BBNI",
    name: "Bank Negara Indonesia",
    sector: "Perbankan",
    index: "LQ45",
  },
  {
    code: "BRIS.JK",
    label: "BRIS",
    name: "Bank Syariah Indonesia",
    sector: "Perbankan",
    index: "LQ45",
  },
  {
    code: "TLKM.JK",
    label: "TLKM",
    name: "Telkom Indonesia",
    sector: "Telko",
    index: "LQ45",
  },
  {
    code: "ISAT.JK",
    label: "ISAT",
    name: "Indosat Ooredoo Hutchison",
    sector: "Telko",
    index: "LQ45",
  },
  {
    code: "GOTO.JK",
    label: "GOTO",
    name: "GoTo Gojek Tokopedia",
    sector: "Teknologi",
    index: "LQ45",
  },
  {
    code: "ASII.JK",
    label: "ASII",
    name: "Astra International",
    sector: "Industri",
    index: "LQ45",
  },
  {
    code: "UNTR.JK",
    label: "UNTR",
    name: "United Tractors",
    sector: "Industri",
    index: "LQ45",
  },
  {
    code: "ADRO.JK",
    label: "ADRO",
    name: "Adaro Energy Indonesia",
    sector: "Energi",
    index: "LQ45",
  },
  {
    code: "PGAS.JK",
    label: "PGAS",
    name: "Perusahaan Gas Negara",
    sector: "Energi",
    index: "LQ45",
  },
  {
    code: "PTBA.JK",
    label: "PTBA",
    name: "Bukit Asam",
    sector: "Energi",
    index: "LQ45",
  },
  {
    code: "BREN.JK",
    label: "BREN",
    name: "Barito Renewables Energy",
    sector: "Energi",
    index: "LQ45",
  },
  {
    code: "ANTM.JK",
    label: "ANTM",
    name: "Aneka Tambang",
    sector: "Tambang",
    index: "LQ45",
  },
  {
    code: "MDKA.JK",
    label: "MDKA",
    name: "Merdeka Copper Gold",
    sector: "Tambang",
    index: "LQ45",
  },
  {
    code: "INCO.JK",
    label: "INCO",
    name: "Vale Indonesia",
    sector: "Tambang",
    index: "LQ45",
  },
  {
    code: "UNVR.JK",
    label: "UNVR",
    name: "Unilever Indonesia",
    sector: "Konsumsi",
    index: "LQ45",
  },
  {
    code: "ICBP.JK",
    label: "ICBP",
    name: "Indofood CBP",
    sector: "Konsumsi",
    index: "LQ45",
  },
  {
    code: "INDF.JK",
    label: "INDF",
    name: "Indofood Sukses Makmur",
    sector: "Konsumsi",
    index: "LQ45",
  },
  {
    code: "AMRT.JK",
    label: "AMRT",
    name: "Sumber Alfaria (Alfamart)",
    sector: "Konsumsi",
    index: "LQ45",
  },
  {
    code: "KLBF.JK",
    label: "KLBF",
    name: "Kalbe Farma",
    sector: "Kesehatan",
    index: "LQ45",
  },
  {
    code: "MIKA.JK",
    label: "MIKA",
    name: "Mitra Keluarga Karyasehat",
    sector: "Kesehatan",
    index: "LQ45",
  },
  {
    code: "INTP.JK",
    label: "INTP",
    name: "Indocement Tunggal Prakarsa",
    sector: "Material",
    index: "LQ45",
  },
  {
    code: "SMGR.JK",
    label: "SMGR",
    name: "Semen Indonesia",
    sector: "Material",
    index: "LQ45",
  },
];

const IDX30_LIST = [
  {
    code: "BBCA.JK",
    label: "BBCA",
    name: "Bank Central Asia",
    sector: "Perbankan",
    index: "IDX30",
  },
  {
    code: "BBRI.JK",
    label: "BBRI",
    name: "Bank Rakyat Indonesia",
    sector: "Perbankan",
    index: "IDX30",
  },
  {
    code: "BMRI.JK",
    label: "BMRI",
    name: "Bank Mandiri",
    sector: "Perbankan",
    index: "IDX30",
  },
  {
    code: "BBNI.JK",
    label: "BBNI",
    name: "Bank Negara Indonesia",
    sector: "Perbankan",
    index: "IDX30",
  },
  {
    code: "BRIS.JK",
    label: "BRIS",
    name: "Bank Syariah Indonesia",
    sector: "Perbankan",
    index: "IDX30",
  },
  {
    code: "TLKM.JK",
    label: "TLKM",
    name: "Telkom Indonesia",
    sector: "Telko",
    index: "IDX30",
  },
  {
    code: "GOTO.JK",
    label: "GOTO",
    name: "GoTo Gojek Tokopedia",
    sector: "Teknologi",
    index: "IDX30",
  },
  {
    code: "ASII.JK",
    label: "ASII",
    name: "Astra International",
    sector: "Industri",
    index: "IDX30",
  },
  {
    code: "ADRO.JK",
    label: "ADRO",
    name: "Adaro Energy Indonesia",
    sector: "Energi",
    index: "IDX30",
  },
  {
    code: "PGAS.JK",
    label: "PGAS",
    name: "Perusahaan Gas Negara",
    sector: "Energi",
    index: "IDX30",
  },
  {
    code: "BREN.JK",
    label: "BREN",
    name: "Barito Renewables Energy",
    sector: "Energi",
    index: "IDX30",
  },
  {
    code: "ANTM.JK",
    label: "ANTM",
    name: "Aneka Tambang",
    sector: "Tambang",
    index: "IDX30",
  },
  {
    code: "MDKA.JK",
    label: "MDKA",
    name: "Merdeka Copper Gold",
    sector: "Tambang",
    index: "IDX30",
  },
  {
    code: "UNVR.JK",
    label: "UNVR",
    name: "Unilever Indonesia",
    sector: "Konsumsi",
    index: "IDX30",
  },
  {
    code: "ICBP.JK",
    label: "ICBP",
    name: "Indofood CBP",
    sector: "Konsumsi",
    index: "IDX30",
  },
  {
    code: "KLBF.JK",
    label: "KLBF",
    name: "Kalbe Farma",
    sector: "Kesehatan",
    index: "IDX30",
  },
];

const ALL_STOCKS = [
  ...new Map(
    [...LQ45_LIST, ...IDX30_LIST].map((s) => {
      const isLQ45 = LQ45_LIST.some((l) => l.code === s.code);
      const isIDX30 = IDX30_LIST.some((i) => i.code === s.code);
      let indexType = isLQ45 && isIDX30 ? "BOTH" : isLQ45 ? "LQ45" : "IDX30";
      return [s.code, { ...s, indexGroup: indexType }];
    }),
  ).values(),
];

const SECTORS = [
  "Semua",
  "Perbankan",
  "Telko",
  "Teknologi",
  "Energi",
  "Industri",
  "Tambang",
  "Konsumsi",
  "Kesehatan",
  "Material",
];

function safeNum(v) {
  const n = Number(v);
  return isFinite(n) && n > 0 ? n : null;
}
function safeChange(cur, prev) {
  if (!cur || !prev) return null;
  return parseFloat((((cur - prev) / prev) * 100).toFixed(2));
}

function Avatar({ code, up }) {
  return (
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0
      ${up ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}
    >
      {code[0]}
    </div>
  );
}

function TrendIcon({ up, size = 10 }) {
  return up ? (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ) : (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}

async function fetchOne(s) {
  try {
    // ⚡ FIX: Langsung fetch ke proxy internal Vercel kamu tanpa membungkus targetUrl terpisah
    const res = await fetch(
      `/api/yahoo/v8/finance/chart/${encodeURIComponent(s.code)}?interval=1d&range=5d`,
    );
    const data = await res.json();

    const meta = data?.chart?.result?.[0]?.meta;
    const quotes =
      data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? [];
    const valid = quotes.filter((c) => c !== null && isFinite(Number(c)));
    const cur = safeNum(meta?.regularMarketPrice) ?? safeNum(valid.at(-1));
    const mp = safeNum(meta?.previousClose);
    const prev = mp && mp !== cur ? mp : safeNum(valid.at(-2));

    return {
      ...s,
      price: cur,
      change: safeChange(cur, prev),
      error: false,
    };
  } catch (err) {
    console.error(`Gagal mengambil data Yahoo untuk ${s.label}:`, err);
    return {
      ...s,
      price: null,
      change: null,
      error: true,
    };
  }
}

export default function AllStocksPage({ onBack }) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [indexFilter, setIndexFilter] = useState("Semua");
  const [sector, setSector] = useState("Semua");
  const [sortBy, setSortBy] = useState("label");

  const fetchAll = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    const settled = await Promise.allSettled(ALL_STOCKS.map(fetchOne));
    setStocks(
      settled.map((r, i) =>
        r.status === "fulfilled"
          ? r.value
          : { ...ALL_STOCKS[i], price: null, change: null, error: true },
      ),
    );
    setLastUpdated(
      new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAll();
    const iv = setInterval(() => fetchAll(), 60_000);
    return () => clearInterval(iv);
  }, []);

  const filtered = stocks
    .filter((s) => indexFilter === "Semua" || s.index === indexFilter)
    .filter((s) => sector === "Semua" || s.sector === sector)
    .sort((a, b) =>
      sortBy === "change"
        ? (b.change ?? -999) - (a.change ?? -999)
        : a.label.localeCompare(b.label),
    );

  const gainers = filtered.filter((s) => (s.change ?? 0) > 0).length;
  const losers = filtered.filter((s) => (s.change ?? 0) < 0).length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 flex-shrink-0"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900">
            All Stock Highlights
          </h2>
          <p className="text-gray-400 text-xs">
            Konstituen LQ45 &amp; IDX30 · Live Cloud Link
          </p>
        </div>
        <button
          onClick={() => fetchAll(true)}
          disabled={refreshing}
          className="text-xs text-blue-500 font-semibold flex items-center gap-1 hover:underline disabled:opacity-50"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={refreshing ? "animate-spin" : ""}
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          {refreshing ? "Memperbarui..." : "Refresh"}
        </button>
      </div>

      {!loading && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <div className="flex gap-1">
            {["Semua", "IDX30", "LQ45"].map((idx) => (
              <button
                key={idx}
                onClick={() => setIndexFilter(idx)}
                className={`text-xs px-3 py-1 rounded-lg font-bold transition-colors ${indexFilter === idx ? "bg-smart-navy text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
              >
                {idx}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
              <TrendIcon up={true} /> {gainers} naik
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-lg">
              <TrendIcon up={false} /> {losers} turun
            </span>
          </div>
        </div>
      )}

      {!loading && (
        <div className="flex gap-2 mb-4 items-center flex-wrap">
          <div className="flex gap-1.5 flex-wrap flex-1">
            {SECTORS.map((s) => (
              <button
                key={s}
                onClick={() => setSector(s)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${sector === s ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
              >
                {s}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-500 bg-white outline-none"
          >
            <option value="label">A–Z</option>
            <option value="change">% Tertinggi</option>
          </select>
        </div>
      )}

      {!loading && (
        <p className="text-xs text-gray-400 mb-2">
          {lastUpdated &&
            `Diperbarui ${lastUpdated} · auto 60s · ${filtered.length} saham`}
        </p>
      )}

      {!loading && (
        <div className="grid grid-cols-3 px-3 mb-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Saham
          </span>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">
            Harga
          </span>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">
            Perubahan
          </span>
        </div>
      )}

      <div className="flex flex-col gap-1 max-h-[52vh] overflow-y-auto pr-1">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl animate-pulse"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-16" />
                <div className="h-2.5 bg-gray-100 rounded w-28" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">
            Tidak ada saham ditemukan
          </p>
        ) : (
          filtered.map((stock) => {
            const up = (stock.change ?? 0) >= 0;
            return (
              <div
                key={stock.code}
                className="grid grid-cols-3 items-center p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-gray-100"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar code={stock.label} up={!stock.error && up} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-gray-800 text-sm">
                        {stock.label}
                      </p>
                      <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-1.5 rounded">
                        {stock.index}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs truncate">
                      {stock.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {stock.price !== null ? (
                    <p className="font-semibold text-gray-800 text-sm tabular-nums">
                      Rp {stock.price.toLocaleString("id-ID")}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400">—</p>
                  )}
                </div>
                <div className="text-right">
                  {stock.error || stock.change === null ? (
                    <span className="text-xs text-gray-400 italic">Gagal</span>
                  ) : (
                    <span
                      className={`inline-flex items-center justify-end gap-0.5 text-xs font-semibold px-2 py-1 rounded-lg ${up ? "text-emerald-600 bg-emerald-50" : "text-red-500 bg-red-50"}`}
                    >
                      <TrendIcon up={up} />
                      {up ? "+" : ""}
                      {stock.change}%
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
