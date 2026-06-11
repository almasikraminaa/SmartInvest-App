// src/components/MarketChart.jsx
import { useEffect, useState, useRef, useCallback } from "react";

/* ══════════════ CONFIG ══════════════════════════════════════════════ */
const CHART_TFS = [
  { label: "1D", interval: "5m", range: "1d" },
  { label: "1M", interval: "1d", range: "1mo" },
  { label: "6M", interval: "1wk", range: "6mo" },
  { label: "YTD", interval: "1d", range: "ytd" },
  { label: "1Y", interval: "1wk", range: "1y" },
  { label: "5Y", interval: "1mo", range: "5y" },
];

const PERF_TFS = [
  { label: "1D", interval: "5m", range: "1d" },
  { label: "1W", interval: "1d", range: "5d" },
  { label: "1M", interval: "1d", range: "1mo" },
  { label: "3M", interval: "1d", range: "3mo" },
  { label: "YTD", interval: "1d", range: "ytd" },
  { label: "1Y", interval: "1wk", range: "1y" },
  { label: "5Y", interval: "1mo", range: "5y" },
];

/* ══════════════ HELPERS ═════════════════════════════════════════════ */
function safeNum(v) {
  const n = Number(v);
  return isFinite(n) && n !== 0 ? n : null;
}
function safePos(v) {
  const n = Number(v);
  return isFinite(n) && n > 0 ? n : null;
}

function fmt(v, dec = 2) {
  if (v == null) return "—";
  return Number(v).toLocaleString("id-ID", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });
}

function fmtK(v) {
  if (v == null || v === 0) return "—";
  if (v >= 1e12) return (v / 1e12).toFixed(2) + "T";
  if (v >= 1e9) return (v / 1e9).toFixed(2) + "B";
  if (v >= 1e6) return (v / 1e6).toFixed(2) + "M";
  if (v >= 1e3) return (v / 1e3).toFixed(1) + "K";
  return v.toLocaleString("id-ID");
}

