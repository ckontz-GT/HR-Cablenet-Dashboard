import { useState, useRef } from 'react'
import { ScanLine, Upload, FileText, Sparkles, Check, X, AlertTriangle, ChevronRight, RotateCcw, Briefcase, Trophy } from 'lucide-react'
import { Card, CardHeader, Pill, Button, Eyebrow } from '../components/ui'
import { Donut } from '../components/charts'
import { clsx } from '../lib/clsx'
import { ROLE_PROFILES, scoreCV, SAMPLE_CVS } from '../lib/cvScreen'
import { jobById } from '../data/mockData'

const FLAG_ICON = { good: Check, warn: AlertTriangle, crit: X }
const ROLE_IDS = Object.keys(ROLE_PROFILES)

export default function CVScreening() {
  const [jobId, setJobId] = useState(ROLE_IDS[0])
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef(null)
  const profile = ROLE_PROFILES[jobId]

  const run = () => {
    if (!text.trim()) return
    setBusy(true)
    setResult(null)
    setTimeout(() => { setResult(scoreCV(text, jobId)); setBusy(false) }, 650)
  }
  const loadSample = () => { setText(SAMPLE_CVS[jobId] ?? SAMPLE_CVS['JOB-304']); setResult(null) }
  const reset = () => { setText(''); setResult(null) }
  const onFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => { setText(String(reader.result || '')); setResult(null) }
    reader.readAsText(f)
  }

  return (
    <div className="flex flex-col gap-6 animate-rise">
      {/* Intro banner */}
      <Card className="bg-signal text-white border-0 overflow-hidden">
        <div className="p-5 flex items-center gap-4">
          <span className="grid place-items-center size-12 rounded-2xl glass shrink-0"><ScanLine size={24} /></span>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-700 text-lg leading-tight text-balance">Screen a CV against a role</h2>
            <p className="text-[13.5px] text-white/70 mt-1">Paste or upload a CV, pick the role, and get a transparent match score — every point traced to a requirement. Runs locally, no data leaves the page.</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Input */}
        <Card className="flex flex-col">
          <CardHeader title="Candidate CV" subtitle="Paste text or upload a .txt file" icon={FileText}
            action={text && <button onClick={reset} className="text-ink-400 hover:text-ink-700" title="Clear"><RotateCcw size={16} /></button>} />
          <div className="p-5 flex flex-col gap-4">
            <div>
              <Eyebrow className="mb-2">Screen for</Eyebrow>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ROLE_IDS.map((id) => {
                  const job = jobById(id)
                  const active = jobId === id
                  return (
                    <button key={id} onClick={() => { setJobId(id); setResult(null) }} className={clsx('text-left rounded-xl border p-3 transition', active ? 'border-brand-400 bg-brand-50 ring-2 ring-brand-100' : 'border-ink-200 hover:border-ink-300')}>
                      <div className="flex items-center gap-2">
                        <Briefcase size={15} className={active ? 'text-brand-700' : 'text-ink-400'} />
                        <span className={clsx('text-[13px] font-600', active ? 'text-brand-700' : 'text-ink-800')}>{ROLE_PROFILES[id].title}</span>
                      </div>
                      <p className="text-[11.5px] text-ink-500 mt-1">{job?.location} · {ROLE_PROFILES[id].minYears}y+ · {ROLE_PROFILES[id].mustHave.length} must-haves</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => { setText(e.target.value); setResult(null) }}
                placeholder="Paste the candidate's CV text here…"
                rows={9}
                className="w-full resize-y rounded-xl border border-ink-200 bg-ink-50 p-3.5 text-[13px] leading-relaxed text-ink-800 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition"
              />
              <span className="absolute bottom-3 right-3 text-[11px] text-ink-400 tnum">{(text.trim().match(/\S+/g) || []).length} words</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary" icon={Sparkles} onClick={run} disabled={!text.trim() || busy}>{busy ? 'Screening…' : 'Screen CV'}</Button>
              <Button variant="secondary" icon={Upload} onClick={() => fileRef.current?.click()}>Upload</Button>
              <input ref={fileRef} type="file" accept=".txt,.md,text/*" hidden onChange={onFile} />
              <Button variant="ghost" onClick={loadSample}>Load sample</Button>
            </div>
          </div>
        </Card>

        {/* Result */}
        <Card className="flex flex-col min-h-[420px]">
          <CardHeader title="Match report" subtitle={profile.title} icon={Trophy} />
          {!result && !busy && (
            <div className="flex-1 grid place-items-center text-center p-8">
              <div>
                <span className="grid place-items-center size-14 rounded-2xl bg-ink-100 text-ink-400 mx-auto"><ScanLine size={26} /></span>
                <p className="mt-3 font-500 text-ink-700">No CV screened yet</p>
                <p className="text-[13px] text-ink-500 mt-1 max-w-xs">Paste a CV and hit <span className="font-500">Screen CV</span>, or load a sample to see how scoring works.</p>
              </div>
            </div>
          )}
          {busy && (
            <div className="flex-1 grid place-items-center">
              <div className="flex flex-col items-center gap-3 text-ink-500">
                <span className="grid place-items-center size-12 rounded-2xl accent-gradient text-white animate-pulse-dot"><Sparkles size={22} /></span>
                <p className="text-[13px]">Extracting skills & scoring…</p>
              </div>
            </div>
          )}
          {result && <Report result={result} />}
        </Card>
      </div>
    </div>
  )
}

