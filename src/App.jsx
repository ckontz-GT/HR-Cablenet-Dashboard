import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import { AssistantProvider } from './components/AssistantProvider'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { ChatPanel } from './components/ChatPanel'
import { Logo } from './components/Logo'

import Overview from './pages/Overview'
import Directory from './pages/Directory'
import Profile from './pages/Profile'
import TimeOff from './pages/TimeOff'
import Analytics from './pages/Analytics'
import Recruiting from './pages/Recruiting'
import CVScreening from './pages/CVScreening'
import Assistant from './pages/Assistant'

const META = {
  '/': { title: 'Overview', subtitle: 'Your people at a glance — Tuesday, 30 June 2026' },
  '/directory': { title: 'People Directory', subtitle: 'Everyone at Cablenet' },
  '/time-off': { title: 'Time Off & Attendance', subtitle: 'Leave requests, balances and who’s out' },
  '/recruiting': { title: 'Recruiting & Onboarding', subtitle: 'Open roles, pipeline and new starters' },
  '/cv-screening': { title: 'CV Screening', subtitle: 'Score candidates against a role profile' },
  '/analytics': { title: 'Workforce Analytics', subtitle: 'Headcount, attrition and diversity' },
  '/assistant': { title: 'HR Assistant', subtitle: 'Ask anything about your people data' },
}

export default function App() {
  const [mobileNav, setMobileNav] = useState(false)
  const { pathname } = useLocation()
  const meta = META[pathname] ?? (pathname.startsWith('/directory/')
    ? { title: 'Employee Profile', subtitle: 'Everything about this person' }
    : { title: 'Cablenet HR' })

  return (
    <AssistantProvider>
      <div className="min-h-screen flex bg-ink-50">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-64 shrink-0 fixed inset-y-0 left-0 z-30">
          <Sidebar />
        </aside>

        {/* Mobile drawer */}
        {mobileNav && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-[2px]" onClick={() => setMobileNav(false)} />
            <div className="relative w-64 h-full animate-slide-in" style={{ animationName: 'none' }}>
              <Sidebar onNavigate={() => setMobileNav(false)} />
              <button onClick={() => setMobileNav(false)} className="absolute -right-12 top-4 grid place-items-center size-10 rounded-xl bg-white/10 text-white"><X size={20} /></button>
            </div>
          </div>
        )}

        <div className="flex-1 lg:ml-64 min-w-0 flex flex-col">
          <Topbar title={meta.title} subtitle={meta.subtitle} onMenu={() => setMobileNav(true)} />
          <main className="flex-1 px-4 lg:px-7 py-6 max-w-[1500px] w-full mx-auto">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/directory" element={<Directory />} />
              <Route path="/directory/:id" element={<Profile />} />
              <Route path="/time-off" element={<TimeOff />} />
              <Route path="/recruiting" element={<Recruiting />} />
              <Route path="/cv-screening" element={<CVScreening />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>

        <ChatPanel />
      </div>
    </AssistantProvider>
  )
}

function NotFound() {
  return (
    <div className="grid place-items-center py-24 text-center">
      <Logo size={40} />
      <p className="mt-4 font-display font-600 text-ink-900 text-xl">Page not found</p>
      <p className="text-ink-500 mt-1">That route doesn’t exist in this MVP.</p>
    </div>
  )
}