function toWIB(ts) {
  const total = ((ts % 86400) + 86400) % 86400;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return `${String((h + 7) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function toLabel(ts, range) {
  const d = new Date(ts * 1000);
  if (range === "1d") return toWIB(ts);
  if (range === "5d")
    return (
      d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }) +
      " " +
      toWIB(ts)
    );
  if (["1mo", "3mo", "ytd"].includes(range))
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
  return d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
}

function filterSeries(timestamps, closes, opens, highs, lows, volumes, range) {
  if (!timestamps) return [];
  return timestamps.reduce((acc, ts, i) => {
    if (closes[i] == null || !isFinite(Number(closes[i]))) return acc;
    if (range === "1d") {
      const utcH = (((ts % 86400) + 86400) % 86400) / 3600;
      if (utcH < 2 || utcH > 9.1) return acc;
    }
    acc.push({
      ts,
      close: safeNum(closes[i]),
      open: safeNum(opens?.[i]),
      high: safeNum(highs?.[i]),
      low: safeNum(lows?.[i]),
      volume: safePos(volumes?.[i]),
      time: toLabel(ts, range),
    });
    return acc;
  }, []);
}

function getWeekNumber(dt) {
  const d = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

/* ══════════════ SUB-COMPONENTS ══════════════════════════════════════ */

function TrendIcon({ up, size = 11 }) {
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

/* ── SVG Line Chart ─────────────────────────────────────────────────── */
function LineChart({ series, loading, isPositive, range }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const svgRef = useRef(null);

  const is1D = range === "1d";
  const W = 700,
    H = 220;
  const padL = 64,
    padB = 28,
    padT = 14,
    padR = 12;
  const innerW = W - padL - padR,
    innerH = H - padT - padB;

  // ── Y axis ──
  const closes = series.map((d) => d.close).filter(Boolean);
  const rawMin = closes.length ? Math.min(...closes) : 0;
  const rawMax = closes.length ? Math.max(...closes) : 1;
  const pad5 = (rawMax - rawMin) * 0.07 || 50;
  const minC = rawMin - pad5,
    maxC = rawMax + pad5,
    rng = maxC - minC;
  const toY = (v) => padT + innerH - ((v - minC) / rng) * innerH;

  // ── X axis ──
  let tsOpen = 0,
    tsClose = 0,
    tsDomain = 1;
  if (is1D && series.length > 0) {
    const dayStart = Math.floor(series[0].ts / 86400) * 86400;
    tsOpen = dayStart + 2 * 3600;
    tsClose = dayStart + 9 * 3600;
    tsDomain = tsClose - tsOpen;
  }

  const toX = (item, idx) => {
    if (is1D) {
      const frac = Math.min(Math.max((item.ts - tsOpen) / tsDomain, 0), 1);
      return padL + frac * innerW;
    }
    return padL + (idx / Math.max(series.length - 1, 1)) * innerW;
  };

  const validSeries = series.filter((d) => d.close != null);
  const linePath = validSeries
    .map(
      (d, i) =>
        `${i === 0 ? "M" : "L"}${toX(d, i).toFixed(1)},${toY(d.close).toFixed(1)}`,
    )
    .join(" ");
  const areaPath = validSeries.length
    ? `${linePath} L${toX(validSeries.at(-1), validSeries.length - 1).toFixed(1)},${padT + innerH} L${toX(validSeries[0], 0).toFixed(1)},${padT + innerH} Z`
    : "";

  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const val = minC + (rng / 4) * i;
    return { val: Math.round(val), y: toY(val) };
  });

  let xTicks = [];
  if (is1D) {
    const fixedWIB = [
      { h: 9, m: 0, label: "09:00" },
      { h: 10, m: 30, label: "10:30" },
      { h: 12, m: 0, label: "12:00" },
      { h: 13, m: 30, label: "13:30" },
      { h: 15, m: 0, label: "15:00" },
      { h: 16, m: 0, label: "16:00" },
    ];
    const dayStart =
      series.length > 0 ? Math.floor(series[0].ts / 86400) * 86400 : 0;
    xTicks = fixedWIB.map(({ h, m, label }) => {
      const tsUTC = dayStart + (h - 7) * 3600 + m * 60;
      const frac = (tsUTC - tsOpen) / tsDomain;
      return { label, x: padL + frac * innerW };
    });
  } else {
    const step = Math.max(1, Math.floor(series.length / 5));
    xTicks = series
      .map((d, i) => i)
      .filter((i) => i % step === 0 || i === series.length - 1)
      .map((i) => ({ label: series[i]?.time ?? "", x: toX(series[i], i) }));
  }

  const lastX =
    validSeries.length > 0
      ? toX(validSeries.at(-1), validSeries.length - 1)
      : null;
  const marketEndX = padL + innerW;
  const lineColor = isPositive ? "#16a34a" : "#dc2626";

  const onMove = (e) => {
    if (!svgRef.current || !validSeries.length) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) * (W / rect.width) - padL;
    let best = 0,
      bestDist = Infinity;
    validSeries.forEach((d, i) => {
      const dist = Math.abs(toX(d, i) - (relX + padL));
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setHoverIdx(best);
  };

  if (loading)
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-xl"
        style={{ height: H }}
      >
        <div className="w-6 h-6 border-[3px] border-red-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (series.length === 0 && !loading && range === "1d") {
    return (
      <div
        className="flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm rounded-xl border border-dashed border-slate-200 p-6 text-center"
        style={{ height: H }}
      >
        <div className="bg-amber-50 text-amber-500 p-3 rounded-full mb-3 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-sm font-extrabold text-slate-800 mb-1">
          Bursa Sedang Tutup / Libur
        </p>
        <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
          Bursa Efek Indonesia (BEI) tidak aktif hari ini. Data intraday 1D akan tersedia kembali pada hari kerja berikutnya (Senin - Jumat, 09:00 - 16:00 WIB).
        </p>
      </div>
    );
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className="w-full cursor-crosshair"
      style={{ maxHeight: 240 }}
      onMouseMove={onMove}
      onMouseLeave={() => setHoverIdx(null)}
    >
      <defs>
        <linearGradient id="mcFill2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.18" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {yTicks.map((t, i) => (
        <g key={i}>
          <line
            x1={padL}
            y1={t.y}
            x2={W - padR}
            y2={t.y}
            stroke="#f1f5f9"
            strokeWidth="1"
          />
          <text
            x={padL - 6}
            y={t.y + 4}
            textAnchor="end"
            fontSize="9"
            fill="#9ca3af"
          >
            {t.val.toLocaleString("id-ID")}
          </text>
        </g>
      ))}

      {is1D && lastX != null && lastX < marketEndX && (
        <rect
          x={lastX}
          y={padT}
          width={marketEndX - lastX}
          height={innerH}
          fill="#f8fafc"
          opacity="0.8"
        />
      )}

      {is1D &&
        (() => {
          const dayStart =
            series.length > 0 ? Math.floor(series[0].ts / 86400) * 86400 : 0;
          const ts12 = dayStart + (12 - 7) * 3600;
          const x12 = padL + ((ts12 - tsOpen) / tsDomain) * innerW;
          return (
            <line
              x1={x12}
              y1={padT}
              x2={x12}
              y2={padT + innerH}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="4,3"
            />
          );
        })()}

      {xTicks.map((t, i) => (
        <text
          key={i}
          x={t.x}
          y={H - 4}
          textAnchor="middle"
          fontSize="9"
          fill="#9ca3af"
        >
          {t.label}
        </text>
      ))}

      {areaPath && <path d={areaPath} fill="url(#mcFill2)" />}
      {linePath && (
        <path
          d={linePath}
          fill="none"
          stroke={lineColor}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}

      {hoverIdx === null && validSeries.length > 0 && (
        <circle
          cx={toX(validSeries.at(-1), validSeries.length - 1)}
          cy={toY(validSeries.at(-1).close)}
          r="4"
          fill={lineColor}
          stroke="white"
          strokeWidth="2"
        />
      )}

      {/* ⚡ FIX: Perbaikan Typo !=== menjadi !== di bawah ini ⚡ */}
      {hoverIdx !== null &&
        validSeries.length > 0 &&
        (() => {
          const d = validSeries[hoverIdx];
          const x = toX(d, hoverIdx);
          const y = toY(d.close);
          const hasOHLC = d?.open != null;
          const tipW = 136,
            tipH = hasOHLC ? 78 : 44;
          const tx = Math.min(Math.max(x - tipW / 2, 2), W - tipW - 2);
          const ty = y < H - padB - 80 ? y + 14 : y - tipH - 14;
          return (
            <g>
              <line
                x1={x}
                y1={padT}
                x2={x}
                y2={H - padB}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
              <circle
                cx={x}
                cy={y}
                r="4.5"
                fill="#3b82f6"
                stroke="white"
                strokeWidth="2"
              />
              <rect
                x={tx}
                y={ty}
                width={tipW}
                height={tipH}
                rx="7"
                fill="#1e293b"
              />
              <text
                x={tx + tipW / 2}
                y={ty + 15}
                textAnchor="middle"
                fontSize="9"
                fill="#64748b"
              >
                {d?.time}
              </text>
              <text
                x={tx + tipW / 2}
                y={ty + 31}
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="white"
              >
                {fmt(d?.close, 2)}
              </text>
              {hasOHLC && (
                <>
                  <text x={tx + 8} y={ty + 48} fontSize="9" fill="#64748b">
                    O{" "}
                  </text>
                  <text x={tx + 20} y={ty + 48} fontSize="9" fill="#94a3b8">
                    {fmt(d.open, 0)}
                  </text>
                  <text x={tx + 70} y={ty + 48} fontSize="9" fill="#64748b">
                    H{" "}
                  </text>
                  <text x={tx + 82} y={ty + 48} fontSize="9" fill="#10b981">
                    {fmt(d.high, 0)}
                  </text>
                  <text x={tx + 8} y={ty + 63} fontSize="9" fill="#64748b">
                    L{" "}
                  </text>
                  <text x={tx + 20} y={ty + 63} fontSize="9" fill="#ef4444">
                    {fmt(d.low, 0)}
                  </text>
                  <text x={tx + 70} y={ty + 63} fontSize="9" fill="#64748b">
                    C{" "}
                  </text>
                  <text x={tx + 82} y={ty + 63} fontSize="9" fill="white">
                    {fmt(d.close, 0)}
                  </text>
                </>
              )}
            </g>
          );
        })()}
    </svg>
  );
}

/* ── OHLC Data Grid ─────────────────────────────────────────────────── */

function OHLCGrid({ quote, loading }) {
  const up = (quote?.pct ?? 0) >= 0;

  // Diatur ulang menjadi 2 Baris x 3 Kolom agar padat berisi
  const rows = [
    [
      { label: "Open", value: fmt(quote?.open, 2), color: "text-gray-800" },
      { label: "High", value: fmt(quote?.high, 2), color: "text-emerald-600" },
      { label: "Low", value: fmt(quote?.low, 2), color: "text-red-500" },
    ],
    [
      {
        label: "Prev Close",
        value: fmt(quote?.prev, 2),
        color: "text-amber-600",
      },
      {
        label: "Volume",
        value:
          quote?.volume != null && quote.volume > 0 ? fmtK(quote.volume) : "—",
        color: "text-gray-800",
      },
      {
        label: "Change",
        value:
          quote?.change != null
            ? `${quote.change >= 0 ? "+" : ""}${fmt(quote.change, 2)}`
            : "—",
        color: up ? "text-emerald-600" : "text-red-500",
      },
    ],
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-smart-navy">
        <h3 className="text-xs font-bold text-white tracking-wide uppercase">
          OHLC Data
        </h3>
        {!loading && quote?.pct != null && (
          <span
            className={`ml-auto text-xs font-bold flex items-center gap-1 px-2 py-0.5 rounded-lg
            ${up ? "bg-emerald-500/20 text-emerald-200" : "bg-red-400/20 text-red-200"}`}
          >
            <TrendIcon up={up} size={9} />
            {up ? "+" : ""}
            {fmt(Math.abs(quote.pct), 2)}%
          </span>
        )}
      </div>
      <div className="px-4 py-3 flex flex-col gap-0">
        {rows.map((row, ri) => (
          <div
            key={ri}
            className={`grid grid-cols-3 gap-4 py-2.5 ${ri < rows.length - 1 ? "border-b border-gray-100" : ""}`}
          >
            {row.map(({ label, value, color }) => (
              <div key={label}>
                <p className="text-[10px] text-gray-400 font-medium mb-0.5 uppercase tracking-wide">
                  {label}
                </p>
                {loading ? (
                  <div className="h-4 bg-gray-100 rounded w-16 animate-pulse" />
                ) : (
                  <p className={`text-sm font-bold tabular-nums ${color}`}>
                    {value}
                  </p>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <p className="px-4 py-2 text-[10px] text-gray-400 leading-relaxed border-t border-gray-50">
        Tabel data yang merangkum pergerakan harga pasar: harga pembukaan
        (Open), nilai tertinggi (High), terendah (Low), penutupan sebelumnya
        (Prev Close), serta nilai perubahan absolute harian (Change).
      </p>
    </div>
  );
}
/* ── Index Performance horizontal bars ──────────────────────────────── */
function IndexPerformance({ perfs, loading }) {
  const vals = perfs ? Object.values(perfs).map((v) => Math.abs(v ?? 0)) : [];
  const maxV = vals.length ? Math.max(...vals, 0.1) : 25;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-100 bg-smart-navy">
        <h3 className="text-xs font-bold text-white tracking-wide uppercase">
          Index Performance
        </h3>
      </div>
      <div className="px-4 py-3 flex flex-col gap-2">
        {PERF_TFS.map(({ label }) => {
          const val = perfs?.[label];
          const up = (val ?? 0) >= 0;
          const pct = Math.min((Math.abs(val ?? 0) / maxV) * 100, 100);
          return (
            <div key={label} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-bold w-8 flex-shrink-0">
                {label}
              </span>
              <div className="flex-1 h-3.5 bg-gray-100 rounded-full overflow-hidden">
                {loading ? (
                  <div
                    className="h-full bg-gray-200 animate-pulse rounded-full"
                    style={{ width: "33%" }}
                  />
                ) : val != null ? (
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${up ? "bg-emerald-500" : "bg-red-500"}`}
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  />
                ) : null}
              </div>
              <span
                className={`text-xs font-bold w-16 text-right tabular-nums flex-shrink-0 ${
                  loading
                    ? "text-gray-300"
                    : val == null
                      ? "text-gray-400"
                      : up
                        ? "text-emerald-600"
                        : "text-red-600"
                }`}
              >
                {loading
                  ? "…"
                  : val != null
                    ? `${up ? "+" : ""}${fmt(val, 2)}%`
                    : "—"}
              </span>
            </div>
          );
        })}
      </div>
      <p className="px-4 py-2 text-[10px] text-gray-400 leading-relaxed border-t border-gray-50">
        Grafik batang horizontal yang menunjukkan persentase naik-turunnya
        performa indeks dalam berbagai periode waktu (1D, 1W, 1M, 3M, YTD, 1Y,
        5Y). Bar merah = negatif, bar hijau = positif.
      </p>
    </div>
  );
}

