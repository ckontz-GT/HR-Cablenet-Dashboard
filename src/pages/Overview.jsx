import { Link } from 'react-router-dom'
import { Users, CalendarClock, Briefcase, TrendingUp, ArrowRight, CheckCircle2, UserPlus, ScanLine, FileText, Sparkles, Clock } from 'lucide-react'
import { HeroStat, StatCard } from '../components/StatCard'
import { Card, CardHeader, Pill, Avatar, Button, Progress, STATUS_TONE, STAGE_TONE, Eyebrow } from '../components/ui'
import { AreaChart, HBars } from '../components/charts'
import { NeedsAttention } from '../components/NeedsAttention'
import { useAssistant } from '../components/AssistantProvider'
import {
  KPIS, HEADCOUNT_TREND, HEADCOUNT_BY_DEPT, LEAVE_REQUESTS, OUT_TODAY, ONBOARDING, ACTIVITY, FUNNEL, CANDIDATES,
} from '../data/mockData'

const ACTIVITY_ICON = { leave: CalendarClock, hire: UserPlus, cv: ScanLine, onboard: CheckCircle2, review: FileText }
// Leave-type colours, matching the Time Off page.
const TYPE_TONE = { Annual: 'brand', Sick: 'crit', Parental: 'info', Unpaid: 'neutral' }

