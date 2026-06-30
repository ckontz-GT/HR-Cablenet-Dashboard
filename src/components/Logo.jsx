// Cablenet mark — a "signal / fibre" glyph rendered from ascending arcs,
// echoing a telecom signal. Wordmark set lowercase in the display face, the
// way Cablenet sets its own logotype.
export function Logo({ size = 28, withWordmark = true, light = false }) {
  const wordColor = light ? '#ffffff' : 'var(--color-brand-700)'
  return (
    <div className="flex items-center gap-2.5 select-none">
      <SignalMark size={size} />
      {withWordmark && (
        <span
          className="font-display font-700 tracking-tight"
          style={{ fontSize: size * 0.62, color: wordColor, lineHeight: 1 }}
        >
          cablenet
          <span style={{ color: 'var(--color-flare-500)' }}>.</span>
        </span>
      )}
    </div>
  )
}

export function SignalMark({ size = 28 }) {
  const id = 'cm' + size
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="32" x2="32" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5b2d8e" />
          <stop offset="0.6" stopColor="#7c3aed" />
          <stop offset="1" stopColor="#c026d3" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${id})`} />
      {/* origin node */}
      <circle cx="9" cy="23" r="2.6" fill="#fff" />
      {/* signal arcs */}
      <path d="M9 18.5 A 6 6 0 0 1 15 23" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity="0.95" />
      <path d="M9 13.5 A 11 11 0 0 1 20 23" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />
      <path d="M9 8.5 A 16 16 0 0 1 25 23" stroke="#ffb066" strokeWidth="2.4" strokeLinecap="round" opacity="0.95" />
    </svg>
  )
}
