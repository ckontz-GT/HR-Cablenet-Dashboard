import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, CalendarDays, BarChart3, Briefcase, ScanLine, Sparkles, ChevronRight, LogOut, Info } from 'lucide-react'
import { Logo } from './Logo'
import { useAssistant } from './AssistantProvider'
import { useAuth } from './AuthProvider'
import { clsx } from '../lib/clsx'
import { KPIS } from '../data/mockData'

const NAV = [
  {
    group: 'Workspace',
    items: [{ to: '/', label: 'Overview', icon: LayoutDashboard, end: true }],
  },
  {
    group: 'People',
    items: [
      { to: '/directory', label: 'Directory', icon: Users },
      { to: '/time-off', label: 'Time Off', icon: CalendarDays },
    ],
  },
  {
    group: 'Talent',
    items: [
      { to: '/recruiting', label: 'Recruiting', icon: Briefcase, badge: KPIS.openReqs },
      { to: '/cv-screening', label: 'CV Screening', icon: ScanLine },
    ],
  },
  {
    group: 'Insights',
    items: [{ to: '/analytics', label: 'Analytics', icon: BarChart3 }],
  },
]

function Item({ item, onNavigate }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) => clsx(
        'group relative flex items-center gap-3 rounded-xl px-3 h-10 text-[14px] font-500 transition-all',
        isActive ? 'bg-white/10 text-white' : 'text-white/65 hover:text-white hover:bg-white/5'
      )}
    >
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full accent-gradient" />}
          <Icon size={18} strokeWidth={2.1} className={isActive ? 'text-white' : 'text-white/70 group-hover:text-white'} />
          <span className="flex-1">{item.label}</span>
          {item.badge ? (
            <span className="min-w-5 h-5 px-1.5 grid place-items-center rounded-full bg-flare-500 text-white text-[11px] font-600 tnum">{item.badge}</span>
          ) : null}
        </>
      )}
    </NavLink>
  )
}

export function Sidebar({ onNavigate }) {
  const { setOpen } = useAssistant()
  const { logout } = useAuth()
  return (
    <div className="flex flex-col h-full bg-signal text-white">
      <div className="px-5 h-16 flex items-center shrink-0 border-b border-white/10">
        <Logo size={28} light />
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 flex flex-col gap-5">
        {NAV.map((section) => (
          <div key={section.group}>
            <p className="px-3 mb-1.5 text-[10.5px] font-600 uppercase tracking-[0.14em] text-white/35">{section.group}</p>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => <Item key={item.to} item={item} onNavigate={onNavigate} />)}
            </div>
          </div>
        ))}
      </nav>

      {/* Assistant CTA */}
      <div className="px-3 pb-3 shrink-0">
        <button
          onClick={() => setOpen(true)}
          className="w-full text-left rounded-2xl glass p-3.5 hover:bg-white/15 transition group"
        >
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center size-9 rounded-xl accent-gradient shrink-0"><Sparkles size={17} /></span>
            <div className="flex-1 min-w-0">
              <p className="font-display font-600 text-[14px] leading-tight">Ask HR</p>
              <p className="text-[12px] text-white/60 leading-tight truncate">Query your people data</p>
            </div>
            <ChevronRight size={16} className="text-white/50 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </div>

      {/* Mock-data notice */}
      <div className="px-3 pb-2 shrink-0">
        <div className="flex items-center gap-2 rounded-lg bg-flare-500/15 text-flare-300 px-2.5 py-1.5">
          <Info size={13} className="shrink-0" />
          <p className="text-[11px] leading-tight">Demo — all data is mock</p>
        </div>
      </div>

      <div className="px-4 py-3 shrink-0 border-t border-white/10 flex items-center gap-3">
        <span className="grid place-items-center size-9 rounded-full bg-white/15 text-white font-600 text-[13px]">CK</span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-500 leading-tight truncate">HR Admin</p>
          <p className="text-[12px] text-white/55 leading-tight truncate">People &amp; Culture</p>
        </div>
        <button onClick={logout} title="Sign out" aria-label="Sign out" className="grid place-items-center size-9 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition shrink-0">
          <LogOut size={17} />
        </button>
      </div>
    </div>
  )
}
