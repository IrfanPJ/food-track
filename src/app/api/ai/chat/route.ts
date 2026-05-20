import { NextRequest } from 'next/server'
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo',
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
})

const SYSTEM_PROMPT = `You are FitTrack AI Coach, an expert personal fitness and nutrition coach. You help users:
- Track and optimize their nutrition and calorie intake
- Plan and execute effective workout routines
- Achieve their specific fitness goals (weight loss, muscle gain, improved fitness)
- Understand macros, meal timing, and supplementation
- Build healthy habits and maintain consistency

Be encouraging, specific, and practical. Provide actionable advice. Use markdown formatting for better readability.
Keep responses concise but comprehensive. If you don't know something, be honest about it.`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const stream = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      stream: true,
      max_tokens: 1000,
      temperature: 0.7,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const data = JSON.stringify(chunk)
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } catch (err) {
          console.error('Stream error:', err)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('AI chat error:', err)
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
