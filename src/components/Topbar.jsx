import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Sparkles, Menu, Plus } from 'lucide-react'
import { useAssistant } from './AssistantProvider'
import { Button, IconButton } from './ui'

export function Topbar({ title, subtitle, onMenu }) {
  const { setOpen, send } = useAssistant()
  const navigate = useNavigate()
  const [q, setQ] = useState('')

  const ask = (e) => {
    e.preventDefault()
    if (!q.trim()) { setOpen(true); return }
    send(q)
    setOpen(true)
    setQ('')
  }

  return (
    <header className="sticky top-0 z-30 bg-ink-50/80 backdrop-blur-md border-b border-ink-200/70">
      <div className="h-16 px-4 lg:px-7 flex items-center gap-3">
        <button onClick={onMenu} className="lg:hidden grid place-items-center size-10 rounded-xl text-ink-600 hover:bg-ink-100" aria-label="Open menu"><Menu size={20} /></button>

        <div className="min-w-0 hidden sm:block">
          <h1 className="font-display font-700 text-ink-900 text-[19px] leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-[13px] text-ink-500 leading-tight truncate">{subtitle}</p>}
        </div>

        <form onSubmit={ask} className="ml-auto flex-1 max-w-md hidden md:block">
          <div className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white h-10 px-3 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
            <Search size={17} className="text-ink-400 shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search people or ask HR…"
              className="flex-1 bg-transparent outline-none text-[14px] text-ink-800 placeholder:text-ink-400 min-w-0"
            />
            <kbd className="hidden lg:inline text-[10px] text-ink-400 bg-ink-100 rounded px-1.5 py-0.5 font-mono">↵</kbd>
          </div>
        </form>

        <div className="flex items-center gap-1 ml-auto md:ml-0">
          <Button variant="primary" size="sm" icon={Sparkles} className="hidden sm:inline-flex" onClick={() => setOpen(true)}>Ask HR</Button>
          <IconButton icon={Search} label="Search" className="md:hidden" onClick={() => setOpen(true)} />
          <div className="relative">
            <IconButton icon={Bell} label="Notifications" />
            <span className="absolute top-2 right-2.5 size-2 rounded-full bg-flare-500 ring-2 ring-ink-50" />
          </div>
        </div>
      </div>
    </header>
  )
}