function Report({ result }) {
  const { total, band, tone, breakdown, mustMatched, mustMissing, niceMatched, parsed } = result
  const ringColor = { good: '#15b79e', brand: '#7c3aed', warn: '#f59e0b', crit: '#e5484d' }[tone]
  return (
    <div className="p-5 flex flex-col gap-5 animate-rise">
      {/* Score */}
      <div className="flex items-center gap-5">
        <Donut size={128} thickness={16} segments={[{ value: total, color: ringColor }, { value: 100 - total, color: '#eef0f4' }]}
          center={<div><p className="font-display font-700 text-3xl text-ink-900 tnum leading-none">{total}</p><p className="text-[10px] text-ink-400 mt-0.5">/ 100</p></div>} />
        <div className="flex-1">
          <Pill tone={tone}>{band}</Pill>
          <p className="text-[13px] text-ink-600 mt-2 leading-relaxed">
            Detected <span className="font-600 text-ink-900">{parsed.skills.length}</span> skills,
            <span className="font-600 text-ink-900"> {parsed.years || 0}y</span> experience
            {parsed.education ? ', a qualification' : ''}.
          </p>
        </div>
      </div>

      {/* Score breakdown */}
      <div>
        <Eyebrow className="mb-2.5">Score breakdown</Eyebrow>
        <div className="flex flex-col gap-2.5">
          {breakdown.map((b) => (
            <div key={b.label}>
              <div className="flex items-center justify-between text-[12.5px] mb-1">
                <span className="text-ink-600">{b.label} <span className="text-ink-400">· {b.detail}</span></span>
                <span className="font-600 text-ink-800 tnum">{b.got}/{b.max}</span>
              </div>
              <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden"><div className="h-full accent-gradient rounded-full transition-[width] duration-700" style={{ width: `${(b.got / b.max) * 100}%` }} /></div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Eyebrow className="mb-2">Matched must-haves</Eyebrow>
          <div className="flex flex-wrap gap-1.5">
            {mustMatched.length ? mustMatched.map((s) => <span key={s} className="inline-flex items-center gap-1 text-[12px] bg-good-50 text-good-700 rounded-lg px-2 py-1 font-500"><Check size={12} />{s}</span>) : <span className="text-[12.5px] text-ink-400">None</span>}
          </div>
        </div>
        <div>
          <Eyebrow className="mb-2">Missing must-haves</Eyebrow>
          <div className="flex flex-wrap gap-1.5">
            {mustMissing.length ? mustMissing.map((s) => <span key={s} className="inline-flex items-center gap-1 text-[12px] bg-crit-50 text-crit-700 rounded-lg px-2 py-1 font-500"><X size={12} />{s}</span>) : <span className="text-[12.5px] text-good-700">All present ✓</span>}
          </div>
        </div>
      </div>

      {niceMatched.length > 0 && (
        <div>
          <Eyebrow className="mb-2">Bonus skills</Eyebrow>
          <div className="flex flex-wrap gap-1.5">{niceMatched.map((s) => <span key={s} className="text-[12px] bg-brand-50 text-brand-700 rounded-lg px-2 py-1 font-500">{s}</span>)}</div>
        </div>
      )}

      {/* Flags */}
      <div>
        <Eyebrow className="mb-2">Signals</Eyebrow>
        <div className="flex flex-col gap-1.5">
          {result.flags?.length ? result.flags.map((f, i) => {
            const Icon = FLAG_ICON[f.tone]
            return (
              <div key={i} className={clsx('flex items-center gap-2 text-[13px] rounded-lg px-3 py-2',
                f.tone === 'good' ? 'bg-good-50 text-good-700' : f.tone === 'warn' ? 'bg-warn-50 text-warn-700' : 'bg-crit-50 text-crit-700')}>
                <Icon size={15} className="shrink-0" />{f.text}
              </div>
            )
          }) : <p className="text-[13px] text-ink-500">No notable flags.</p>}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="primary" icon={ChevronRight} className="flex-row-reverse flex-1">Advance to screening</Button>
        <Button variant="secondary">Reject</Button>
      </div>
    </div>
  )
}