/* ── Low-High Range ─────────────────────────────────────────────────── */
function LowHighRange({ ranges, currentPrice, loading }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-100 bg-smart-navy">
        <h3 className="text-xs font-bold text-white tracking-wide uppercase">
          Low – High Range
        </h3>
      </div>
      <div className="px-4 py-3 flex flex-col gap-3">
        {PERF_TFS.map(({ label }) => {
          const d = ranges?.[label];
          const pos =
            d && d.low != null && d.high != null && d.high > d.low
              ? Math.min(
                  Math.max(
                    ((currentPrice - d.low) / (d.high - d.low)) * 100,
                    0,
                  ),
                  100,
                )
              : null;
          return (
            <div key={label} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-bold w-8 flex-shrink-0">
                {label}
              </span>
              <span className="text-[10px] tabular-nums text-red-400 w-16 text-right flex-shrink-0 font-semibold">
                {loading
                  ? "…"
                  : d?.low != null
                    ? Math.round(d.low).toLocaleString("id-ID")
                    : "—"}
              </span>
              <div className="flex-1 relative" style={{ height: 14 }}>
                <div className="absolute inset-0 bg-gradient-to-r from-red-100 via-yellow-50 to-emerald-100 rounded-full" />
                {!loading && pos != null && (
                  <div
                    className="absolute top-0 transition-all duration-700"
                    style={{
                      left: `calc(${pos}% - 5px)`,
                      top: "-2px",
                      width: 0,
                      height: 0,
                      borderLeft: "5px solid transparent",
                      borderRight: "5px solid transparent",
                      borderTop: "8px solid #991b1b",
                    }}
                  />
                )}
                {loading && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full" />
                )}
              </div>
              <span className="text-[10px] tabular-nums text-emerald-500 w-16 flex-shrink-0 font-semibold">
                {loading
                  ? "…"
                  : d?.high != null
                    ? Math.round(d.high).toLocaleString("id-ID")
                    : "—"}
              </span>
            </div>
          );
        })}
      </div>
      <p className="px-4 py-2 text-[10px] text-gray-400 leading-relaxed border-t border-gray-50">
        Indikator visual posisi nilai saat ini di antara batas terendah (Low)
        dan tertinggi (High) pada berbagai rentang waktu. Panah kecil menandai
        posisi harga saat ini.
      </p>
    </div>
  );
}

