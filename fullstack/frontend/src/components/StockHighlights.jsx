// src/components/StockHighlights.jsx
import { useEffect, useState } from "react";

const LQ45 = [
  { code: "BBCA.JK", label: "BBCA", name: "Bank Central Asia" },
  { code: "BBRI.JK", label: "BBRI", name: "Bank Rakyat Indonesia" },
  { code: "BMRI.JK", label: "BMRI", name: "Bank Mandiri" },
  { code: "BBNI.JK", label: "BBNI", name: "Bank Negara Indonesia" },
  { code: "TLKM.JK", label: "TLKM", name: "Telkom Indonesia" },
  { code: "ASII.JK", label: "ASII", name: "Astra International" },
  { code: "UNVR.JK", label: "UNVR", name: "Unilever Indonesia" },
  { code: "ICBP.JK", label: "ICBP", name: "Indofood CBP" },
  { code: "KLBF.JK", label: "KLBF", name: "Kalbe Farma" },
  { code: "ADRO.JK", label: "ADRO", name: "Adaro Energy" },
];

const IDX30 = [
  { code: "BBCA.JK", label: "BBCA", name: "Bank Central Asia" },
  { code: "BBRI.JK", label: "BBRI", name: "Bank Rakyat Indonesia" },
  { code: "BMRI.JK", label: "BMRI", name: "Bank Mandiri" },
  { code: "TLKM.JK", label: "TLKM", name: "Telkom Indonesia" },
  { code: "ASII.JK", label: "ASII", name: "Astra International" },
  { code: "GOTO.JK", label: "GOTO", name: "GoTo Gojek Tokopedia" },
  { code: "BRIS.JK", label: "BRIS", name: "Bank Syariah Indonesia" },
  { code: "PGAS.JK", label: "PGAS", name: "Perusahaan Gas Negara" },
  { code: "ANTM.JK", label: "ANTM", name: "Aneka Tambang" },
  { code: "MDKA.JK", label: "MDKA", name: "Merdeka Copper Gold" },
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
    const res = await fetch(
      `/api/yahoo/v8/finance/chart/${s.code}?interval=1d&range=5d`,
    );
    const data = await res.json();

    const meta = data?.chart?.result?.[0]?.meta;
    const quotes = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? [];
    const valid = quotes.filter((c) => c !== null && isFinite(Number(c)));
    const cur = safeNum(meta?.regularMarketPrice) ?? safeNum(valid.at(-1));
    const mp = safeNum(meta?.previousClose);
    const prev = mp && mp !== cur ? mp : safeNum(valid.at(-2));

    return {
      label: s.label,
      name: s.name,
      price: cur,
      change: safeChange(cur, prev),
      error: false,
    };
  } catch (err) {
    console.error(`Gagal mengambil data Yahoo untuk ${s.label}:`, err);
    return {
      label: s.label,
      name: s.name,
      price: null,
      change: null,
      error: true,
    };
  }
}

export default function StockHighlights({ onViewAll }) {
  const [index, setIndex] = useState("IDX30");
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    setLoading(true);
    const list = index === "LQ45" ? LQ45 : IDX30;

    const fetchAll = async () => {
      const settled = await Promise.allSettled(list.map(fetchOne));
      setStocks(
        settled.map((r, i) =>
          r.status === "fulfilled"
            ? r.value
            : {
                label: list[i].label,
                name: list[i].name,
                price: null,
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
    };

    fetchAll();
    const interval = setInterval(fetchAll, 60_000);
    return () => clearInterval(interval);
  }, [index]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <div className="flex gap-1">
          {["IDX30", "LQ45"].map((idx) => (
            <button
              key={idx}
              onClick={() => setIndex(idx)}
              className={`text-xs px-3 py-1 rounded-lg font-bold transition-colors ${
                index === idx
                  ? "bg-smart-navy text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {idx}
            </button>
          ))}
        </div>
        <button
          onClick={onViewAll}
          className="text-xs text-blue-500 font-semibold hover:underline"
        >
          View All
        </button>
      </div>
      <p className="text-xs text-gray-400 mb-3">
        {loading ? "Memuat..." : `Diperbarui ${lastUpdated} · auto 60s`}
      </p>

      <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-100 rounded w-16" />
                  <div className="h-2.5 bg-gray-100 rounded w-28" />
                </div>
                <div className="space-y-1.5 text-right">
                  <div className="h-3 bg-gray-100 rounded w-16" />
                  <div className="h-2.5 bg-gray-100 rounded w-10 ml-auto" />
                </div>
              </div>
            ))
          : stocks.map((stock) => {
              const up = (stock.change ?? 0) >= 0;
              return (
                <div key={stock.label} className="flex items-center gap-3">
                  <Avatar code={stock.label} up={!stock.error && up} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm">
                      {stock.label}
                    </p>
                    <p className="text-gray-400 text-xs truncate">
                      {stock.name}
                    </p>
                  </div>
                  <div className="text-right">
                    {stock.error || stock.price === null ? (
                      <p className="text-xs text-gray-400 italic">—</p>
                    ) : (
                      <>
                        <p className="font-semibold text-gray-800 text-sm tabular-nums">
                          Rp {stock.price.toLocaleString("id-ID")}
                        </p>
                        <p
                          className={`text-xs font-semibold flex items-center justify-end gap-0.5 ${up ? "text-emerald-600" : "text-red-500"}`}
                        >
                          <TrendIcon up={up} />
                          {up ? "+" : ""}
                          {stock.change ?? 0}%
                        </p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
      </div>
      <p className="px-1 py-2 text-[10px] text-gray-400 leading-relaxed border-t border-gray-50 mt-2">Daftar saham pilihan dari indeks LQ45/IDX30 yang menampilkan harga terkini dan persentase perubahan harian. Klik "View All" untuk melihat seluruh emiten.</p>
    </div>
  );
}