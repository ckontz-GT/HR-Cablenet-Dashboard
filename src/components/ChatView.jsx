import { useState, useRef, useEffect } from 'react'
import { Send, MessageCircle, FileText, Briefcase, CalendarClock, User } from 'lucide-react'
import { useAssistant } from './AssistantProvider'
import { Avatar, Pill, STAGE_TONE } from './ui'
import { SignalMark } from './Logo'
import { clsx } from '../lib/clsx'

function ResultCard({ card }) {
  if (card.type === 'employee') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-2.5">
        <Avatar name={card.name} initials={card.initials} hue={card.hue} size={36} />
        <div className="min-w-0">
          <p className="text-[13px] font-600 text-ink-900 truncate">{card.name}</p>
          <p className="text-[12px] text-ink-500 truncate">{card.title} · {card.dept}</p>
        </div>
      </div>
    )
  }
  if (card.type === 'stat') {
    return (
      <div className="rounded-xl border border-ink-200 bg-white px-3 py-2.5">
        <p className="text-[11px] text-ink-500 leading-tight">{card.label}</p>
        <p className="font-display font-700 text-ink-900 text-lg tnum mt-0.5">{card.value}</p>
      </div>
    )
  }
  if (card.type === 'job') {
    return (
      <div className="rounded-xl border border-ink-200 bg-white p-2.5">
        <div className="flex items-center gap-2"><Briefcase size={14} className="text-brand-600" /><p className="text-[13px] font-600 text-ink-900 truncate">{card.title}</p></div>
        <p className="text-[12px] text-ink-500 mt-1">{card.dept} · {card.openings} seat(s) · {card.applicants} applicants</p>
      </div>
    )
  }
  if (card.type === 'candidate') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-2.5">
        <Avatar name={card.name} initials={card.initials} hue={card.hue} size={34} />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-600 text-ink-900 truncate">{card.name}</p>
          <p className="text-[12px] text-ink-500 truncate">{card.role}</p>
        </div>
        <Pill tone={STAGE_TONE[card.stage]}>{card.stage}</Pill>
      </div>
    )
  }
  if (card.type === 'leave') {
    return (
      <div className="rounded-xl border border-ink-200 bg-white p-2.5">
        <div className="flex items-center gap-2"><CalendarClock size={14} className="text-warn-500" /><p className="text-[13px] font-600 text-ink-900 truncate">{card.name}</p></div>
        <p className="text-[12px] text-ink-500 mt-1">{card.kind} · {card.days}d · {card.when}</p>
      </div>
    )
  }
  return null
}

function Message({ m, onChip }) {
  const isUser = m.role === 'user'
  return (
    <div className={clsx('flex gap-2.5 animate-rise', isUser ? 'flex-row-reverse' : '')}>
      {!isUser && (
        <span className="shrink-0 mt-0.5"><SignalMark size={28} /></span>
      )}
      <div className={clsx('max-w-[85%] min-w-0', isUser && 'flex flex-col items-end')}>
        <div className={clsx('rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed',
          isUser ? 'bg-brand-700 text-white rounded-tr-sm' : 'bg-ink-100 text-ink-800 rounded-tl-sm')}>
          {m.text}
        </div>
        {m.cards?.length > 0 && (
          <div className="grid grid-cols-1 gap-1.5 mt-2 w-full">
            {m.cards.map((c, i) => <ResultCard key={i} card={c} />)}
          </div>
        )}
        {m.sources?.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[10px] uppercase tracking-wider text-ink-400 font-600">Sources</span>
            {m.sources.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-[11px] text-ink-500 bg-ink-100 rounded-md px-1.5 py-0.5"><FileText size={10} />{s}</span>
            ))}
          </div>
        )}
        {m.chips?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {m.chips.map((c, i) => (
              <button key={i} onClick={() => onChip(c)} className="text-[12px] text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-full px-2.5 py-1 transition-colors text-left">{c}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function ChatView({ compact = false }) {
  const { messages, send, thinking } = useAssistant()
  const [draft, setDraft] = useState('')
  const endRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  const submit = (e) => { e?.preventDefault(); send(draft); setDraft('') }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {messages.map((m) => <Message key={m.id} m={m} onChip={(c) => send(c)} />)}
        {thinking && (
          <div className="flex gap-2.5 items-center">
            <SignalMark size={28} />
            <div className="bg-ink-100 rounded-2xl rounded-tl-sm px-3.5 py-3 flex gap-1">
              {[0, 1, 2].map((i) => <span key={i} className="size-1.5 rounded-full bg-ink-400 animate-pulse-dot" style={{ animationDelay: `${i * 0.2}s` }} />)}
            </div>
          </div>
        )}
      </div>
      <form onSubmit={submit} className="shrink-0 border-t border-ink-200 p-3 bg-white">
        <div className="flex items-end gap-2 rounded-xl border border-ink-200 bg-ink-50 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition-all px-2 py-1.5">
          <MessageCircle size={16} className="text-brand-500 mb-2 ml-1 shrink-0" />
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) submit(e) }}
            placeholder="Ask about people, time off, recruiting…"
            rows={1}
            className="flex-1 resize-none bg-transparent outline-none text-[14px] text-ink-800 placeholder:text-ink-400 py-1.5 max-h-28"
          />
          <button type="submit" disabled={!draft.trim() || thinking} aria-label="Send"
            className="grid place-items-center size-9 rounded-lg accent-gradient text-white disabled:opacity-40 hover:brightness-110 transition shrink-0">
            <Send size={16} />
          </button>
        </div>
        <p className="text-[10.5px] text-ink-400 mt-1.5 text-center">Answers are generated locally from your Cablenet HR data.</p>
      </form>
    </div>
  )
}
