import { useEffect } from 'react'
import { X, RotateCcw, Sparkles } from 'lucide-react'
import { useAssistant } from './AssistantProvider'
import { ChatView } from './ChatView'

export function ChatPanel() {
  const { open, setOpen, clear } = useAssistant()

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink-900/30 backdrop-blur-[2px] animate-scale-in" onClick={() => setOpen(false)} />
      <aside className="relative w-full max-w-[440px] h-full bg-white shadow-2xl flex flex-col animate-slide-in">
        <header className="shrink-0 bg-signal text-white px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center size-9 rounded-xl glass"><Sparkles size={18} /></span>
            <div>
              <p className="font-display font-600 text-[15px] leading-tight">Ask HR</p>
              <p className="text-[12px] text-white/70 leading-tight">Cablenet assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={clear} title="New chat" className="grid place-items-center size-9 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"><RotateCcw size={17} /></button>
            <button onClick={() => setOpen(false)} title="Close" className="grid place-items-center size-9 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"><X size={19} /></button>
          </div>
        </header>
        <div className="flex-1 min-h-0">
          <ChatView compact />
        </div>
      </aside>
    </div>
  )
}
