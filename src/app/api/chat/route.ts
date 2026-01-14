import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import PocketBase from 'pocketbase'
import { saveMessage } from '@/services/chat.server'
import { runSecurityPipeline, type SecurityContext } from '@/services/security.middleware'

const PB_URL = process.env.PB_URL ?? 'https://whitecircle.andy-cinquin.fr'

export const maxDuration = 60

/**
 * Chat API Route
 *
 * POST /api/chat
 *
 * Handles authenticated chat requests:
 * 1. Validates user authentication via Bearer token
 * 2. Runs security validation pipeline
 * 3. Saves user message to PocketBase
 * 4. Streams response from Gemini 2.5 Flash
 * 5. Saves assistant response to PocketBase on completion
 */
export async function POST(req: Request) {
	try {
		// 1. Validate authentication using PocketBase directly
		const authHeader = req.headers.get('Authorization')
			if (!authHeader) {
			return new Response(JSON.stringify({ error: 'Unauthenticated' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			})
		}

		const token = authHeader.replace(/^Bearer\s+/i, '')
		if (!token) {
			return new Response(JSON.stringify({ error: 'Invalid token' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			})
		}

		// Validate token with PocketBase
		const pb = new PocketBase(PB_URL)
		pb.authStore.save(token, null)

		let user: Record<string, any>
		try {
			const authData = await pb.collection('users').authRefresh()
			user = authData.record
		} catch {
			return new Response(JSON.stringify({ error: 'Token expired or invalid' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			})
		}

		// 2. Parse request body
		const { messages, conversationId } = await req.json()

		if (!messages || !Array.isArray(messages) || messages.length === 0) {
			return new Response(JSON.stringify({ error: 'Messages required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			})
		}

		// 3. Get the last user message
		const lastMessage = messages[messages.length - 1]
		if (lastMessage.role !== 'user') {
			return new Response(JSON.stringify({ error: 'Last message must be from user' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			})
		}

		// 4. Run security validation pipeline (placeholder for LLM chain)
		const securityContext: SecurityContext = {
			userId: user.id,
			conversationId,
			timestamp: new Date(),
		}

		const securityResult = await runSecurityPipeline(lastMessage.content, securityContext)

		if (!securityResult.proceed) {
			return new Response(JSON.stringify({ error: securityResult.content }), {
				status: 403,
				headers: { 'Content-Type': 'application/json' },
			})
		}

		// 5. Save user message to PocketBase
		// We await here to get the conversation ID if it's a new conversation
		// This is important so the assistant message is saved to the same conversation
		const { conversationId: currentConversationId } = await saveMessage(
			user.id,
			lastMessage,
			conversationId
		)

		// 6. Prepare messages for LLM
		const sanitizedMessages = messages.map((m: { role: string; content: string }, index: number) => ({
			role: m.role as 'user' | 'assistant' | 'system',
			content: index === messages.length - 1 ? securityResult.content : m.content,
		}))

		// 7. Call Gemini 2.5 Flash with streaming
		const result = streamText({
			model: google('gemini-2.5-flash'),
			messages: sanitizedMessages,
			system: `You are a helpful and benevolent AI assistant. You answer concisely and precisely.
Be friendly in your responses while remaining professional.
If you don't know the answer to a question, say so honestly.`,
			onFinish: async ({ text }) => {
				// Save assistant response to PocketBase
				await saveMessage(
					user.id,
					{ role: 'assistant', content: text },
					currentConversationId
				)
			},
		})

		// 8. Return streaming response with conversation ID header
		return result.toTextStreamResponse({
			headers: {
				'X-Conversation-Id': currentConversationId,
			},
		})
	} catch (error) {
		console.error('[Chat API] Error:', error)
		return new Response(
			JSON.stringify({
				error: error instanceof Error ? error.message : 'An unexpected error occurred',
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			}
		)
	}
}
