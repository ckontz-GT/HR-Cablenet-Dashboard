import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Sparkline } from './charts'
import { clsx } from '../lib/clsx'

// Regular KPI tile
export function StatCard({ label, value, suffix, delta, deltaLabel, icon: Icon, spark, tone = 'brand', className }) {
  const up = delta != null && delta >= 0
  return (
    <div className={clsx('rounded-[var(--radius-card)] bg-white border border-ink-200/70 card-shadow p-5 flex flex-col gap-3', className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className={clsx('grid place-items-center size-9 rounded-xl shrink-0',
              tone === 'flare' ? 'bg-flare-500/10 text-flare-600' : tone === 'good' ? 'bg-good-50 text-good-700' : tone === 'warn' ? 'bg-warn-50 text-warn-700' : 'bg-brand-50 text-brand-700')}>
              <Icon size={18} strokeWidth={2.2} />
            </span>
          )}
          <span className="text-[13px] font-500 text-ink-500">{label}</span>
        </div>
        {delta != null && (
          <span className={clsx('inline-flex items-center gap-0.5 text-[12px] font-600 tnum', up ? 'text-good-700' : 'text-crit-500')}>
            {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{Math.abs(delta)}{deltaLabel}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-3">
        <p className="font-display font-700 text-ink-900 text-[30px] leading-none tnum">
          {value}{suffix && <span className="text-[18px] text-ink-400 font-600 ml-0.5">{suffix}</span>}
        </p>
        {spark && <Sparkline values={spark} stroke="#7c3aed" width={88} height={34} />}
      </div>
    </div>
  )
}

// Hero KPI on the signal gradient
export function HeroStat({ label, value, suffix, sub, spark }) {
  return (
    <div className="relative rounded-[var(--radius-card)] overflow-hidden bg-signal bg-signal-animated text-white p-5 flex flex-col justify-between min-h-[148px]">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-500 text-white/75">{label}</span>
      </div>
      <div>
        <p className="font-display font-700 text-[38px] leading-none tnum">
          {value}{suffix && <span className="text-[20px] text-white/70 font-600 ml-0.5">{suffix}</span>}
        </p>
        {sub && <p className="text-[13px] text-white/70 mt-1.5">{sub}</p>}
      </div>
      {spark && <div className="absolute right-4 bottom-4 opacity-90"><Sparkline values={spark} stroke="#ffb066" width={104} height={40} fillOpacity={0.3} /></div>}
    </div>
  )
}
