// src/components/TopMarketCap.jsx
// Menampilkan saham-saham top market cap dari LQ45/IDX30
// lengkap dengan Low–High intraday range bar dan data OHLC dari AllOrigins.
import { useEffect, useState } from "react";

const TOP_STOCKS = [
  {
    code: "BBCA.JK",
    label: "BBCA",
    name: "Bank Central Asia",
    sector: "Perbankan",
  },
  {
    code: "BBRI.JK",
    label: "BBRI",
    name: "Bank Rakyat Indonesia",
    sector: "Perbankan",
  },
  { code: "BMRI.JK", label: "BMRI", name: "Bank Mandiri", sector: "Perbankan" },
  { code: "TLKM.JK", label: "TLKM", name: "Telkom Indonesia", sector: "Telko" },
  {
    code: "ASII.JK",
    label: "ASII",
    name: "Astra International",
    sector: "Industri",
  },
  {
    code: "GOTO.JK",
    label: "GOTO",
    name: "GoTo Gojek Tokopedia",
    sector: "Teknologi",
  },
  {
    code: "BREN.JK",
    label: "BREN",
    name: "Barito Renewables Energy",
    sector: "Energi",
  },
  {
    code: "ADRO.JK",
    label: "ADRO",
    name: "Adaro Energy Indonesia",
    sector: "Energi",
  },
  {
    code: "BBNI.JK",
    label: "BBNI",
    name: "Bank Negara Indonesia",
    sector: "Perbankan",
  },
  {
    code: "BRIS.JK",
    label: "BRIS",
    name: "Bank Syariah Indonesia",
    sector: "Perbankan",
  },
];

function safeNum(v) {
  const n = Number(v);
  return isFinite(n) && n > 0 ? n : null;
}

function safeChange(cur, prev) {
  if (!cur || !prev) return null;
  return parseFloat((((cur - prev) / prev) * 100).toFixed(2));
}

// ⚡ PERBAIKAN: Fungsi fetch untuk menarik data OHLC lengkap via AllOrigins ⚡
async function fetchStockData(s) {
  try {
    // ⚡ FIX: Langsung masukkan parameter objek s.code ke dalam query URL proxy
    const res = await fetch(
      `/api/yahoo/v8/finance/chart/${encodeURIComponent(s.code)}?interval=5m&range=1d`,
    );
    const data = await res.json();

    const result = data?.chart?.result?.[0];
    const meta = result?.meta;
    const q = result?.indicators?.quote?.[0] ?? {};

    const closes = (q.close ?? []).filter(
      (c) => c != null && isFinite(Number(c)),
    );
    const highs = (q.high ?? []).filter(
      (v) => v != null && isFinite(Number(v)),
    );
    const lows = (q.low ?? []).filter((v) => v != null && isFinite(Number(v)));

    const cur = safeNum(meta?.regularMarketPrice) ?? safeNum(closes.at(-1));
    const prev = safeNum(meta?.previousClose);
    const high =
      safeNum(meta?.regularMarketDayHigh) ??
      (highs.length ? Math.max(...highs) : null);
    const low =
      safeNum(meta?.regularMarketDayLow) ??
      (lows.length ? Math.min(...lows) : null);
    const open = safeNum(meta?.regularMarketOpen) ?? safeNum(q.open?.[0]);

    return {
      ...s,
      price: cur,
      open,
      high,
      low,
      change: safeChange(
        cur,
        safeNum(prev) && prev !== cur ? prev : safeNum(closes.at(-2)),
      ),
      error: false,
    };
  } catch (err) {
    console.error(`Gagal mengambil data intraday Yahoo untuk ${s.label}:`, err);
    return {
      ...s,
      price: null,
      open: null,
      high: null,
      low: null,
      change: null,
      error: true,
    };
  }
}

/* ─── Low–High Range Bar ─────────────────────────────────────────── */
function RangeBar({ price, low, high }) {
  if (!low || !high || !price)
    return <div className="h-1.5 bg-gray-100 rounded-full w-full" />;
  const range = high - low;
  const pos =
    range > 0 ? Math.min(Math.max(((price - low) / range) * 100, 0), 100) : 50;
  return (
    <div className="relative w-full">
      <div className="h-1.5 bg-gradient-to-r from-red-200 via-yellow-200 to-emerald-200 rounded-full w-full" />
      <div
        className="absolute -top-0.5 w-2.5 h-2.5 bg-blue-500 border-2 border-white rounded-full shadow-sm transition-all duration-500"
        style={{ left: `calc(${pos}% - 5px)` }}
      />
    </div>
  );
}

