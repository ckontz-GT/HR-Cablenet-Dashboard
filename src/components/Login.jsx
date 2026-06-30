import { useState } from 'react'
import { User, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Info } from 'lucide-react'
import { useAuth } from './AuthProvider'
import { Logo, Slashes } from './Logo'
import { Button } from './ui'

const MOCK_NOTE = 'This is a demo. Everything you see is mock, randomly-generated data — no real employee information.'

export function Login() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (!login(username.trim(), password)) {
      setError(true)
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen flex bg-ink-50">
      {/* Brand panel */}
      <div className="hidden lg:flex w-[46%] bg-signal bg-signal-animated text-white flex-col justify-between p-10 relative overflow-hidden">
        <Logo size={30} light />
        <div className="max-w-md">
          <p className="text-[11px] font-600 uppercase tracking-[0.18em] text-white/50">People &amp; Culture</p>
          <h1 className="font-display font-700 text-4xl leading-tight mt-3 text-balance">The HR command centre for Cablenet.</h1>
          <p className="text-white/70 mt-4 leading-relaxed">Directory, time off, recruiting, CV screening, workforce analytics and an HR assistant — in one place.</p>
        </div>
        <div className="glass rounded-2xl p-4 flex items-start gap-3 max-w-md">
          <Info size={18} className="text-flare-300 shrink-0 mt-0.5" />
          <p className="text-[13px] text-white/85 leading-relaxed">{MOCK_NOTE}</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 grid place-items-center p-6">
        <div className="w-full max-w-sm animate-rise">
          <div className="lg:hidden mb-8 flex justify-center"><Logo size={30} /></div>

          <div className="flex items-center gap-2.5 mb-1">
            <Slashes height={20} />
            <h2 className="font-display font-700 text-ink-900 text-2xl">Sign in</h2>
          </div>
          <p className="text-ink-500 text-[14px] mb-7">Welcome back. Sign in to the Cablenet HR dashboard.</p>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <Field label="Username">
              <span className="grid place-items-center text-ink-400 pl-3"><User size={17} /></span>
              <input
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(false) }}
                autoFocus
                autoComplete="username"
                placeholder="Enter your username"
                className="flex-1 bg-transparent outline-none text-[14px] text-ink-900 placeholder:text-ink-400 px-2.5 py-3"
              />
            </Field>

            <Field label="Password">
              <span className="grid place-items-center text-ink-400 pl-3"><Lock size={17} /></span>
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false) }}
                autoComplete="current-password"
                placeholder="Enter your password"
                className="flex-1 bg-transparent outline-none text-[14px] text-ink-900 placeholder:text-ink-400 px-2.5 py-3"
              />
              <button type="button" onClick={() => setShow((s) => !s)} className="grid place-items-center text-ink-400 hover:text-ink-700 pr-3" aria-label={show ? 'Hide password' : 'Show password'}>
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </Field>

            {error && (
              <div className="flex items-center gap-2 text-[13px] text-crit-700 bg-crit-50 rounded-xl px-3 py-2.5 ring-1 ring-inset ring-crit-500/30">
                <AlertCircle size={16} className="shrink-0" /> Incorrect username or password.
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" icon={ArrowRight} className="flex-row-reverse mt-1">Sign in</Button>
          </form>

          <div className="mt-7 flex items-start gap-2.5 text-[12.5px] text-ink-500 bg-ink-100/70 rounded-xl px-3.5 py-3">
            <Info size={15} className="text-brand-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{MOCK_NOTE}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[12px] font-600 text-ink-600 mb-1.5 block">{label}</span>
      <div className="flex items-center rounded-xl border border-ink-200 bg-white focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
        {children}
      </div>
    </label>
  )
}