/* ── Index Diary Calendar ───────────────────────────────────────────── */
function IndexDiary({ diary, loading }) {
  if (loading || !diary?.length)
    return (
      <div className="text-center py-6 text-xs text-gray-400">
        Loading Calendar Matrix...
      </div>
    );

  const monthMap = {};
  diary.forEach((d) => {
    const dt = new Date(d.date + "T00:00:00Z");
    const mon = dt.toLocaleDateString("id-ID", {
      month: "short",
      timeZone: "UTC",
    });
    const wk = getWeekNumber(dt);
    if (!monthMap[mon]) monthMap[mon] = {};
    if (!monthMap[mon][wk]) monthMap[mon][wk] = {};
    monthMap[mon][wk][dt.getUTCDay()] = d;
  });

  const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum"];

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-100 bg-smart-navy">
        <h3 className="text-xs font-bold text-white tracking-wide uppercase">
          Index Diary
        </h3>
      </div>
      <div className="p-3 overflow-x-auto">
        <table
          className="w-full border-separate"
          style={{ borderSpacing: "3px" }}
        >
          <thead>
            <tr>
              <th style={{ width: 36 }} />
              {DAYS.map((d) => (
                <th
                  key={d}
                  className="text-[10px] font-bold text-white bg-smart-navy py-1 rounded-lg text-center"
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(monthMap).map(([mon, weeks]) => {
              const sortedWks = Object.keys(weeks).sort(
                (a, b) => Number(a) - Number(b),
              );
              return sortedWks.map((wk, wi) => (
                <tr key={`${mon}-${wk}`}>
                  {wi === 0 && (
                    <td
                      rowSpan={sortedWks.length}
                      className="text-[9px] font-bold text-white bg-smart-navy rounded-lg text-center align-middle px-1"
                      style={{
                        writingMode: "vertical-rl",
                        transform: "rotate(180deg)",
                        minWidth: 24,
                      }}
                    >
                      {mon}
                    </td>
                  )}
                  {[1, 2, 3, 4, 5].map((dow) => {
                    const entry = weeks[wk]?.[dow];
                    if (!entry)
                      return (
                        <td
                          key={dow}
                          className="bg-gray-100 rounded-lg"
                          style={{ height: 26, minWidth: 26 }}
                        />
                      );
                    const up = (entry.pct ?? 0) >= 0;
                    const intensity = Math.min(Math.abs(entry.pct ?? 0) / 2, 1);
                    return (
                      <td
                        key={dow}
                        title={`${entry.date}: ${up ? "+" : ""}${fmt(entry.pct, 2)}%`}
                        className="rounded-lg text-center text-[10px] font-bold text-white cursor-default select-none"
                        style={{
                          height: 26,
                          minWidth: 26,
                          background: up
                            ? `rgba(16,185,129,${0.4 + intensity * 0.6})`
                            : `rgba(239,68,68,${0.4 + intensity * 0.6})`,
                        }}
                      >
                        {new Date(entry.date + "T00:00:00Z").getUTCDate()}
                      </td>
                    );
                  })}
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
      <p className="px-4 py-2 text-[10px] text-gray-400 leading-relaxed border-t border-gray-50">
        Kalender riwayat performa pasar berdasarkan bulan dan hari perdagangan.
        Warna hijau = kenaikan, merah = penurunan (heatmap visual).
      </p>
    </div>
  );
}

/* ══════════════ MAIN ════════════════════════════════════════════════ */
export default function MarketChart() {
  const [tf, setTf] = useState(CHART_TFS[0]);
  const [series, setSeries] = useState([]);
  const [quote, setQuote] = useState(null);
  const [dailyQuote, setDailyQuote] = useState(null);
  const [perfs, setPerfs] = useState(null);
  const [ranges, setRanges] = useState(null);
  const [diary, setDiary] = useState(null);
  const [chartLoading, setChartLoading] = useState(true);
  const [perfLoading, setPerfLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  /* ── Fetch chart + OHLC ── */
  const fetchChart = useCallback(async () => {
    setChartLoading(true);
    try {
      const res = await fetch(
        `/api/yahoo/v8/finance/chart/%5EJKSE?interval=${tf.interval}&range=${tf.range}`,
      );
      if (!res.ok) {
        const message = await res.text();
        throw new Error(
          `Yahoo proxy fetch failed: ${res.status} ${res.statusText} - ${message}`,
        );
      }
      const data = await res.json();

      const result = data?.chart?.result?.[0];
      const meta = result?.meta;
      const q = result?.indicators?.quote?.[0];
      const ts = Array.isArray(result?.timestamp) ? result.timestamp : null;

      if (!ts || ts.length === 0) {
        const errorPayload = data?.chart?.error || data;
        throw new Error(`No timestamp data: ${JSON.stringify(errorPayload)}`);
      }
      if (!q) {
        throw new Error(`No quote data returned from Yahoo API`);
      }

      const pts = filterSeries(
        ts,
        q.close,
        q.open,
        q.high,
        q.low,
        q.volume,
        tf.range,
      );
      setSeries(pts);

      const validCloses = (q.close ?? []).filter(
        (v) => v != null && isFinite(Number(v)),
      );
      const last =
        safeNum(meta?.regularMarketPrice) ?? safeNum(validCloses.at(-1));
      const prev = safeNum(meta?.previousClose) ?? safeNum(validCloses.at(-2));
      const open =
        safeNum(meta?.regularMarketOpen) ??
        safeNum((q.open ?? []).filter(Boolean)[0]);
      const high =
        safeNum(meta?.regularMarketDayHigh) ??
        Math.max(...(q.high ?? []).filter(Boolean));
      const low =
        safeNum(meta?.regularMarketDayLow) ??
        Math.min(...(q.low ?? []).filter(Boolean));
      const vol =
        safePos(meta?.regularMarketVolume) ??
        (q.volume ?? []).filter(Boolean).reduce((a, b) => a + b, 0);
      const mcap = safeNum(meta?.marketCap);
      const pct = last && prev ? ((last - prev) / prev) * 100 : null;

      setQuote({
        close: last,
        prev,
        open,
        high,
        low,
        volume: vol,
        value: null,
        freq: null,
        marketCap: mcap,
        pct,
        change: last && prev ? last - prev : null,
      });
      setIsDemo(false);
    } catch (err) {
      console.error(err);
      setIsDemo(true);
      setSeries([]);
    } finally {
      setChartLoading(false);
    }
  }, [tf]);

  /* ── Fetch perfs + ranges ── */
  const fetchPerfs = useCallback(async () => {
    setPerfLoading(true);
    try {
      const pm = {},
        rm = {};
      await Promise.all(
        PERF_TFS.map(async (r) => {
          try {
            const res = await fetch(
              `/api/yahoo/v8/finance/chart/%5EJKSE?interval=${r.interval}&range=${r.range}`,
            );
            if (!res.ok) return;
            const data = await res.json();

            const result = data?.chart?.result?.[0];
            const closes = (result?.indicators?.quote?.[0]?.close ?? []).filter(
              Boolean,
            );
            const highs = (result?.indicators?.quote?.[0]?.high ?? []).filter(
              Boolean,
            );
            const lows = (result?.indicators?.quote?.[0]?.low ?? []).filter(
              Boolean,
            );

            const last =
              safeNum(result?.meta?.regularMarketPrice) ?? closes.at(-1);
            const first = closes[0];

            pm[r.label] = last && first ? ((last - first) / first) * 100 : null;
            rm[r.label] = {
              high: highs.length ? Math.max(...highs) : null,
              low: lows.length ? Math.min(...lows) : null,
            };
          } catch (e) {
            console.error(e);
          }
        }),
      );
      setPerfs(pm);
      setRanges(rm);
    } catch (err) {
      console.error(err);
    }
    setPerfLoading(false);
  }, []);

  /* ── Fetch diary ── */
  const fetchDiary = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/yahoo/v8/finance/chart/%5EJKSE?interval=1d&range=3mo`,
      );
      if (!res.ok) {
        setDiary([]);
        return;
      }
      const data = await res.json();

      const result = data?.chart?.result?.[0];
      const ts = Array.isArray(result?.timestamp) ? result.timestamp : [];
      const closes = result?.indicators?.quote?.[0]?.close ?? [];
      const entries = [];

      for (let i = 1; i < ts.length; i++) {
        if (closes[i] == null || !isFinite(Number(closes[i]))) continue;
        const prev = closes[i - 1];
        if (!prev) continue;
        const pct = ((closes[i] - prev) / prev) * 100;
        const dt = new Date(ts[i] * 1000);
        if (dt.getUTCDay() === 0 || dt.getUTCDay() === 6) continue;
        entries.push({
          date: dt.toISOString().slice(0, 10),
          close: closes[i],
          pct,
        });
      }
      setDiary(entries);
    } catch {
      setDiary([]);
    }
  }, []);

  const fetchDailyQuote = useCallback(async () => {
    try {
      const res = await fetch(
        "/api/yahoo/v8/finance/chart/%5EJKSE?interval=5m&range=1d",
      );
      if (!res.ok) return;
      const data = await res.json();
      const result = data?.chart?.result?.[0];
      const meta = result?.meta;
      const q = result?.indicators?.quote?.[0] ?? {};

      const validCloses = (q.close ?? []).filter(
        (v) => v != null && isFinite(Number(v)),
      );
      const last =
        safeNum(meta?.regularMarketPrice) ?? safeNum(validCloses.at(-1));
      const prev = safeNum(meta?.previousClose) ?? safeNum(validCloses.at(-2));
      const open =
        safeNum(meta?.regularMarketOpen) ??
        safeNum((q.open ?? []).filter(Boolean)[0]);
      const high =
        safeNum(meta?.regularMarketDayHigh) ??
        ((q.high ?? []).filter(Boolean).length ? Math.max(...(q.high ?? []).filter(Boolean)) : null);
      const low =
        safeNum(meta?.regularMarketDayLow) ??
        ((q.low ?? []).filter(Boolean).length ? Math.min(...(q.low ?? []).filter(Boolean)) : null);
      const vol =
        safePos(meta?.regularMarketVolume) ??
        (q.volume ?? []).filter(Boolean).reduce((a, b) => a + b, 0);
      const mcap = safeNum(meta?.marketCap);
      const pct = last && prev ? ((last - prev) / prev) * 100 : null;

      setDailyQuote({
        close: last,
        prev,
        open,
        high,
        low,
        volume: vol,
        marketCap: mcap,
        pct,
        change: last && prev ? last - prev : null,
      });
    } catch (err) {
      console.error("Gagal mengambil daily quote:", err);
    }
  }, []);

  useEffect(() => {
    fetchChart();
  }, [fetchChart]);
  useEffect(() => {
    fetchDailyQuote();
  }, [fetchDailyQuote]);
  useEffect(() => {
    fetchPerfs();
  }, [fetchPerfs]);
  useEffect(() => {
    fetchDiary();
  }, [fetchDiary]);

  const displayQuote = (() => {
    const base = dailyQuote || quote;
    if (tf.label !== "1D" && series.length > 1) {
      const latest = series.at(-1)?.close;
      const first = series[0]?.close;
      if (latest != null && first != null && first !== 0) {
        const change = latest - first;
        const pct = (change / first) * 100;
        return {
          ...base,
          close: latest,
          change,
          pct,
        };
      }
    }
    return base;
  })();
  const isPositive = (displayQuote?.change ?? 0) >= 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
            IHSG — Jakarta Composite Index
          </h2>
          <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full inline-block ${isDemo ? "bg-amber-400" : "bg-emerald-400"} animate-pulse`}
            />
            {isDemo ? "⚠️ Cloud Proxy Mode" : "Yahoo Finance · Live ^JKSE"}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          {chartLoading && !displayQuote ? (
            <div className="w-24 h-6 bg-gray-100 rounded animate-pulse" />
          ) : (
            <>
              <p className="text-2xl font-extrabold text-gray-900 tabular-nums tracking-tight">
                {fmt(displayQuote?.close, 2)}
              </p>
              <p
                className={`text-sm font-semibold flex items-center justify-end gap-1 ${isPositive ? "text-emerald-600" : "text-red-500"}`}
              >
                <TrendIcon up={isPositive} />
                {isPositive ? "+" : ""}
                {fmt(displayQuote?.change, 2)}{" "}
                <span className="opacity-60 text-xs">
                  ({isPositive ? "+" : ""}
                  {fmt(displayQuote?.pct, 2)}%)
                </span>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {CHART_TFS.map((t) => (
          <button
            key={t.label}
            onClick={() => setTf(t)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${tf.label === t.label ? "bg-smart-navy text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-gray-50/50 rounded-xl p-2">
        <LineChart
          series={series}
          loading={chartLoading}
          isPositive={isPositive}
          range={tf.range}
        />
      </div>

      <p className="px-4 py-2 text-[10px] text-gray-400 leading-relaxed border-t border-gray-50">
        IHSG (Indeks Harga Saham Gabungan) adalah indeks utama Bursa Efek
        Indonesia yang mencerminkan pergerakan harga seluruh saham tercatat.
        Data di atas diperbarui secara real-time dari Yahoo Finance.
      </p>

      <OHLCGrid quote={displayQuote} loading={chartLoading || !displayQuote} />
      <IndexPerformance perfs={perfs} loading={perfLoading} />
      <LowHighRange
        ranges={ranges}
        currentPrice={displayQuote?.close}
        loading={perfLoading}
      />
      <IndexDiary diary={diary} loading={diary === null} />
    </div>
  );
}
