import { Link } from 'react-router-dom'
import { BellRing, ShieldAlert, FileClock, Hourglass, PartyPopper, CheckCircle2, ChevronRight } from 'lucide-react'
import { Card, CardHeader, Pill, Avatar } from './ui'
import { NEEDS_ATTENTION } from '../data/mockData'

const KIND_ICON = { certification: ShieldAlert, contract: FileClock, probation: Hourglass, anniversary: PartyPopper }
const KIND_LABEL = { certification: 'Certification', contract: 'Contract', probation: 'Probation', anniversary: 'Anniversary' }

// Org-wide feed: certification expiries, contract renewals, probation endings
// and upcoming work anniversaries, sorted most-urgent first.
export function NeedsAttention({ limit = 8 }) {
  const items = NEEDS_ATTENTION.slice(0, limit)
  const overdue = NEEDS_ATTENTION.filter((i) => i.days < 0).length

  return (
    <Card>
      <CardHeader
        title="Needs attention"
        subtitle={`${NEEDS_ATTENTION.length} item${NEEDS_ATTENTION.length === 1 ? '' : 's'} across the org`}
        icon={BellRing}
        action={overdue > 0 && <Pill tone="crit" dot>{overdue} overdue</Pill>}
      />
      <div className="px-3 py-3 flex flex-col gap-1">
        {items.length === 0 && (
          <div className="flex flex-col items-center text-center py-10 gap-2">
            <CheckCircle2 size={28} className="text-good-500" />
            <p className="text-[13.5px] font-500 text-ink-700">All caught up</p>
            <p className="text-[12.5px] text-ink-500">Nothing needs attention in the next {45} days.</p>
          </div>
        )}
        {items.map((item) => {
          const Icon = KIND_ICON[item.kind]
          return (
            <Link key={item.id} to={`/directory/${item.employeeId}`} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-ink-50 transition group">
              <Avatar name={item.employeeName} initials={item.initials} hue={item.hue} size={36} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-[13.5px] font-500 text-ink-900 truncate">{item.employeeName}</p>
                  <span className="text-ink-300 text-[12px]">·</span>
                  <span className="text-[12px] text-ink-500 truncate">{item.department}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-[12px] text-ink-500">
                  <Icon size={12.5} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
              </div>
              <Pill tone={item.tone} className="shrink-0">{item.detail}</Pill>
              <ChevronRight size={15} className="text-ink-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition shrink-0" />
            </Link>
          )
        })}
        {NEEDS_ATTENTION.length > items.length && (
          <p className="text-[12px] text-ink-400 text-center pt-2">+{NEEDS_ATTENTION.length - items.length} more not shown</p>
        )}
      </div>
    </Card>
  )
}

export { KIND_ICON, KIND_LABEL }
