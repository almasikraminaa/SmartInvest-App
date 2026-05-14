// src/components/MarketChart.jsx
import { useEffect, useState, useRef } from "react";

const TIMEFRAMES = [
  { label: "1D", interval: "5m", range: "1d" },
  { label: "5D", interval: "15m", range: "5d" },
  { label: "1M", interval: "1d", range: "1mo" },
  { label: "3M", interval: "1d", range: "3mo" },
  { label: "6M", interval: "1wk", range: "6mo" },
  { label: "1Y", interval: "1wk", range: "1y" },
];

const DUMMY_QUOTE = { close: 7245.5, change: 45.2, percent_change: 0.63 };

const DUMMY_SERIES = Array.from({ length: 30 }, (_, i) => ({
  close: 7100 + Math.sin(i / 2.5) * 60 + i * 8,
  time: `${String(
    Math.min(9 + Math.floor(i * 0.3), 16),
  ).padStart(2, "0")}:00`,
}));

function safeNum(v) {
  const n = Number(v);
  return isFinite(n) ? n : null;
}

function toWIB(unixSec) {
  const d = new Date(unixSec * 1000);

  let h = (d.getUTCHours() + 7) % 24;
  let m = d.getUTCMinutes();

  // Batasi jam market maksimal sampai 16:00 WIB
  if (h > 16 || (h === 16 && m > 0)) {
    h = 16;
    m = 0;
  }

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function toDateLabel(unixSec, range) {
  const d = new Date(unixSec * 1000);

  if (range === "1d") {
    return toWIB(unixSec);
  }

  if (range === "5d") {
    const time = toWIB(unixSec);

    const day = d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    });

    return `${day} ${time}`;
  }

  if (range === "1mo" || range === "3mo") {
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    });
  }

  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

function TrendIcon({ up, size = 12 }) {
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

function ChartTooltip({ x, y, label, value, W, H, padT, padB }) {
  const tipW = 112;
  const tipH = 44;

  const tx = Math.min(Math.max(x - tipW / 2, 4), W - tipW - 4);

  const ty = y < H - padB - 60 ? y + 14 : y - tipH - 14;

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
        r="5"
        fill="#3b82f6"
        stroke="white"
        strokeWidth="2"
      />

      <rect
        x={tx}
        y={ty}
        width={tipW}
        height={tipH}
        rx="6"
        fill="#1e293b"
      />

      <text
        x={tx + tipW / 2}
        y={ty + 15}
        textAnchor="middle"
        fontSize="10"
        fill="#94a3b8"
      >
        {label}
      </text>

      <text
        x={tx + tipW / 2}
        y={ty + 32}
        textAnchor="middle"
        fontSize="12"
        fontWeight="600"
        fill="white"
      >
        {Number(value).toLocaleString("id-ID", {
          minimumFractionDigits: 2,
        })}
      </text>
    </g>
  );
}

