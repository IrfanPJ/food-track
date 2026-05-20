import AIChatPage from '@/components/ai/AIChatPage'

export default function AICoachPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-zinc-100">AI Fitness Coach</h1>
        <p className="text-sm text-zinc-500">Your personal nutrition and workout assistant</p>
      </div>
      <div className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden flex flex-col">
        <AIChatPage />
      </div>
    </div>
  )
}
