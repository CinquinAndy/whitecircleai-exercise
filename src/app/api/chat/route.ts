import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

export const maxDuration = 30

export async function POST(req: Request) {
	const { messages } = await req.json()

	const result = streamText({
		model: openai('gpt-4o-mini'),
		messages,
		system: 'You are a helpful assistant. Be concise and friendly in your responses.',
	})

	// For AI SDK v6, use toTextStreamResponse with proper headers for useChat compatibility
	return new Response(result.textStream, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	})
}
