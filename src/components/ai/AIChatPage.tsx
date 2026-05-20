'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Trash2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED_PROMPTS = [
  'What should I eat to build muscle?',
  'Create a push day workout for me',
  'How many calories should I eat to lose weight?',
  'What are the best post-workout foods?',
  'Explain the benefits of intermittent fasting',
  'How do I calculate my macros?',
]

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text?: string) => {
    const content = text || input.trim()
    if (!content || loading) return

    const userMsg: Message = { role: 'user', content }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      })

      if (!response.ok) throw new Error('Failed')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')

      let assistantMsg = ''
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              const delta = parsed.choices?.[0]?.delta?.content || ''
              assistantMsg += delta
              setMessages((prev) => {
                const newMsgs = [...prev]
                newMsgs[newMsgs.length - 1] = { role: 'assistant', content: assistantMsg }
                return newMsgs
              })
            } catch {}
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I ran into an error. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/20">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-zinc-100 mb-2">AI Fitness Coach</h2>
            <p className="text-zinc-400 text-sm max-w-sm mb-8">
              Ask me anything about nutrition, workouts, weight loss, muscle building, or your fitness journey.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="flex items-center gap-2 p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-left text-sm text-zinc-300 transition-all group"
                >
                  <Zap className="w-3.5 h-3.5 text-violet-400 shrink-0 group-hover:text-violet-300" />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'assistant'
                      ? 'bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md shadow-violet-500/20'
                      : 'bg-zinc-700'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <Bot className="w-4 h-4 text-white" />
                  ) : (
                    <User className="w-4 h-4 text-zinc-300" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-violet-600 text-white rounded-tr-sm'
                      : 'bg-zinc-800 text-zinc-100 rounded-tl-sm'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-headings:my-2">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/20">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-zinc-800 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1.5 items-center h-5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-950/50 backdrop-blur">
        {messages.length > 0 && (
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setMessages([])}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear chat
            </button>
          </div>
        )}
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your fitness coach... (Enter to send)"
            rows={1}
            className="flex-1 bg-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none min-h-[44px] max-h-32"
            style={{ fieldSizing: 'content' } as React.CSSProperties}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="h-11 w-11 p-0 rounded-xl shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