export default function MarketChart() {
  const [quote, setQuote] = useState(null);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [tf, setTf] = useState(TIMEFRAMES[2]);
  const [hoverIdx, setHoverIdx] = useState(null);

  const svgRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setHoverIdx(null);

    const fetchIHSG = async () => {
      try {
        const res = await fetch(
          `/yahoo/v8/finance/chart/%5EJKSE?interval=${tf.interval}&range=${tf.range}`,
        );

        const data = await res.json();

        const result = data.chart.result[0];
        const meta = result.meta;

        const closes = result.indicators.quote[0].close;
        const ts = result.timestamp;

        const validCloses = closes.filter(
          (c) => c !== null && isFinite(Number(c)),
        );

        const last =
          safeNum(meta?.regularMarketPrice) ?? safeNum(validCloses.at(-1));

        const prev =
          safeNum(meta?.previousClose) ?? safeNum(validCloses.at(-2));

        setQuote({
          close: last ?? 0,
          change: last && prev ? last - prev : 0,
          percent_change:
            last && prev ? ((last - prev) / prev) * 100 : 0,
        });

        setSeries(
          closes
            .map((c, i) => ({
              close: safeNum(c),
              time: toDateLabel(ts[i], tf.range),
            }))
            .filter((d) => d.close !== null),
        );

        setIsDemo(false);
      } catch {
        setQuote(DUMMY_QUOTE);
        setSeries(DUMMY_SERIES);
        setIsDemo(true);
      } finally {
        setLoading(false);
      }
    };

    fetchIHSG();

    const interval = setInterval(fetchIHSG, 60_000);

    return () => clearInterval(interval);
  }, [tf]);

  const closes = series.map((d) => d.close).filter(Boolean);

  const rawMin = closes.length ? Math.min(...closes) : 0;
  const rawMax = closes.length ? Math.max(...closes) : 1;

  const pad5 = (rawMax - rawMin) * 0.05 || 1;

  const minC = rawMin - pad5;
  const maxC = rawMax + pad5;

  const range = maxC - minC;

  const W = 520;
  const H = 240;

  const padL = 68;
  const padB = 32;
  const padT = 16;
  const padR = 16;

  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const toX = (i) =>
    padL + (i / Math.max(closes.length - 1, 1)) * innerW;

  const toY = (v) =>
    padT + innerH - ((v - minC) / range) * innerH;

  const linePath = closes
    .map(
      (v, i) =>
        `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`,
    )
    .join(" ");

  const areaPath = closes.length
    ? `${linePath} 
       L${toX(closes.length - 1).toFixed(1)},${padT + innerH} 
       L${toX(0).toFixed(1)},${padT + innerH} Z`
    : "";

  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const val = minC + (range / 4) * i;

    return {
      val: Math.round(val),
      y: toY(val),
    };
  });

  const step = Math.max(1, Math.floor(closes.length / 6));

  const xTicks = closes
    .map((_, i) => i)
    .filter((i) => i % step === 0 || i === closes.length - 1)
    .map((i) => ({
      label: series[i]?.time ?? "",
      x: toX(i),
    }));

  const isPositive = (quote?.change ?? 0) >= 0;

  const lineColor = isPositive ? "#059669" : "#dc2626";

  const handleMouseMove = (e) => {
    if (!svgRef.current || !closes.length) return;

    const rect = svgRef.current.getBoundingClientRect();

    const scaleX = W / rect.width;

    const relX = (e.clientX - rect.left) * scaleX - padL;

    const idx = Math.round(
      (relX / innerW) * (closes.length - 1),
    );

    setHoverIdx(
      Math.max(0, Math.min(closes.length - 1, idx)),
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h2 className="text-base font-bold text-gray-800">
            IHSG — Jakarta Composite Index
          </h2>

          <p className="text-gray-400 text-xs mt-0.5">
            {isDemo
              ? "⚠️ Demo data"
              : "Sumber: Yahoo Finance · ^JKSE"}
          </p>
        </div>

        <div className="text-right">
          {loading ? (
            <div className="w-24 h-7 bg-gray-100 rounded animate-pulse ml-auto mb-1" />
          ) : (
            <>
              <p className="text-2xl font-extrabold text-gray-900 tabular-nums">
                {(quote?.close ?? 0).toLocaleString("id-ID", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>

              <p
                className={`text-sm font-semibold flex items-center justify-end gap-1 ${
                  isPositive
                    ? "text-emerald-600"
                    : "text-red-500"
                }`}
              >
                <TrendIcon up={isPositive} />

                {isPositive ? "+" : ""}
                {(quote?.change ?? 0).toFixed(2)}

                <span className="opacity-70">
                  ({(quote?.percent_change ?? 0).toFixed(2)}%)
                </span>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Timeframe */}
      <div className="flex gap-1 mb-3">
        {TIMEFRAMES.map((t) => (
          <button
            key={t.label}
            onClick={() => setTf(t)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              tf.label === t.label
                ? "bg-smart-navy text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[200px]">
          <div className="w-7 h-7 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full cursor-crosshair flex-1"
          style={{ height: 220 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIdx(null)}
        >
          <defs>
            <linearGradient
              id="ihsgFill"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={lineColor}
                stopOpacity="0.18"
              />

              <stop
                offset="100%"
                stopColor={lineColor}
                stopOpacity="0.01"
              />
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
                fontSize="10"
                fill="#9ca3af"
              >
                {t.val.toLocaleString("id-ID")}
              </text>
            </g>
          ))}

          {xTicks.map((t, i) => (
            <text
              key={i}
              x={t.x}
              y={H - 6}
              textAnchor="middle"
              fontSize="10"
              fill="#9ca3af"
            >
              {t.label}
            </text>
          ))}

          {areaPath && (
            <path d={areaPath} fill="url(#ihsgFill)" />
          )}

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

          {hoverIdx === null && closes.length > 0 && (
            <circle
              cx={toX(closes.length - 1)}
              cy={toY(closes.at(-1))}
              r="4.5"
              fill={lineColor}
              stroke="white"
              strokeWidth="2"
            />
          )}

          {hoverIdx !== null && closes.length > 0 && (
            <ChartTooltip
              x={toX(hoverIdx)}
              y={toY(closes[hoverIdx])}
              label={series[hoverIdx]?.time ?? ""}
              value={closes[hoverIdx]}
              W={W}
              H={H}
              padT={padT}
              padB={padB}
            />
          )}
        </svg>
      )}
    </div>
  );
}