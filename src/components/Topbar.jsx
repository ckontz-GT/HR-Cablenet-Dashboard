import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Sparkles, Menu, CornerDownLeft } from 'lucide-react'
import { useAssistant } from './AssistantProvider'
import { Button, IconButton, Avatar } from './ui'
import { EMPLOYEES, departmentById } from '../data/mockData'

export function Topbar({ title, subtitle, onMenu }) {
  const { setOpen, send } = useAssistant()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [focused, setFocused] = useState(false)

  // Live people search — matches name, title, department or a skill.
  const term = q.trim().toLowerCase()
  const results = term
    ? EMPLOYEES.filter((e) =>
        e.name.toLowerCase().includes(term) ||
        e.title.toLowerCase().includes(term) ||
        (e.departmentName || '').toLowerCase().includes(term) ||
        (e.skills || []).some((s) => s.toLowerCase().includes(term)),
      ).slice(0, 6)
    : []

  const go = (id) => { navigate(`/directory/${id}`); setQ(''); setFocused(false) }

  const onSubmit = (e) => {
    e.preventDefault()
    if (!term) { setOpen(true); return }
    if (results.length) { go(results[0].id); return }
    // No people match → hand the query to the HR assistant instead.
    send(q); setOpen(true); setQ('')
  }

  const showDrop = focused && term.length > 0

  return (
    <header className="sticky top-0 z-30 bg-ink-50/80 backdrop-blur-md border-b border-ink-200/70">
      <div className="h-16 px-4 lg:px-7 flex items-center gap-3">
        <button onClick={onMenu} className="lg:hidden grid place-items-center size-10 rounded-xl text-ink-600 hover:bg-ink-100" aria-label="Open menu"><Menu size={20} /></button>

        <div className="min-w-0 hidden sm:block">
          <h1 className="font-display font-700 text-ink-900 text-[19px] leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-[13px] text-ink-500 leading-tight truncate">{subtitle}</p>}
        </div>

        <form onSubmit={onSubmit} className="ml-auto flex-1 max-w-md hidden md:block relative">
          <div className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white h-10 px-3 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
            <Search size={17} className="text-ink-400 shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder="Search people or ask HR…"
              className="flex-1 bg-transparent outline-none text-[14px] text-ink-800 placeholder:text-ink-400 min-w-0"
            />
            <kbd className="hidden lg:inline text-[10px] text-ink-400 bg-ink-100 rounded px-1.5 py-0.5 font-mono">↵</kbd>
          </div>

          {showDrop && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-ink-200 card-shadow overflow-hidden z-40">
              {results.length > 0 ? (
                <>
                  <p className="px-3 pt-2.5 pb-1 text-[11px] font-600 uppercase tracking-wide text-ink-400">People</p>
                  {results.map((e) => {
                    const dept = departmentById(e.department)
                    return (
                      <button
                        type="button"
                        key={e.id}
                        onMouseDown={(ev) => { ev.preventDefault(); go(e.id) }}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-ink-50 transition text-left"
                      >
                        <Avatar name={e.name} initials={e.initials} hue={e.hue} size={32} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[13.5px] font-500 text-ink-900 truncate">{e.name}</p>
                          <p className="text-[12px] text-ink-500 truncate">{e.title} · {dept?.short ?? e.departmentName}</p>
                        </div>
                      </button>
                    )
                  })}
                </>
              ) : (
                <button
                  type="button"
                  onMouseDown={(ev) => { ev.preventDefault(); send(q); setOpen(true); setQ('') }}
                  className="w-full flex items-center gap-2.5 px-3 py-3 hover:bg-ink-50 transition text-left"
                >
                  <span className="grid place-items-center size-8 rounded-lg bg-brand-50 text-brand-600 shrink-0"><Sparkles size={15} /></span>
                  <span className="text-[13px] text-ink-700">No people match — <span className="font-600 text-ink-900">ask HR</span> “{q}”</span>
                </button>
              )}
              {results.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-2 border-t border-ink-100 text-[11.5px] text-ink-400">
                  <CornerDownLeft size={12} /> Enter to open · or <button type="button" onMouseDown={(ev) => { ev.preventDefault(); send(q); setOpen(true); setQ('') }} className="text-brand-600 font-500 hover:underline">ask HR instead</button>
                </div>
              )}
            </div>
          )}
        </form>

        <div className="flex items-center gap-1 ml-auto md:ml-0">
          <Button variant="primary" size="sm" icon={Sparkles} className="hidden sm:inline-flex" onClick={() => setOpen(true)}>Ask HR</Button>
          <IconButton icon={Search} label="Search" className="md:hidden" onClick={() => setOpen(true)} />
          <div className="relative">
            <IconButton icon={Bell} label="Needs attention" onClick={() => navigate('/')} />
            <span className="absolute top-2 right-2.5 size-2 rounded-full bg-flare-500 ring-2 ring-ink-50" />
          </div>
        </div>
      </div>
    </header>
  )
}
