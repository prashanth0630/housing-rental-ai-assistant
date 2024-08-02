import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { ChatAPI, type Chat, type Message } from '../lib/api'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import { apiErrorMessage } from '../lib/errors'

export default function ChatPage() {
  const { t } = useTranslation()
  const [chats, setChats] = useState<Chat[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [history, setHistory] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [creating, setCreating] = useState(false)
  const [sending, setSending] = useState(false)
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login')
    }
  }, [navigate])

  const refreshChats = useCallback(async () => {
    try {
      const data = await ChatAPI.list()
      setChats(data)
      setActiveId((current) => current ?? data[0]?.id ?? null)
    } catch (e: unknown) {
      toast.error(apiErrorMessage(e, '获取会话失败'))
    }
  }, [])

  useEffect(() => {
    refreshChats()
  }, [refreshChats])

  useEffect(() => {
    if (activeId) {
      ChatAPI.history(activeId)
        .then(setHistory)
        .catch((e: unknown) => toast.error(apiErrorMessage(e, '获取历史失败')))
    } else {
      setHistory([])
    }
  }, [activeId])

  // 自动滚动到底部
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [history])

  async function onCreate() {
    try {
      setCreating(true)
      const title = `${t('chat.list')} ${new Date().toLocaleTimeString()}`
      const chat = await ChatAPI.create(title)
      await refreshChats()
      setActiveId(chat.id)
    } catch (e: unknown) {
      toast.error(apiErrorMessage(e, '创建会话失败'))
    } finally {
      setCreating(false)
    }
  }

  async function onSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || !activeId) return
    const content = input.trim()
    // 乐观更新：先把用户消息插入本地历史
    const tempUserId = Date.now() * -1
    const tempAssistantId = Date.now() * -1 - 1
    const userMessage: Message = { id: tempUserId, chatId: activeId, role: 'user', content }
    const assistantMessage: Message = { id: tempAssistantId, chatId: activeId, role: 'assistant', content: '' }
    setHistory((prev) => [...prev, userMessage, assistantMessage])
    setInput('')
    setSending(true)
    
    try {
      let doneHandled = false
      let streamError: Error | null = null

      await ChatAPI.stream(
        activeId,
        content,
        (token) => {
          setHistory((prev) =>
            prev.map((m) =>
              m.id === tempAssistantId ? { ...m, content: `${m.content}${token}` } : m
            )
          )

          requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
          })
        },
        () => {
          if (doneHandled) return
          doneHandled = true
          setSending(false)
          ChatAPI.history(activeId)
            .then(setHistory)
            .catch((e: unknown) => toast.error(apiErrorMessage(e, '获取历史失败')))
        },
        (error) => {
          streamError = error
        }
      )

      if (streamError) {
        throw streamError
      }
    } catch (e: unknown) {
      setHistory((prev) => prev.filter((m) => m.id !== tempUserId && m.id !== tempAssistantId))
      setSending(false)
      toast.error(apiErrorMessage(e, t('chat.sendFail')))
    }
  }

  const activeChat = useMemo(() => chats.find((c) => c.id === activeId) || null, [chats, activeId])

  return (
    <div className="grid grid-cols-12 gap-4">
      <aside className="col-span-3 border rounded-lg bg-white p-3 h-[70vh] flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{t('chat.list')}</h3>
          <button onClick={onCreate} disabled={creating} className="text-sm px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{t('chat.create')}</button>
        </div>
        <div className="overflow-auto space-y-1">
          {chats.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`w-full text-left px-3 py-2 rounded border ${activeId === c.id ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-slate-50'}`}
            >
              <div className="text-sm font-medium truncate">{c.title}</div>
              <div className="text-xs text-slate-500">#{c.id}</div>
            </button>
          ))}
          {!chats.length && <div className="text-sm text-slate-500">{t('chat.none')}</div>}
        </div>
      </aside>

      <section className="col-span-9 border rounded-lg bg-white p-3 h-[70vh] flex flex-col">
        <div className="mb-2 font-semibold">{activeChat ? activeChat.title : t('chat.pick')}</div>
        <div className="flex-1 overflow-auto space-y-3">
          {history.map((m) => (
            <div key={m.id} className={`max-w-[80%] px-3 py-2 rounded ${m.role === 'user' ? 'bg-blue-600 text-white ml-auto' : 'bg-slate-100'}`}>
              <div className="text-xs opacity-70 mb-1">{m.role}</div>
              {m.role === 'user' ? (
                <div className="whitespace-pre-wrap break-words">{m.content}</div>
              ) : (
                <div className="prose prose-sm max-w-none break-words">
                  <ReactMarkdown>{m.content || (sending ? '...' : '')}</ReactMarkdown>
                </div>
              )}
            </div>
          ))}
          {!history.length && <div className="text-sm text-slate-500">{t('chat.start')}</div>}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={onSend} className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
            placeholder={t('chat.placeholder')}
          />
          <button disabled={!activeId || sending} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{t('chat.send')}</button>
        </form>
      </section>
    </div>
  )
}


