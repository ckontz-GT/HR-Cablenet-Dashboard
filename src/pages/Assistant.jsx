import { Sparkles, Users, CalendarClock, Briefcase, Search } from 'lucide-react'
import { Card, Eyebrow } from '../components/ui'
import { ChatView } from '../components/ChatView'
import { useAssistant } from '../components/AssistantProvider'
import { ragSuggestions } from '../lib/rag'

const CATEGORIES = [
  { icon: Users, label: 'People', qs: ['How many people work at Cablenet?', 'Show me the Network Engineering team', 'Find people who know fibre splicing'] },
  { icon: CalendarClock, label: 'Time off', qs: ["Who's on leave today?", 'How many pending leave requests?', 'What is the average leave balance?'] },
  { icon: Briefcase, label: 'Recruiting', qs: ['How many open roles do we have?', 'Who is in the Offer stage?', 'How many candidates are in the pipeline?'] },
]

export default function Assistant() {
  const { send } = useAssistant()
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-rise" style={{ minHeight: 'calc(100vh - 8rem)' }}>
      {/* Chat */}
      <Card className="xl:col-span-2 overflow-hidden flex flex-col">
        <div className="bg-signal text-white px-5 py-4 flex items-center gap-3 shrink-0">
          <span className="grid place-items-center size-10 rounded-xl glass"><Sparkles size={20} /></span>
          <div>
            <p className="font-display font-700 text-[16px] leading-tight">Cablenet HR Assistant</p>
            <p className="text-[12.5px] text-white/70">Retrieval over your live HR data</p>
          </div>
        </div>
        <div className="flex-1 min-h-0"><ChatView /></div>
      </Card>

      {/* Suggestions */}
      <div className="flex flex-col gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-ink-900"><Search size={16} className="text-brand-600" /><h3 className="font-display font-600 text-[15px]">What you can ask</h3></div>
          <p className="text-[13px] text-ink-500 mt-1.5 leading-relaxed">The assistant retrieves from the directory, time-off, recruiting and analytics data — then composes an answer with its sources.</p>
        </Card>

        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          return (
            <Card key={cat.label} className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="grid place-items-center size-8 rounded-lg bg-brand-50 text-brand-700"><Icon size={16} /></span>
                <Eyebrow>{cat.label}</Eyebrow>
              </div>
              <div className="flex flex-col gap-2">
                {cat.qs.map((q) => (
                  <button key={q} onClick={() => send(q)} className="text-left text-[13px] text-ink-700 bg-ink-50 hover:bg-brand-50 hover:text-brand-700 rounded-xl px-3 py-2 transition">{q}</button>
                ))}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
