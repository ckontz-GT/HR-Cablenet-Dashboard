import { useId } from 'react'

// Smooth-ish path via Catmull-Rom → cubic bezier
function smoothPath(pts) {
  if (pts.length < 2) return ''
  let d = `M ${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`
  }
  return d
}

// --- Area / line chart with gradient fill + emphasized endpoint --------------
export function AreaChart({ data, valueKey = 'headcount', height = 220, stroke = '#7c3aed', fill = '#7c3aed' }) {
  const gid = useId().replace(/:/g, '')
  const w = 640
  const h = height
  const padX = 18, padTop = 18, padBottom = 30
  const vals = data.map((d) => d[valueKey])
  const max = Math.max(...vals) * 1.08
  const min = Math.min(...vals) * 0.9
  const x = (i) => padX + (i * (w - padX * 2)) / (data.length - 1)
  const y = (v) => padTop + (1 - (v - min) / (max - min)) * (h - padTop - padBottom)
  const pts = data.map((d, i) => [x(i), y(d[valueKey])])
  const line = smoothPath(pts)
  const area = `${line} L ${pts[pts.length - 1][0]},${h - padBottom} L ${pts[0][0]},${h - padBottom} Z`
  const last = pts[pts.length - 1]
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }} role="img" aria-label="Trend chart">
      <defs>
        <linearGradient id={`area${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={fill} stopOpacity="0.28" />
          <stop offset="1" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((t) => (
        <line key={t} x1={padX} x2={w - padX} y1={padTop + t * (h - padTop - padBottom)} y2={padTop + t * (h - padTop - padBottom)} stroke="#e4dfec" strokeWidth="1" strokeDasharray="2 4" />
      ))}
      <path d={area} fill={`url(#area${gid})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      {data.map((d, i) => (
        <text key={i} x={x(i)} y={h - 10} textAnchor="middle" className="fill-ink-400" style={{ fontSize: 11 }}>{d.label}</text>
      ))}
      <circle cx={last[0]} cy={last[1]} r="6" fill={stroke} />
      <circle cx={last[0]} cy={last[1]} r="6" fill="none" stroke="#fff" strokeWidth="2.5" />
    </svg>
  )
}

// --- Grouped/overlay bars (hires vs exits) -----------------------------------
export function BarPairs({ data, height = 200 }) {
  const w = 640, h = height, padX = 18, padTop = 14, padBottom = 28
  const max = Math.max(...data.map((d) => Math.max(d.hires, d.exits))) * 1.2 || 1
  const band = (w - padX * 2) / data.length
  const bw = Math.min(16, band * 0.28)
  const y = (v) => padTop + (1 - v / max) * (h - padTop - padBottom)
  const base = h - padBottom
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }} role="img" aria-label="Hires vs exits">
      {data.map((d, i) => {
        const cx = padX + band * i + band / 2
        return (
          <g key={i}>
            <rect x={cx - bw - 2} y={y(d.hires)} width={bw} height={base - y(d.hires)} rx="3" fill="#7c3aed" />
            <rect x={cx + 2} y={y(d.exits)} width={bw} height={base - y(d.exits)} rx="3" fill="#e4dfec" />
            <text x={cx} y={h - 9} textAnchor="middle" className="fill-ink-400" style={{ fontSize: 11 }}>{d.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

// --- Horizontal bars ----------------------------------------------------------
export function HBars({ data, valueKey = 'count', labelKey = 'name', colorFn }) {
  const max = Math.max(...data.map((d) => d[valueKey])) || 1
  return (
    <div className="flex flex-col gap-2.5">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-[13px] text-ink-600 truncate text-right">{d[labelKey]}</span>
          <div className="flex-1 h-7 rounded-lg bg-ink-100/70 overflow-hidden relative">
            <div
              className="h-full rounded-lg transition-[width] duration-700 flex items-center justify-end pr-2"
              style={{ width: `${(d[valueKey] / max) * 100}%`, background: colorFn ? colorFn(d) : `linear-gradient(90deg, hsl(${d.hue ?? 265} 60% 58%), hsl(${(d.hue ?? 265) + 30} 62% 48%))` }}
            >
              <span className="text-[11px] font-600 text-white tnum">{d[valueKey]}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// --- Donut / ring -------------------------------------------------------------
export function Donut({ segments, size = 150, thickness = 18, center }) {
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  let offset = 0
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef0f4" strokeWidth={thickness} />
        {segments.map((s, i) => {
          const len = (s.value / total) * c
          const el = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={thickness}
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} strokeLinecap="round" />
          )
          offset += len
          return el
        })}
      </svg>
      {center && <div className="absolute inset-0 grid place-items-center text-center">{center}</div>}
    </div>
  )
}

// --- Funnel -------------------------------------------------------------------
export function Funnel({ data }) {
  const max = Math.max(...data.map((d) => d.count)) || 1
  const colors = ['#cfc8db', '#9466d0', '#7c3aed', '#ff944d', '#15b79e']
  return (
    <div className="flex flex-col gap-1.5">
      {data.map((d, i) => (
        <div key={d.stage} className="flex items-center gap-3">
          <span className="w-20 shrink-0 text-[13px] text-ink-600">{d.stage}</span>
          <div className="flex-1">
            <div className="h-9 rounded-lg flex items-center px-3 text-white text-[13px] font-600 transition-[width] duration-700 tnum"
              style={{ width: `${Math.max(14, (d.count / max) * 100)}%`, background: colors[i] }}>
              {d.count}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// --- Sparkline ----------------------------------------------------------------
export function Sparkline({ values, stroke = '#fff', width = 96, height = 32, fillOpacity = 0.25 }) {
  const gid = useId().replace(/:/g, '')
  const max = Math.max(...values), min = Math.min(...values)
  const x = (i) => (i * width) / (values.length - 1)
  const y = (v) => height - 3 - ((v - min) / (max - min || 1)) * (height - 6)
  const pts = values.map((v, i) => [x(i), y(v)])
  const line = smoothPath(pts)
  const area = `${line} L ${width},${height} L 0,${height} Z`
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`sp${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={stroke} stopOpacity={fillOpacity} />
          <stop offset="1" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sp${gid})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
