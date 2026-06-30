// Cablenet logo — recreated as vector to match the real brand mark:
// three slanted parallel bars ("///") followed by the lowercase "cablenet"
// wordmark, all in Cablenet purple. The wordmark is set in the display face
// (Sora) as a close approximation of Cablenet's custom rounded geometric type.

// The three-slash brand mark, on its own.
export function Slashes({ height = 22, color }) {
  const c = color ?? 'var(--color-brand-700)'
  return (
    <svg height={height} viewBox="0 0 60 32" fill="none" aria-hidden="true" style={{ display: 'block' }}>
      <g stroke={c} strokeWidth="7.5">
        <line x1="6" y1="30" x2="18" y2="2" />
        <line x1="19" y1="30" x2="31" y2="2" />
        <line x1="32" y1="30" x2="44" y2="2" />
      </g>
    </svg>
  )
}

export function Logo({ size = 28, withWordmark = true, light = false }) {
  const color = light ? '#ffffff' : 'var(--color-brand-700)'
  return (
    <div className="flex items-center gap-2.5 select-none">
      <Slashes height={size * 0.74} color={color} />
      {withWordmark && (
        <span
          className="font-display font-700 lowercase"
          style={{ fontSize: size * 0.66, color, lineHeight: 1, letterSpacing: '-0.02em' }}
        >
          cablenet
        </span>
      )}
    </div>
  )
}

// Contained badge variant (rounded square with white slashes) — used where the
// brand needs a compact, self-contained icon, e.g. the assistant avatar.
export function SignalMark({ size = 28 }) {
  const id = 'cm' + size
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="32" x2="32" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5b2d8e" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${id})`} />
      <g stroke="#fff" strokeWidth="3.4">
        <line x1="9" y1="22" x2="15" y2="10" />
        <line x1="14" y1="22" x2="20" y2="10" />
        <line x1="19" y1="22" x2="25" y2="10" />
      </g>
    </svg>
  )
}