export default function TopMarketCap() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const fetchAll = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    // ⚡ FIX: Nama fungsi pemanggilan disamakan menjadi fetchStockData ⚡
    const settled = await Promise.allSettled(TOP_STOCKS.map(fetchStockData));

    setStocks(
      settled.map((r, i) =>
        r.status === "fulfilled"
          ? r.value
          : {
              ...TOP_STOCKS[i],
              price: null,
              open: null,
              high: null,
              low: null,
              change: null,
              error: true,
            },
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
    const iv = setInterval(() => fetchAll(false), 60_000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-800">
            Top Market Cap — Low / High Range
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {loading
              ? "Memuat..."
              : `Diperbarui ${lastUpdated} · auto 60s · intraday 1D`}
          </p>
        </div>
        <button
          onClick={() => fetchAll(true)}
          disabled={refreshing}
          className="text-[10px] text-blue-500 font-semibold flex items-center gap-1 hover:underline disabled:opacity-50"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={refreshing ? "animate-spin" : ""}
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          {refreshing ? "..." : "Refresh"}
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mb-3 text-[10px] text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-300 inline-block" />
          Low
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          Harga
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-300 inline-block" />
          High
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-3 animate-pulse">
                <div className="flex justify-between mb-1.5">
                  <div className="h-3 bg-gray-100 rounded w-20" />
                  <div className="h-3 bg-gray-100 rounded w-16" />
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full w-full" />
              </div>
            ))
          : stocks.map((s) => {
              const up = (s.change ?? 0) >= 0;
              const exp = expanded === s.label;
              return (
                <div
                  key={s.label}
                  className="rounded-xl px-3 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100"
                  onClick={() => setExpanded(exp ? null : s.label)}
                >
                  {/* Row 1 */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0
                        ${s.error ? "bg-gray-100 text-gray-400" : up ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}
                      >
                        {s.label[0]}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800 leading-none">
                          {s.label}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {s.sector}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {s.price != null ? (
                        <p className="text-xs font-bold text-gray-800 tabular-nums">
                          Rp {s.price.toLocaleString("id-ID")}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400">—</p>
                      )}
                      {s.change != null && (
                        <p
                          className={`text-[10px] font-semibold ${up ? "text-emerald-600" : "text-red-500"}`}
                        >
                          {up ? "+" : ""}
                          {s.change}%
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Range Bar */}
                  <RangeBar price={s.price} low={s.low} high={s.high} />

                  {/* Low / High labels */}
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-red-400 tabular-nums">
                      {s.low != null
                        ? `L: ${s.low.toLocaleString("id-ID")}`
                        : "L: —"}
                    </span>
                    <span className="text-[9px] text-emerald-500 tabular-nums">
                      {s.high != null
                        ? `H: ${s.high.toLocaleString("id-ID")}`
                        : "H: —"}
                    </span>
                  </div>

                  {/* Expanded OHLC detail */}
                  {exp && (
                    <div className="mt-2 pt-2 border-t border-gray-100 grid grid-cols-4 gap-1">
                      {[
                        { label: "Open", value: s.open, cls: "text-gray-600" },
                        {
                          label: "High",
                          value: s.high,
                          cls: "text-emerald-600",
                        },
                        { label: "Low", value: s.low, cls: "text-red-500" },
                        {
                          label: "Close",
                          value: s.price,
                          cls: "text-blue-600",
                        },
                      ].map(({ label, value, cls }) => (
                        <div key={label} className="flex flex-col items-center">
                          <span className="text-[9px] text-gray-400 uppercase font-semibold">
                            {label}
                          </span>
                          <span
                            className={`text-[10px] font-bold tabular-nums ${cls}`}
                          >
                            {value != null
                              ? value.toLocaleString("id-ID")
                              : "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
      </div>
      <p className="px-4 py-2 text-[10px] text-gray-400 leading-relaxed border-t border-gray-50">Daftar emiten saham unggulan dengan harga saat ini dan persentase perubahan. Garis indikator (merah-hijau) dengan titik biru memvisualisasikan posisi harga di antara titik terendah (L) dan tertingginya (H).</p>
    </div>
  );
}