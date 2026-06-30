import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, MapPin, Users, Filter, ScanLine, UserPlus, Check, Clock, TrendingUp } from 'lucide-react'
import { Card, CardHeader, Pill, Avatar, Button, Progress, Stars, STAGE_TONE, PRIORITY_TONE, Eyebrow } from '../components/ui'
import { StatCard } from '../components/StatCard'
import { Funnel } from '../components/charts'
import { clsx } from '../lib/clsx'
import { JOB_OPENINGS, CANDIDATES, FUNNEL, ONBOARDING, KPIS, departmentById } from '../data/mockData'

export default function Recruiting() {
  const [job, setJob] = useState('all')
  const candidates = job === 'all' ? CANDIDATES : CANDIDATES.filter((c) => c.jobId === job)

  return (
    <div className="flex flex-col gap-6 animate-rise">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Open requisitions" value={KPIS.openReqs} icon={Briefcase} tone="brand" />
        <StatCard label="Seats to fill" value={KPIS.openRoles} icon={Users} tone="flare" />
        <StatCard label="Time to hire" value={KPIS.timeToHireDays} suffix="d" icon={Clock} delta={-3} deltaLabel="d" tone="good" />
        <StatCard label="Offer acceptance" value={KPIS.offerAcceptance} suffix="%" icon={TrendingUp} delta={4} deltaLabel="%" tone="good" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Open roles */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-display font-600 text-ink-900 text-[15px]">Open roles</h2>
            <Link to="/cv-screening"><Button variant="secondary" size="sm" icon={ScanLine}>Screen CVs</Button></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {JOB_OPENINGS.map((j) => {
              const dept = departmentById(j.department)
              const inPipeline = CANDIDATES.filter((c) => c.jobId === j.id).length
              return (
                <Card key={j.id} className="p-4 hover:border-brand-300 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="grid place-items-center size-10 rounded-xl shrink-0 text-white" style={{ background: `linear-gradient(135deg, hsl(${dept.hue} 55% 52%), hsl(${dept.hue + 30} 60% 42%))` }}><Briefcase size={18} /></span>
                      <div className="min-w-0">
                        <p className="font-600 text-ink-900 text-[14.5px] leading-tight truncate">{j.title}</p>
                        <p className="text-[12.5px] text-ink-500">{dept.name}</p>
                      </div>
                    </div>
                    <Pill tone={PRIORITY_TONE[j.priority]} dot>{j.priority}</Pill>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-[12.5px] text-ink-500">
                    <span className="inline-flex items-center gap-1"><MapPin size={13} />{j.location}</span>
                    <span className="inline-flex items-center gap-1"><Users size={13} />{j.openings} seat(s)</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink-100">
                    <div className="text-[12.5px] text-ink-600"><span className="font-700 text-ink-900 tnum">{j.applicants}</span> applicants</div>
                    <button onClick={() => setJob(job === j.id ? 'all' : j.id)} className={clsx('text-[12.5px] font-500 rounded-lg px-2.5 py-1 transition', job === j.id ? 'bg-brand-700 text-white' : 'text-brand-700 hover:bg-brand-50')}>
                      {job === j.id ? 'Showing pipeline' : `${inPipeline} in pipeline`}
                    </button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Funnel + onboarding */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Pipeline" subtitle={`${CANDIDATES.length} candidates`} icon={Filter} />
            <div className="p-5 pt-4"><Funnel data={FUNNEL} /></div>
          </Card>
          <Card className="flex flex-col">
            <CardHeader title="Onboarding" subtitle={`${ONBOARDING.length} new starters`} icon={UserPlus} />
            <div className="px-5 py-4 flex flex-col gap-4">
              {ONBOARDING.map((o) => (
                <div key={o.id} className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar name={o.name} initials={o.initials} hue={o.hue} size={32} />
                    <div className="min-w-0 flex-1"><p className="text-[13px] font-500 text-ink-900 truncate">{o.name}</p><p className="text-[11.5px] text-ink-500 truncate">{o.title}</p></div>
                    <span className="text-[11.5px] font-600 text-ink-600 tnum">{o.progress}%</span>
                  </div>
                  <Progress value={o.progress} tone={o.progress === 100 ? 'good' : 'brand'} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Candidate table */}
      <Card className="overflow-hidden">
        <CardHeader
          title="Candidates"
          subtitle={job === 'all' ? 'All open roles' : JOB_OPENINGS.find((j) => j.id === job)?.title}
          icon={Users}
          action={job !== 'all' && <Button variant="ghost" size="sm" onClick={() => setJob('all')}>Clear filter</Button>}
        />
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-ink-400 border-b border-ink-200">
                <th className="font-600 px-5 py-3">Candidate</th>
                <th className="font-600 px-3 py-3 hidden md:table-cell">Role</th>
                <th className="font-600 px-3 py-3 hidden lg:table-cell">Source</th>
                <th className="font-600 px-3 py-3">Rating</th>
                <th className="font-600 px-3 py-3">Stage</th>
              </tr>
            </thead>
            <tbody>
              {candidates.slice(0, 12).map((c) => (
                <tr key={c.id} className="border-b border-ink-100 last:border-0 hover:bg-ink-50 transition">
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-3"><Avatar name={c.name} initials={c.initials} hue={c.hue} size={34} /><span className="text-[13.5px] font-500 text-ink-900">{c.name}</span></div>
                  </td>
                  <td className="px-3 py-2.5 text-[13px] text-ink-600 hidden md:table-cell">{c.role}</td>
                  <td className="px-3 py-2.5 text-[13px] text-ink-600 hidden lg:table-cell">{c.source}</td>
                  <td className="px-3 py-2.5"><Stars value={c.rating} /></td>
                  <td className="px-3 py-2.5"><Pill tone={STAGE_TONE[c.stage]} dot>{c.stage}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
