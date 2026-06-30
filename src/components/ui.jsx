import { clsx } from '../lib/clsx'

// --- Card ---------------------------------------------------------------------
export function Card({ className, children, as: Tag = 'div', ...rest }) {
  return (
    <Tag
      className={clsx('rounded-[var(--radius-card)] bg-white border border-ink-200/70 card-shadow', className)}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export function CardHeader({ title, subtitle, action, icon: Icon, className }) {
  return (
    <div className={clsx('flex items-start justify-between gap-4 px-5 pt-5', className)}>
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <span className="grid place-items-center size-9 rounded-xl bg-brand-50 text-brand-700 shrink-0">
            <Icon size={18} strokeWidth={2.2} />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="font-display font-600 text-ink-900 text-[15px] leading-tight text-balance">{title}</h3>
          {subtitle && <p className="text-[13px] text-ink-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

// --- Pill / status chips ------------------------------------------------------
const TONES = {
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  good: 'bg-good-50 text-good-700 ring-good-500/30',
  warn: 'bg-warn-50 text-warn-700 ring-warn-500/30',
  crit: 'bg-crit-50 text-crit-700 ring-crit-500/30',
  info: 'bg-info-50 text-info-500 ring-info-500/30',
  flare: 'bg-flare-500/10 text-flare-600 ring-flare-500/30',
  neutral: 'bg-ink-100 text-ink-600 ring-ink-200',
}
export function Pill({ tone = 'neutral', children, dot = false, className }) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-500 ring-1 ring-inset', TONES[tone], className)}>
      {dot && <span className={clsx('size-1.5 rounded-full', {
        brand: 'bg-brand-500', good: 'bg-good-500', warn: 'bg-warn-500', crit: 'bg-crit-500', info: 'bg-info-500', flare: 'bg-flare-500', neutral: 'bg-ink-400',
      }[tone])} />}
      {children}
    </span>
  )
}

export const STATUS_TONE = { Active: 'good', 'On leave': 'warn', Onboarding: 'info', Open: 'good', Closed: 'neutral', Pending: 'warn', Approved: 'good', Rejected: 'crit' }
export const STAGE_TONE = { Applied: 'neutral', Screening: 'info', Interview: 'brand', Offer: 'flare', Hired: 'good' }
export const PRIORITY_TONE = { High: 'crit', Medium: 'warn', Low: 'neutral' }

// --- Avatar -------------------------------------------------------------------
export function Avatar({ name, initials, hue = 265, size = 36, className }) {
  return (
    <span
      className={clsx('inline-grid place-items-center rounded-full font-600 text-white shrink-0 ring-2 ring-white', className)}
      style={{
        width: size, height: size, fontSize: size * 0.36,
        background: `linear-gradient(135deg, hsl(${hue} 55% 52%), hsl(${(hue + 38) % 360} 60% 42%))`,
      }}
      title={name}
      aria-label={name}
    >
      {initials}
    </span>
  )
}

// --- Buttons ------------------------------------------------------------------
export function Button({ variant = 'primary', size = 'md', className, children, icon: Icon, ...rest }) {
  const base = 'inline-flex items-center justify-center gap-2 font-500 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap'
  const sizes = { sm: 'text-[13px] px-3 h-9', md: 'text-sm px-4 h-10', lg: 'text-sm px-5 h-12' }
  const variants = {
    primary: 'text-white accent-gradient shadow-[0_6px_16px_-6px_rgba(124,58,237,0.7)] hover:brightness-110',
    flare: 'text-white bg-flare-500 hover:bg-flare-600 shadow-[0_6px_16px_-6px_rgba(255,122,26,0.7)]',
    secondary: 'bg-white text-ink-700 border border-ink-200 hover:border-ink-300 hover:bg-ink-50',
    ghost: 'text-ink-600 hover:bg-ink-100',
    dark: 'bg-ink-900 text-white hover:bg-ink-800',
  }
  return (
    <button className={clsx(base, sizes[size], variants[variant], className)} {...rest}>
      {Icon && <Icon size={size === 'sm' ? 15 : 17} strokeWidth={2.2} />}
      {children}
    </button>
  )
}

export function IconButton({ icon: Icon, label, className, ...rest }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={clsx('grid place-items-center size-10 rounded-xl text-ink-500 hover:text-ink-800 hover:bg-ink-100 transition-colors', className)}
      {...rest}
    >
      <Icon size={19} strokeWidth={2} />
    </button>
  )
}

// --- Progress -----------------------------------------------------------------
export function Progress({ value, tone = 'brand', className }) {
  const bar = { brand: 'accent-gradient', good: 'bg-good-500', warn: 'bg-warn-500', flare: 'bg-flare-500' }[tone]
  return (
    <div className={clsx('h-2 rounded-full bg-ink-100 overflow-hidden', className)}>
      <div className={clsx('h-full rounded-full transition-[width] duration-700', bar)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

// --- Empty / section label ----------------------------------------------------
export function Eyebrow({ children, className }) {
  return <p className={clsx('text-[11px] font-600 uppercase tracking-[0.14em] text-ink-400', className)}>{children}</p>
}

export function Stars({ value, max = 5 }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} of ${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < value ? 'text-flare-500' : 'text-ink-200'}>★</span>
      ))}
    </span>
  )
}
