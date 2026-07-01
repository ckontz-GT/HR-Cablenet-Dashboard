import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { ragQuery } from '../lib/rag'

const AssistantCtx = createContext(null)
export const useAssistant = () => useContext(AssistantCtx)

let msgId = 0
const greeting = {
  id: ++msgId,
  role: 'assistant',
  text: "Hi — I'm Signal, the Cablenet HR assistant. Ask me anything about your people, time off, recruiting or workforce data and I'll pull the answer straight from the dashboard.",
  sources: [],
  cards: [],
  chips: ['How many people work at Cablenet?', "Who's on leave today?", 'How many open roles?', 'Find people who know React'],
}

export function AssistantProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([greeting])
  const [thinking, setThinking] = useState(false)
  const timer = useRef(null)

  const send = useCallback((raw) => {
    const text = (raw ?? '').trim()
    if (!text || thinking) return
    setMessages((m) => [...m, { id: ++msgId, role: 'user', text }])
    setThinking(true)
    // simulate retrieval latency for a natural feel
    timer.current = setTimeout(() => {
      const res = ragQuery(text)
      setMessages((m) => [...m, { id: ++msgId, role: 'assistant', ...res }])
      setThinking(false)
    }, 480 + Math.min(700, text.length * 12))
  }, [thinking])

  const clear = useCallback(() => setMessages([greeting]), [])
  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <AssistantCtx.Provider value={{ open, setOpen, messages, send, thinking, clear }}>
      {children}
    </AssistantCtx.Provider>
  )
}
