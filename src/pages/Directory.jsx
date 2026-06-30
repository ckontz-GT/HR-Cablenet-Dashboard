import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, LayoutGrid, List, Network, X, MapPin, Users2, ChevronRight, Minimize2, Sparkles } from 'lucide-react'
import { Card, Pill, Avatar, Button, STATUS_TONE } from '../components/ui'
import { OrgCanvas } from '../components/OrgChart'
import { Slashes } from '../components/Logo'
import { useAssistant } from '../components/AssistantProvider'
import { clsx } from '../lib/clsx'
import { EMPLOYEES, DEPARTMENTS } from '../data/mockData'

export default function Directory() {
  const navigate = useNavigate()
  const { setOpen } = useAssistant()
  const [query, setQuery] = useState('')
  const [dept, setDept] = useState('all')
  const [status, setStatus] = useState('all')
  const [view, setView] = useState('org') // graph is the default view

  const open = (id) => navigate(`/directory/${id}`)

  // Esc exits the full-screen graph
  useEffect(() => {
    if (view !== 'org') return
    const onKey = (e) => { if (e.key === 'Escape') setView('grid') }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [view])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return EMPLOYEES.filter((e) => {
      if (dept !== 'all' && e.department !== dept) return false
      if (status !== 'all' && e.status !== status) return false
      if (q && !(`${e.name} ${e.title} ${e.location} ${e.skills.join(' ')}`.toLowerCase().includes(q))) return false
      return true
    })
  }, [query, dept, status])

  // ---- Full-screen graph mode ------------------------------------------------
  if (view === 'org') {
    return (
      <div className="fixed inset-0 z-40 bg-ink-50 flex flex-col animate-scale-in">
        <header className="h-15 shrink-0 border-b border-ink-200 bg-white flex items-center gap-3 px-4 py-2.5">
          <div className="flex items-center gap-2.5 shrink-0">
            <Slashes height={18} />
            <div className="leading-tight">
              <p className="font-display font-700 text-ink-900 text-[15px]">Org chart</p>
              <p className="text-[11.5px] text-ink-500">{EMPLOYEES.length} people · {DEPARTMENTS.length} teams</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 flex-1 max-w-xl ml-3">
            <div className="flex items-center gap-2 rounded-xl border border-ink-200 bg-ink-50 h-10 px-3 flex-1 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
              <Search size={16} className="text-ink-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Highlight people…" className="flex-1 bg-transparent outline-none text-[13.5px] text-ink-800 placeholder:text-ink-400" />
              {query && <button onClick={() => setQuery('')} aria-label="Clear"><X size={15} className="text-ink-400 hover:text-ink-700" /></button>}
            </div>
            <Select value={dept} onChange={setDept} compact options={[{ v: 'all', l: 'All teams' }, ...DEPARTMENTS.map((d) => ({ v: d.id, l: d.name }))]} />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={Sparkles} className="hidden sm:inline-flex" onClick={() => setOpen(true)}>Ask HR</Button>
            <Button variant="dark" size="sm" icon={Minimize2} onClick={() => setView('grid')}>Exit graph view</Button>
          </div>
        </header>

        <div className="flex-1 min-h-0">
          <OrgCanvas deptFilter={dept} query={query} />
        </div>
      </div>
    )
  }

  // ---- Standard directory (grid / list) -------------------------------------
  return (
    <div className="flex flex-col gap-5 animate-rise">
      <Card className="p-3">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="flex items-center gap-2 rounded-xl border border-ink-200 bg-ink-50 h-11 px-3 flex-1 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
            <Search size={18} className="text-ink-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, role, skill or location…" className="flex-1 bg-transparent outline-none text-[14px] text-ink-800 placeholder:text-ink-400" />
            {query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={16} className="text-ink-400 hover:text-ink-700" /></button>}
          </div>
          <div className="flex items-center gap-2">
            <Select value={dept} onChange={setDept} options={[{ v: 'all', l: 'All teams' }, ...DEPARTMENTS.map((d) => ({ v: d.id, l: d.name }))]} />
            <Select value={status} onChange={setStatus} options={[{ v: 'all', l: 'Any status' }, { v: 'Active', l: 'Active' }, { v: 'On leave', l: 'On leave' }, { v: 'Onboarding', l: 'Onboarding' }]} />
            <div className="flex rounded-xl border border-ink-200 bg-white p-0.5 h-11">
              {[['grid', LayoutGrid, 'Grid'], ['list', List, 'List'], ['org', Network, 'Org chart']].map(([v, Icon, label]) => (
                <button key={v} onClick={() => setView(v)} title={label} aria-label={label} className={clsx('grid place-items-center w-10 rounded-lg transition', view === v ? 'bg-brand-50 text-brand-700' : 'text-ink-400 hover:text-ink-700')}><Icon size={18} /></button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between px-1">
        <p className="text-[13px] text-ink-500"><span className="font-600 text-ink-800 tnum">{filtered.length}</span> of {EMPLOYEES.length} people</p>
        <button onClick={() => setView('org')} className="text-[13px] font-500 text-brand-700 hover:underline inline-flex items-center gap-1.5"><Network size={15} />Open org chart</button>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filtered.map((e) => (
            <button key={e.id} onClick={() => open(e.id)} className="text-left">
              <Card className="p-4 hover:border-brand-300 hover:-translate-y-0.5 transition-all h-full">
                <div className="flex items-start gap-3">
                  <Avatar name={e.name} initials={e.initials} hue={e.hue} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="font-600 text-ink-900 text-[15px] truncate">{e.name}</p>
                    <p className="text-[13px] text-ink-500 truncate">{e.title}</p>
                  </div>
                  <Pill tone={STATUS_TONE[e.status]} dot>{e.status}</Pill>
                </div>
                <div className="flex items-center gap-1.5 mt-3 text-[12.5px] text-ink-500">
                  <MapPin size={13} /> {e.location}
                  <span className="text-ink-300">·</span>
                  <span className="truncate">{e.departmentName}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {e.skills.slice(0, 3).map((s) => <span key={s} className="text-[11px] bg-ink-100 text-ink-600 rounded-md px-1.5 py-0.5">{s}</span>)}
                  {e.skills.length > 3 && <span className="text-[11px] text-ink-400 px-1 py-0.5">+{e.skills.length - 3}</span>}
                </div>
              </Card>
            </button>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-ink-400 border-b border-ink-200">
                  <th className="font-600 px-5 py-3">Name</th>
                  <th className="font-600 px-3 py-3">Team</th>
                  <th className="font-600 px-3 py-3 hidden md:table-cell">Location</th>
                  <th className="font-600 px-3 py-3 hidden lg:table-cell">Tenure</th>
                  <th className="font-600 px-3 py-3">Status</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} onClick={() => open(e.id)} className="border-b border-ink-100 last:border-0 hover:bg-ink-50 cursor-pointer transition">
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={e.name} initials={e.initials} hue={e.hue} size={34} />
                        <div><p className="text-[13.5px] font-500 text-ink-900">{e.name}</p><p className="text-[12px] text-ink-500">{e.title}</p></div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-[13px] text-ink-600">{e.departmentName}</td>
                    <td className="px-3 py-2.5 text-[13px] text-ink-600 hidden md:table-cell">{e.location}</td>
                    <td className="px-3 py-2.5 text-[13px] text-ink-600 tnum hidden lg:table-cell">{e.tenureYears}y</td>
                    <td className="px-3 py-2.5"><Pill tone={STATUS_TONE[e.status]} dot>{e.status}</Pill></td>
                    <td className="px-3 py-2.5 text-ink-300"><ChevronRight size={16} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {filtered.length === 0 && (
        <div className="grid place-items-center py-16 text-center">
          <Users2 size={32} className="text-ink-300" />
          <p className="mt-3 font-500 text-ink-700">No people match those filters</p>
          <p className="text-[13px] text-ink-500">Try clearing the search or status filter.</p>
        </div>
      )}
    </div>
  )
}

function Select({ value, onChange, options, compact }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={clsx('appearance-none rounded-xl border border-ink-200 bg-white pl-3 pr-9 text-[13.5px] text-ink-700 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 cursor-pointer', compact ? 'h-10' : 'h-11')}>
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
      <ChevronRight size={15} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-ink-400 pointer-events-none" />
    </div>
  )
}
