'use client'

import { Bot } from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'
import AIChatFloat from '@/components/ai/AIChatFloat'

export default function FloatingActions() {
  const { isChatOpen, setChatOpen } = useUIStore()

  return (
    <>
      {/* Floating AI Button */}
      {!isChatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/30 transition-all hover:scale-110"
          aria-label="Open AI Coach"
        >
          <Bot className="w-5 h-5 text-white" />
        </button>
      )}

      {/* AI Chat Window */}
      {isChatOpen && <AIChatFloat />}
    </>
  )
}
