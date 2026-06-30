import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight, Users, Maximize2, Minimize2 } from 'lucide-react'
import { Avatar, Button } from './ui'
import { Slashes } from './Logo'
import { clsx } from '../lib/clsx'
import { EMPLOYEES, DEPARTMENTS, COMPANY } from '../data/mockData'

const STATUS_DOT = { Active: 'bg-good-500', 'On leave': 'bg-warn-500', Onboarding: 'bg-info-500' }

function PersonNode({ e, dim }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(`/directory/${e.id}`)}
      className={clsx(
        'org-node text-left w-[176px] rounded-2xl bg-white border border-ink-200 card-shadow p-3 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg',
        dim && 'opacity-35'
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className="relative shrink-0">
          <Avatar name={e.name} initials={e.initials} hue={e.hue} size={40} />
          <span className={clsx('absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-2 ring-white', STATUS_DOT[e.status])} title={e.status} />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-600 text-ink-900 truncate leading-tight">{e.name}</p>
          <p className="text-[11.5px] text-ink-500 truncate leading-tight mt-0.5">{e.title}</p>
        </div>
      </div>
    </button>
  )
}

function DeptNode({ dept, count, leadName, expanded, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="org-node w-[200px] rounded-2xl text-white p-3.5 text-left transition-all hover:brightness-105 card-shadow"
      style={{ background: `linear-gradient(135deg, hsl(${dept.hue} 52% 46%), hsl(${dept.hue + 28} 58% 36%))` }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-display font-700 text-[14px] leading-tight">{dept.name}</span>
        <span className="grid place-items-center size-6 rounded-lg bg-white/20 shrink-0">
          {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-2 text-[12px] text-white/80">
        <span className="inline-flex items-center gap-1"><Users size={12} />{count}</span>
        <span className="text-white/50">·</span>
        <span className="truncate">Lead: {leadName}</span>
      </div>
    </button>
  )
}

export function OrgChart({ deptFilter = 'all', query = '' }) {
  const depts = deptFilter === 'all' ? DEPARTMENTS : DEPARTMENTS.filter((d) => d.id === deptFilter)
  const [expanded, setExpanded] = useState(() => Object.fromEntries(DEPARTMENTS.map((d) => [d.id, deptFilter !== 'all'])))
  const q = query.toLowerCase().trim()
  const matches = (e) => !q || `${e.name} ${e.title} ${e.location} ${e.skills.join(' ')}`.toLowerCase().includes(q)

  const toggle = (id) => setExpanded((s) => ({ ...s, [id]: !s[id] }))
  const allOpen = depts.every((d) => expanded[d.id])
  const setAll = (val) => setExpanded(Object.fromEntries(DEPARTMENTS.map((d) => [d.id, val])))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-[13px] text-ink-500">Tap a department to expand · tap a person to open their profile</p>
        <Button variant="secondary" size="sm" icon={allOpen ? Minimize2 : Maximize2} onClick={() => setAll(!allOpen)}>
          {allOpen ? 'Collapse all' : 'Expand all'}
        </Button>
      </div>

      <div className="rounded-[var(--radius-card)] bg-white border border-ink-200/70 card-shadow overflow-x-auto">
        <div className="min-w-full p-6 inline-block">
          <div className="org-tree">
            <ul>
              <li>
                {/* Root: company */}
                <div className="org-node inline-flex items-center gap-2.5 rounded-2xl bg-signal text-white px-4 py-3 card-shadow">
                  <Slashes height={18} color="#fff" />
                  <div className="text-left">
                    <p className="font-display font-700 text-[15px] leading-tight">{COMPANY.name}</p>
                    <p className="text-[11.5px] text-white/70 leading-tight">{EMPLOYEES.length} people · {depts.length} {depts.length === 1 ? 'team' : 'teams'}</p>
                  </div>
                </div>

                <ul>
                  {depts.map((dept) => {
                    const team = EMPLOYEES.filter((e) => e.department === dept.id)
                    const lead = team.find((e) => e.isLead) ?? team[0]
                    const members = team.filter((e) => e.id !== lead?.id)
                    const open = expanded[dept.id]
                    return (
                      <li key={dept.id}>
                        <DeptNode dept={dept} count={team.length} leadName={lead?.firstName ?? '—'} expanded={open} onToggle={() => toggle(dept.id)} />
                        {open && lead && (
                          <ul>
                            <li>
                              <PersonNode e={lead} dim={!matches(lead)} />
                              {members.length > 0 && (
                                <ul>
                                  {members.map((m) => (
                                    <li key={m.id}><PersonNode e={m} dim={!matches(m)} /></li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
