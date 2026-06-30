import { useState } from 'react'
import { Check, X, CalendarClock, Plane, Stethoscope, Baby, CircleSlash, CalendarDays, Clock } from 'lucide-react'
import { Card, CardHeader, Pill, Avatar, Button, STATUS_TONE, Eyebrow } from '../components/ui'
import { StatCard } from '../components/StatCard'
import { clsx } from '../lib/clsx'
import { LEAVE_REQUESTS, OUT_TODAY, KPIS, EMPLOYEES } from '../data/mockData'

const TYPE_ICON = { Annual: Plane, Sick: Stethoscope, Parental: Baby, Unpaid: CircleSlash }
const TYPE_TONE = { Annual: 'brand', Sick: 'crit', Parental: 'info', Unpaid: 'neutral' }
const initials = (n) => n.split(' ').map((w) => w[0]).join('')

export default function TimeOff() {
  const [requests, setRequests] = useState(LEAVE_REQUESTS)
  const [tab, setTab] = useState('Pending')

  const act = (id, status) => setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)))
  const counts = {
    Pending: requests.filter((r) => r.status === 'Pending').length,
    Approved: requests.filter((r) => r.status === 'Approved').length,
    Rejected: requests.filter((r) => r.status === 'Rejected').length,
  }
  const shown = requests.filter((r) => r.status === tab)
  const utilised = Math.round((EMPLOYEES.reduce((s, e) => s + e.leave.taken, 0) / EMPLOYEES.reduce((s, e) => s + e.leave.entitlement, 0)) * 100)

  return (
    <div className="flex flex-col gap-6 animate-rise">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Awaiting approval" value={counts.Pending} icon={CalendarClock} tone="warn" />
        <StatCard label="Out today" value={OUT_TODAY.length} icon={Plane} tone="brand" />
        <StatCard label="Leave utilised" value={utilised} suffix="%" icon={CalendarDays} tone="good" />
        <StatCard label="Avg balance left" value={Math.round(EMPLOYEES.reduce((s, e) => s + e.leave.remaining, 0) / EMPLOYEES.length)} suffix="d" icon={Clock} tone="brand" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Approvals queue */}
        <Card className="xl:col-span-2 flex flex-col">
          <CardHeader title="Leave requests" subtitle="Review and action time-off requests" icon={CalendarClock} />
          <div className="px-5 pt-3">
            <div className="inline-flex rounded-xl bg-ink-100 p-1 gap-1">
              {['Pending', 'Approved', 'Rejected'].map((t) => (
                <button key={t} onClick={() => setTab(t)} className={clsx('px-3.5 h-9 rounded-lg text-[13px] font-500 transition flex items-center gap-2', tab === t ? 'bg-white text-ink-900 card-shadow' : 'text-ink-500 hover:text-ink-800')}>
                  {t}<span className={clsx('tnum text-[11px] px-1.5 rounded-full', tab === t ? 'bg-brand-50 text-brand-700' : 'bg-ink-200 text-ink-500')}>{counts[t]}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="p-3 flex flex-col gap-1.5">
            {shown.length === 0 && <p className="text-center text-[13px] text-ink-500 py-10">No {tab.toLowerCase()} requests.</p>}
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
                    <p className="text-[12.5px] text-ink-500 mt-0.5">{r.startDate} → {r.endDate} · <span className="font-500 text-ink-700 tnum">{r.days} days</span></p>
                  </div>
                  {r.status === 'Pending' ? (
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => act(r.id, 'Approved')} className="grid place-items-center size-9 rounded-lg bg-good-50 text-good-700 hover:bg-good-500 hover:text-white transition" title="Approve"><Check size={17} /></button>
                      <button onClick={() => act(r.id, 'Rejected')} className="grid place-items-center size-9 rounded-lg bg-crit-50 text-crit-700 hover:bg-crit-500 hover:text-white transition" title="Reject"><X size={17} /></button>
                    </div>
                  ) : (
                    <Pill tone={STATUS_TONE[r.status]} dot>{r.status}</Pill>
                  )}
                </div>
              )
            })}
          </div>
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