export default function Overview() {
  const { setOpen, send } = useAssistant()
  const sparkHeadcount = HEADCOUNT_TREND.map((d) => d.headcount)

  return (
    <div className="flex flex-col gap-6 animate-rise">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <HeroStat label="Total headcount" value={KPIS.headcount} sub={`▲ ${KPIS.headcountDelta} this quarter · ${KPIS.onboarding} onboarding`} spark={sparkHeadcount} />
        <StatCard label="Open roles" value={KPIS.openRoles} icon={Briefcase} delta={2} deltaLabel="" tone="flare" spark={[3, 4, 4, 6, 7, 9, KPIS.openRoles]} />
        <StatCard label="Out today" value={OUT_TODAY.length} icon={CalendarClock} tone="brand" />
        <StatCard label="Avg tenure" value={KPIS.avgTenure} suffix="yrs" icon={TrendingUp} delta={0.3} deltaLabel="y" tone="good" spark={[3.1, 3.2, 3.4, 3.3, 3.6, 3.7, KPIS.avgTenure]} />
      </div>

      {/* Needs attention — certs expiring, contract renewals, probation, anniversaries */}
      <NeedsAttention />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Headcount trend */}
        <Card className="xl:col-span-2 pb-2">
          <CardHeader
            title="Headcount growth"
            subtitle="Trailing 12 months"
            icon={TrendingUp}
            action={<Link to="/analytics"><Button variant="ghost" size="sm" icon={ArrowRight} className="flex-row-reverse">Analytics</Button></Link>}
          />
          <div className="px-2 pt-2"><AreaChart data={HEADCOUNT_TREND} valueKey="headcount" height={230} /></div>
        </Card>

        {/* Ask HR promo */}
        <Card className="bg-signal text-white relative overflow-hidden border-0">
          <div className="p-5 flex flex-col h-full">
            <span className="grid place-items-center size-11 rounded-2xl glass mb-4"><Sparkles size={22} /></span>
            <Eyebrow className="text-white/50">HR Assistant</Eyebrow>
            <h3 className="font-display font-700 text-xl mt-1 text-balance">Ask anything about your people</h3>
            <p className="text-[13.5px] text-white/70 mt-2 leading-relaxed">Headcount, who’s on leave, open roles, skills — answered instantly from your live HR data.</p>
            <div className="mt-auto pt-5 flex flex-col gap-2">
              {['How many people work at Cablenet?', "Who's on leave today?"].map((q) => (
                <button key={q} onClick={() => { send(q); setOpen(true) }} className="text-left text-[13px] glass rounded-xl px-3 py-2 hover:bg-white/15 transition">{q}</button>
              ))}
              <Button variant="flare" className="mt-1 w-full" icon={Sparkles} onClick={() => setOpen(true)}>Open assistant</Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Time off — read-only record snapshot (HR-only, no approvals) */}
        <Card className="flex flex-col">
          <CardHeader title="Recent time off" subtitle={`${LEAVE_REQUESTS.length} entries on record`} icon={CalendarClock}
            action={<Link to="/time-off" className="text-[13px] font-500 text-brand-700 hover:underline">View all</Link>} />
          <div className="px-3 py-3 flex flex-col gap-1">
            {[...LEAVE_REQUESTS].sort((a, b) => b.startDate.localeCompare(a.startDate)).slice(0, 4).map((l) => (
              <div key={l.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-ink-50 transition">
                <Avatar name={l.employeeName} initials={l.employeeName.split(' ').map((w) => w[0]).join('')} hue={265} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-500 text-ink-900 truncate">{l.employeeName}</p>
                  <p className="text-[12px] text-ink-500">{l.startDate} → {l.endDate} · {l.days}d</p>
                </div>
                <Pill tone={TYPE_TONE[l.type]}>{l.type}</Pill>
              </div>
            ))}
          </div>
        </Card>

        {/* Headcount by dept */}
        <Card>
          <CardHeader title="Headcount by team" subtitle={`${HEADCOUNT_BY_DEPT.length} departments`} icon={Users}
            action={<Link to="/directory" className="text-[13px] font-500 text-brand-700 hover:underline">Directory</Link>} />
          <div className="p-5 pt-4"><HBars data={[...HEADCOUNT_BY_DEPT].sort((a, b) => b.count - a.count).slice(0, 6)} /></div>
        </Card>

        {/* Onboarding */}
        <Card className="flex flex-col">
          <CardHeader title="Onboarding" subtitle={`${ONBOARDING.length} new starters`} icon={UserPlus}
            action={<Link to="/recruiting" className="text-[13px] font-500 text-brand-700 hover:underline">View</Link>} />
          <div className="px-5 py-4 flex flex-col gap-4">
            {ONBOARDING.slice(0, 3).map((o) => (
              <div key={o.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Avatar name={o.name} initials={o.initials} hue={o.hue} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-500 text-ink-900 truncate">{o.name}</p>
                    <p className="text-[12px] text-ink-500 truncate">{o.title}</p>
                  </div>
                  <span className="text-[12px] font-600 text-ink-600 tnum">{o.progress}%</span>
                </div>
                <Progress value={o.progress} tone={o.progress === 100 ? 'good' : 'brand'} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recruiting funnel */}
        <Card className="xl:col-span-2">
          <CardHeader title="Hiring pipeline" subtitle={`${CANDIDATES.length} candidates across ${FUNNEL.length} stages`} icon={Briefcase}
            action={<Link to="/recruiting"><Button variant="ghost" size="sm" icon={ArrowRight} className="flex-row-reverse">Recruiting</Button></Link>} />
          <div className="p-5 pt-4">
            <FunnelMini />
          </div>
        </Card>

        {/* Activity */}
        <Card className="flex flex-col">
          <CardHeader title="Recent activity" icon={Clock} />
          <div className="px-5 py-4 flex flex-col gap-3.5">
            {ACTIVITY.map((a) => {
              const Icon = ACTIVITY_ICON[a.kind] ?? FileText
              return (
                <div key={a.id} className="flex gap-3">
                  <span className="grid place-items-center size-8 rounded-lg bg-ink-100 text-ink-500 shrink-0"><Icon size={15} /></span>
                  <div className="min-w-0">
                    <p className="text-[13px] text-ink-700 leading-snug">
                      {a.actor && <span className="font-600 text-ink-900">{a.actor} </span>}
                      {a.text} {a.subject && <span className="font-600 text-ink-900">{a.subject}</span>}
                    </p>
                    <p className="text-[11.5px] text-ink-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}

function FunnelMini() {
  const colors = ['#cfc8db', '#9466d0', '#7c3aed', '#ff944d', '#15b79e']
  const max = Math.max(...FUNNEL.map((f) => f.count)) || 1
  return (
    <div className="flex gap-2 h-44">
      {FUNNEL.map((f, i) => (
        <div key={f.stage} className="flex-1 h-full flex flex-col items-center justify-end gap-2">
          <span className="font-display font-700 text-ink-900 tnum text-lg">{f.count}</span>
          <div className="w-full rounded-t-lg transition-[height] duration-700" style={{ height: `${Math.max(8, (f.count / max) * 100)}%`, background: colors[i] }} />
          <span className="text-[12px] text-ink-500">{f.stage}</span>
        </div>
      ))}
    </div>
  )
}
