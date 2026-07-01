import { useState } from 'react'
import { CalendarClock, Plane, Stethoscope, Baby, CircleSlash, CalendarDays, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardHeader, Pill, Avatar } from '../components/ui'
import { StatCard } from '../components/StatCard'
import { clsx } from '../lib/clsx'
import { fmtRange } from '../lib/date'
import { LEAVE_REQUESTS, OUT_TODAY, EMPLOYEES } from '../data/mockData'

const TYPE_ICON = { Annual: Plane, Sick: Stethoscope, Parental: Baby, Unpaid: CircleSlash }
const TYPE_TONE = { Annual: 'brand', Sick: 'crit', Parental: 'info', Unpaid: 'neutral' }
const TYPE_HEX = { Annual: '#7c3aed', Sick: '#e5484d', Parental: '#3b82f6', Unpaid: '#94a3b8' }
const LEAVE_TYPES = ['Annual', 'Sick', 'Parental', 'Unpaid']
const initials = (n) => n.split(' ').map((w) => w[0]).join('')

export default function TimeOff() {
  // HR-only view: a read-only, organised record of everyone's time off.
  // No approval workflow — leave is grouped by type so HR can scan it quickly.
  const [tab, setTab] = useState('All')
  const [view, setView] = useState('list') // 'list' | 'calendar'

  const counts = LEAVE_TYPES.reduce(
    (acc, t) => ({ ...acc, [t]: LEAVE_REQUESTS.filter((r) => r.type === t).length }),
    { All: LEAVE_REQUESTS.length },
  )
  const shown = (tab === 'All' ? LEAVE_REQUESTS : LEAVE_REQUESTS.filter((r) => r.type === tab))
    .slice()
    .sort((a, b) => a.startDate.localeCompare(b.startDate))

  const utilised = Math.round((EMPLOYEES.reduce((s, e) => s + e.leave.taken, 0) / EMPLOYEES.reduce((s, e) => s + e.leave.entitlement, 0)) * 100)
  const totalDays = shown.reduce((s, r) => s + r.days, 0)

  return (
    <div className="flex flex-col gap-6 animate-rise">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Leave entries logged" value={LEAVE_REQUESTS.length} icon={CalendarClock} tone="brand" />
        <StatCard label="Out today" value={OUT_TODAY.length} icon={Plane} tone="brand" />
        <StatCard label="Leave utilised" value={utilised} suffix="%" icon={CalendarDays} tone="good" />
        <StatCard label="Avg balance left" value={Math.round(EMPLOYEES.reduce((s, e) => s + e.leave.remaining, 0) / EMPLOYEES.length)} suffix="d" icon={Clock} tone="brand" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Leave record, grouped by type */}
        <Card className="xl:col-span-2 flex flex-col">
          <CardHeader title="Leave record" subtitle="All time off, organised by type" icon={CalendarClock}
            action={
              <div className="inline-flex rounded-lg bg-ink-100 p-0.5 gap-0.5">
                {['list', 'calendar'].map((v) => (
                  <button key={v} onClick={() => setView(v)} className={clsx('px-2.5 h-7 rounded-md text-[12px] font-500 capitalize transition', view === v ? 'bg-white text-ink-900 card-shadow' : 'text-ink-500 hover:text-ink-800')}>{v}</button>
                ))}
              </div>
            } />
          {view === 'list' ? (
          <>
          <div className="px-5 pt-3">
            <div className="inline-flex flex-wrap rounded-xl bg-ink-100 p-1 gap-1">
              {['All', ...LEAVE_TYPES].map((t) => {
                const Icon = TYPE_ICON[t]
                return (
                  <button key={t} onClick={() => setTab(t)} className={clsx('px-3.5 h-9 rounded-lg text-[13px] font-500 transition flex items-center gap-2', tab === t ? 'bg-white text-ink-900 card-shadow' : 'text-ink-500 hover:text-ink-800')}>
                    {Icon && <Icon size={13} className="-ml-0.5" />}{t}
                    <span className={clsx('tnum text-[11px] px-1.5 rounded-full', tab === t ? 'bg-brand-50 text-brand-700' : 'bg-ink-200 text-ink-500')}>{counts[t]}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="px-5 pt-3 pb-1 flex items-center justify-between text-[12px] text-ink-500">
            <span>{shown.length} {shown.length === 1 ? 'entry' : 'entries'}{tab !== 'All' && <> · {tab.toLowerCase()} leave</>}</span>
            <span className="tnum">{totalDays} total days</span>
          </div>
          <div className="p-3 pt-1 flex flex-col gap-1.5">
            {shown.length === 0 && <p className="text-center text-[13px] text-ink-500 py-10">No {tab === 'All' ? '' : tab.toLowerCase() + ' '}leave on record.</p>}
            {shown.map((r) => {
              const Icon = TYPE_ICON[r.type]
              return (
                <div key={r.id} className="flex items-center gap-3 rounded-xl border border-ink-200/70 p-3 hover:border-ink-300 transition">
                  <Avatar name={r.employeeName} initials={initials(r.employeeName)} hue={265} size={42} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-600 text-ink-900 truncate">{r.employeeName}</p>
                      <Pill tone={TYPE_TONE[r.type]}><Icon size={11} className="-ml-0.5" />{r.type}</Pill>
                    </div>
                    <p className="text-[12.5px] text-ink-500 mt-0.5">{r.department} · {fmtRange(r.startDate, r.endDate)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[14px] font-600 text-ink-900 tnum">{r.days}</p>
                    <p className="text-[11px] text-ink-400 -mt-0.5">{r.days === 1 ? 'day' : 'days'}</p>
                  </div>
                </div>
              )
            })}
          </div>
          </>
          ) : (
            <LeaveCalendar />
          )}
        </Card>

        {/* Who's out + calendar strip */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Out today" subtitle={`${OUT_TODAY.length} away`} icon={Plane} />
            <div className="px-5 py-4 flex flex-col gap-3">
              {OUT_TODAY.map((o) => {
                const Icon = TYPE_ICON[o.type] ?? Plane
                return (
                  <div key={o.id} className="flex items-center gap-3">
                    <Avatar name={o.name} initials={o.initials} hue={o.hue} size={36} />
                    <div className="min-w-0 flex-1"><p className="text-[13.5px] font-500 text-ink-900 truncate">{o.name}</p><p className="text-[12px] text-ink-500 truncate">{o.department}</p></div>
                    <Pill tone={TYPE_TONE[o.type]}><Icon size={11} className="-ml-0.5" />{o.type}</Pill>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card>
            <CardHeader title="This week" subtitle="Coverage at a glance" icon={CalendarDays} />
            <div className="p-5"><WeekStrip /></div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Month calendar showing who's on leave each day, colour-coded by type.
function LeaveCalendar() {
  const [ym, setYm] = useState({ y: 2026, m: 6 }) // July 2026 — mock leave spans Jun–Aug
  const pad = (n) => String(n).padStart(2, '0')
  const monthLabel = new Date(ym.y, ym.m, 1).toLocaleString('en-GB', { month: 'long', year: 'numeric' })
  const daysInMonth = new Date(ym.y, ym.m + 1, 0).getDate()
  const firstWeekday = (new Date(ym.y, ym.m, 1).getDay() + 6) % 7 // Monday = 0

  const entriesOn = (d) => {
    const ds = `${ym.y}-${pad(ym.m + 1)}-${pad(d)}`
    return LEAVE_REQUESTS.filter((l) => l.startDate <= ds && ds <= l.endDate)
  }
  const shift = (delta) => setYm(({ y, m }) => {
    const nm = m + delta
    return { y: y + Math.floor(nm / 12), m: ((nm % 12) + 12) % 12 }
  })

  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => shift(-1)} className="grid place-items-center size-8 rounded-lg text-ink-500 hover:bg-ink-100 transition" aria-label="Previous month"><ChevronLeft size={18} /></button>
        <p className="font-600 text-ink-900 text-[14px]">{monthLabel}</p>
        <button onClick={() => shift(1)} className="grid place-items-center size-8 rounded-lg text-ink-500 hover:bg-ink-100 transition" aria-label="Next month"><ChevronRight size={18} /></button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="text-center text-[11px] font-600 text-ink-400">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={`b${i}`} />
          const es = entriesOn(d)
          const weekend = i % 7 >= 5
          return (
            <div key={d} className={clsx('min-h-[62px] rounded-lg border p-1.5 flex flex-col gap-1', weekend ? 'bg-ink-50 border-ink-100' : 'bg-white border-ink-200/70')}>
              <span className="text-[11px] font-600 text-ink-500 tnum">{d}</span>
              <div className="flex flex-col gap-0.5 min-w-0">
                {es.slice(0, 2).map((l) => (
                  <div key={l.id} className="flex items-center gap-1 min-w-0" title={`${l.employeeName} · ${l.type}`}>
                    <span className="size-1.5 rounded-full shrink-0" style={{ background: TYPE_HEX[l.type] }} />
                    <span className="text-[10.5px] text-ink-600 truncate">{l.employeeName.split(' ')[0]}</span>
                  </div>
                ))}
                {es.length > 2 && <span className="text-[10px] text-ink-400 pl-2.5">+{es.length - 2} more</span>}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-ink-100">
        {Object.entries(TYPE_HEX).map(([t, c]) => (
          <span key={t} className="flex items-center gap-1.5 text-[11.5px] text-ink-500">
            <span className="size-2 rounded-full" style={{ background: c }} />{t}
          </span>
        ))}
      </div>
    </div>
  )
}

function WeekStrip() {
  const days = [
    { d: 'Mon', n: 29, out: 2 }, { d: 'Tue', n: 30, out: OUT_TODAY.length, today: true },
    { d: 'Wed', n: 1, out: 4 }, { d: 'Thu', n: 2, out: 3 }, { d: 'Fri', n: 3, out: 5 },
  ]
  const max = Math.max(...days.map((d) => d.out))
  return (
    <div className="flex items-end justify-between gap-2 h-40">
      {days.map((day) => (
        <div key={day.d} className="flex-1 flex flex-col items-center gap-2">
          <span className="text-[12px] font-600 text-ink-700 tnum">{day.out}</span>
          <div className="w-full rounded-lg bg-ink-100 relative overflow-hidden" style={{ height: '100%' }}>
            <div className={clsx('absolute bottom-0 inset-x-0 rounded-lg transition-[height] duration-700', day.today ? 'accent-gradient' : 'bg-brand-200')} style={{ height: `${(day.out / max) * 100}%` }} />
          </div>
          <div className="text-center">
            <p className={clsx('text-[12px] font-600', day.today ? 'text-brand-700' : 'text-ink-600')}>{day.d}</p>
            <p className="text-[11px] text-ink-400 tnum">{day.n}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
