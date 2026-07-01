import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, Award, Briefcase, Clock, Users2, IdCard,
  CalendarClock, Plane, Stethoscope, Baby, CircleSlash, ChevronRight, TrendingUp, Building2, GraduationCap,
  ShieldCheck, ShieldAlert,
} from 'lucide-react'
import { Card, CardHeader, Pill, Avatar, Button, Progress, Eyebrow, STATUS_TONE } from '../components/ui'
import { Donut } from '../components/charts'
import { clsx } from '../lib/clsx'
import { employeeById, departmentById, EMPLOYEES, LEAVE_REQUESTS, certStatus, nextAnniversary, daysUntil } from '../data/mockData'

const LEAVE_ICON = { Annual: Plane, Sick: Stethoscope, Parental: Baby, Unpaid: CircleSlash }
const LEAVE_TONE = { Annual: 'brand', Sick: 'crit', Parental: 'info', Unpaid: 'neutral' }
const PERF_TONE = { Exceeds: 'good', Meets: 'brand', Developing: 'warn' }

export default function Profile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const e = employeeById(id)

  if (!e) {
    return (
      <div className="grid place-items-center py-24 text-center animate-rise">
        <Users2 size={36} className="text-ink-300" />
        <p className="mt-3 font-display font-600 text-ink-900 text-xl">Person not found</p>
        <p className="text-ink-500 mt-1">No employee with id {id}.</p>
        <Link to="/directory" className="mt-4"><Button variant="primary" icon={ArrowLeft}>Back to directory</Button></Link>
      </div>
    )
  }

  const dept = departmentById(e.department)
  const manager = e.managerId ? employeeById(e.managerId) : null
  const reports = EMPLOYEES.filter((r) => r.managerId === e.id)
  const leaves = LEAVE_REQUESTS.filter((l) => l.employeeId === e.id)
  const leavePct = Math.round((e.leave.remaining / e.leave.entitlement) * 100)
  const anniv = nextAnniversary(e.startDate)
  const certs = [...(e.certifications ?? [])].sort((a, b) => certStatus(a.expiryDate).days - certStatus(b.expiryDate).days)
  const certsNeedingAttention = certs.filter((c) => certStatus(c.expiryDate).days <= 60).length

  return (
    <div className="flex flex-col gap-6 animate-rise">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-[13px] font-500 text-ink-500 hover:text-ink-900 transition w-fit">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Hero */}
      <div className="relative rounded-[var(--radius-card)] overflow-hidden bg-signal bg-signal-animated text-white">
        <div className="p-6 lg:p-7 flex flex-col sm:flex-row sm:items-center gap-5">
          <Avatar name={e.name} initials={e.initials} hue={e.hue} size={84} className="ring-4 ring-white/20" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display font-700 text-2xl lg:text-3xl leading-tight">{e.name}</h1>
              <Pill tone={STATUS_TONE[e.status]} dot>{e.status}</Pill>
              {e.isLead && <Pill tone="flare">Team Lead</Pill>}
            </div>
            <p className="text-white/80 text-[15px] mt-1">{e.title}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[13px] text-white/70">
              <span className="inline-flex items-center gap-1.5"><Building2 size={14} />{dept.name}</span>
              <span className="inline-flex items-center gap-1.5"><MapPin size={14} />{e.location}</span>
              <span className="inline-flex items-center gap-1.5"><IdCard size={14} />{e.id}</span>
              <span className="inline-flex items-center gap-1.5"><Briefcase size={14} />{e.employmentType}</span>
            </div>
          </div>
          <div className="flex sm:flex-col gap-2 shrink-0">
            <Button variant="flare" icon={Mail}>Message</Button>
            <Button variant="secondary" icon={Award} className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20">Review</Button>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat icon={Clock} label="Tenure" value={`${e.tenureYears}`} suffix="yrs" tone="brand" />
        <MiniStat icon={CalendarClock} label="Leave left" value={e.leave.remaining} suffix={`/${e.leave.entitlement}d`} tone="good" />
        <MiniStat icon={TrendingUp} label="Performance" valueEl={<Pill tone={PERF_TONE[e.performance]}>{e.performance}</Pill>} tone="flare" />
        <MiniStat icon={Users2} label="Direct reports" value={reports.length} tone="brand" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Contact" icon={Mail} />
            <div className="p-5 pt-3 flex flex-col gap-3">
              <ContactRow icon={Mail} label="Email" value={e.email} href={`mailto:${e.email}`} />
              <ContactRow icon={Phone} label="Phone" value={e.phone} href={`tel:${e.phone}`} />
              <ContactRow icon={MapPin} label="Location" value={e.location} />
              <ContactRow icon={Calendar} label="Start date" value={e.startDate} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Reporting line" icon={Building2} />
            <div className="p-5 pt-3 flex flex-col gap-4">
              <div>
                <Eyebrow className="mb-2">Manager</Eyebrow>
                {manager ? <PersonLink e={manager} /> : <p className="text-[13px] text-ink-500">Department lead — reports to leadership.</p>}
              </div>
              <div>
                <Eyebrow className="mb-2">Direct reports ({reports.length})</Eyebrow>
                {reports.length ? (
                  <div className="flex flex-col gap-2">{reports.map((r) => <PersonLink key={r.id} e={r} />)}</div>
                ) : (
                  <p className="text-[13px] text-ink-500">No direct reports.</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Middle: leave */}
        <Card className="xl:col-span-1">
          <CardHeader title="Time off" subtitle="Balance & history" icon={CalendarClock} />
          <div className="p-5 pt-3 flex flex-col gap-5">
            <div className="flex items-center gap-5">
              <Donut size={120} thickness={15}
                segments={[{ value: e.leave.remaining, color: '#7c3aed' }, { value: e.leave.taken, color: '#eef0f4' }]}
                center={<div><p className="font-display font-700 text-2xl text-ink-900 tnum leading-none">{e.leave.remaining}</p><p className="text-[10px] text-ink-400 mt-0.5">of {e.leave.entitlement}d</p></div>} />
              <div className="flex-1 flex flex-col gap-2 text-[13px]">
                <LeaveStat label="Entitlement" value={`${e.leave.entitlement} days`} />
                <LeaveStat label="Taken" value={`${e.leave.taken} days`} />
                <LeaveStat label="Remaining" value={`${e.leave.remaining} days`} strong />
                <Progress value={leavePct} className="mt-1" />
              </div>
            </div>

            <div>
              <Eyebrow className="mb-2">Leave this year</Eyebrow>
              {leaves.length ? (
                <div className="flex flex-col gap-2">
                  {leaves.map((l) => {
                    const Icon = LEAVE_ICON[l.type]
                    return (
                      <div key={l.id} className="flex items-center gap-3 rounded-xl border border-ink-200/70 p-2.5">
                        <span className="grid place-items-center size-8 rounded-lg bg-ink-100 text-ink-500 shrink-0"><Icon size={15} /></span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-500 text-ink-900">{l.type} · {l.days}d</p>
                          <p className="text-[11.5px] text-ink-500">{l.startDate} → {l.endDate}</p>
                        </div>
                        <Pill tone={LEAVE_TONE[l.type]}>{l.type}</Pill>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-[13px] text-ink-500">No leave recorded this year.</p>
              )}
            </div>
          </div>
        </Card>

        {/* Right: role + skills */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Role details" icon={Briefcase} />
            <div className="p-5 pt-3 flex flex-col gap-2.5">
              <DetailRow label="Department" value={dept.name} />
              <DetailRow label="Title" value={e.title} />
              <DetailRow label="Employment" value={e.employmentType} />
              <DetailRow label="Employee ID" value={e.id} mono />
              <DetailRow label="Tenure" value={`${e.tenureYears} years`} />
              <DetailRow label="Performance" valueEl={<Pill tone={PERF_TONE[e.performance]}>{e.performance}</Pill>} />
              {e.contractEndDate && (() => {
                const d = daysUntil(e.contractEndDate)
                return <DetailRow label="Contract ends" valueEl={<Pill tone={d <= 14 ? 'crit' : d <= 45 ? 'warn' : 'neutral'}>{e.contractEndDate}</Pill>} />
              })()}
              {e.probationEndDate && (() => {
                const d = daysUntil(e.probationEndDate)
                return <DetailRow label="Probation ends" valueEl={<Pill tone={d <= 7 ? 'crit' : d <= 45 ? 'warn' : 'neutral'}>{e.probationEndDate}</Pill>} />
              })()}
              <DetailRow label="Next anniversary" valueEl={<Pill tone={anniv.days <= 30 ? 'flare' : 'neutral'}>{anniv.years}y · {anniv.date}</Pill>} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Education" subtitle={`${(e.education ?? []).length} ${(e.education ?? []).length === 1 ? 'qualification' : 'qualifications'}`} icon={GraduationCap} />
            <div className="p-5 pt-3 flex flex-col gap-3">
              {(e.education ?? []).map((ed, i) => (
                <div key={i} className="flex gap-3">
                  <span className="grid place-items-center size-9 rounded-xl bg-brand-50 text-brand-700 shrink-0"><GraduationCap size={16} /></span>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-600 text-ink-900">{ed.degree} · {ed.field}</p>
                    <p className="text-[12px] text-ink-500">{ed.institution} · {ed.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Certifications" subtitle={`${certs.length} on record${certsNeedingAttention ? ` · ${certsNeedingAttention} need attention` : ''}`} icon={ShieldCheck} />
            <div className="p-5 pt-3 flex flex-col gap-2.5">
              {certs.map((c) => {
                const st = certStatus(c.expiryDate)
                return (
                  <div key={c.name} className="flex items-center gap-3 rounded-xl border border-ink-200/70 p-2.5">
                    <span className={clsx('grid place-items-center size-9 rounded-xl shrink-0',
                      st.tone === 'crit' ? 'bg-crit-50 text-crit-700' : st.tone === 'warn' ? 'bg-warn-50 text-warn-700' : 'bg-good-50 text-good-700')}>
                      {st.tone === 'good' ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-600 text-ink-900 truncate">{c.name}</p>
                      <p className="text-[11.5px] text-ink-500">Expires {c.expiryDate}</p>
                    </div>
                    <Pill tone={st.tone}>{st.label}</Pill>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card>
            <CardHeader title="Skills" subtitle={`${e.skills.length} listed`} icon={Award} />
            <div className="p-5 pt-3 flex flex-wrap gap-2">
              {e.skills.map((s) => <span key={s} className="text-[13px] bg-brand-50 text-brand-700 rounded-lg px-2.5 py-1.5 font-500">{s}</span>)}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function MiniStat({ icon: Icon, label, value, suffix, valueEl, tone }) {
  return (
    <Card className="p-4 flex items-center gap-3">
      <span className={clsx('grid place-items-center size-10 rounded-xl shrink-0',
        tone === 'flare' ? 'bg-flare-500/10 text-flare-600' : tone === 'good' ? 'bg-good-50 text-good-700' : 'bg-brand-50 text-brand-700')}>
        <Icon size={19} strokeWidth={2.2} />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] text-ink-500">{label}</p>
        {valueEl ?? <p className="font-display font-700 text-ink-900 text-xl tnum leading-tight">{value}<span className="text-[13px] text-ink-400 font-600 ml-0.5">{suffix}</span></p>}
      </div>
    </Card>
  )
}

function PersonLink({ e }) {
  return (
    <Link to={`/directory/${e.id}`} className="flex items-center gap-3 rounded-xl border border-ink-200/70 p-2.5 hover:border-brand-300 hover:bg-brand-50/40 transition group">
      <Avatar name={e.name} initials={e.initials} hue={e.hue} size={34} />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-600 text-ink-900 truncate">{e.name}</p>
        <p className="text-[11.5px] text-ink-500 truncate">{e.title}</p>
      </div>
      <ChevronRight size={16} className="text-ink-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition" />
    </Link>
  )
}

const ContactRow = ({ icon: Icon, label, value, href }) => {
  const inner = (
    <div className="flex items-center gap-3">
      <span className="grid place-items-center size-9 rounded-xl bg-ink-100 text-ink-500 shrink-0"><Icon size={16} /></span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-ink-400 font-600">{label}</p>
        <p className="text-[13.5px] text-ink-800 truncate">{value}</p>
      </div>
    </div>
  )
  return href ? <a href={href} className="hover:opacity-80 transition">{inner}</a> : inner
}

const DetailRow = ({ label, value, valueEl, mono }) => (
  <div className="flex items-center justify-between gap-3 text-[13.5px]">
    <span className="text-ink-500">{label}</span>
    {valueEl ?? <span className={clsx('text-ink-900 font-500 text-right', mono && 'font-mono text-[12.5px]')}>{value}</span>}
  </div>
)

const LeaveStat = ({ label, value, strong }) => (
  <div className="flex items-center justify-between">
    <span className="text-ink-500">{label}</span>
    <span className={clsx('tnum', strong ? 'font-700 text-ink-900' : 'font-500 text-ink-700')}>{value}</span>
  </div>
)
