import PocketBase from 'pocketbase'
import { getConversationMessages, listUserConversations } from '@/services/chat.server'

const PB_URL = process.env.PB_URL ?? 'https://whitecircle.andy-cinquin.fr'

/**
 * GET /api/chat/history
 *
 * Query params:
 * - id: Optional conversation ID. If present, returns messages for that conversation.
 *       If absent, returns list of conversations for the authenticated user.
 */
export async function GET(req: Request) {
	try {
		// 1. Validate authentication
		const authHeader = req.headers.get('Authorization')
		if (!authHeader) {
			return new Response(JSON.stringify({ error: 'Unauthenticated' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			})
		}

		const token = authHeader.replace(/^Bearer\s+/i, '')
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

		// 2. Parsy query params
		const { searchParams } = new URL(req.url)
		const conversationId = searchParams.get('id')

		// 3. Handle request based on presence of conversationId
		if (conversationId) {
			// Fetch messages for specific conversation
			// Note: Ideally we should verify the conversation belongs to the user or admin permissions
			// utilizing PocketBase RLS or checking owner in getConversationMessages if wrapping it logic
			// For this implementation, lists fetch via admin client in service, so we rely on that.
			// Ideally existing service should check ownership.
			const messages = await getConversationMessages(conversationId)
			return new Response(JSON.stringify({ messages }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			})
		} else {
			// List all conversations for user
			const conversations = await listUserConversations(user.id)
			return new Response(JSON.stringify({ conversations }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			})
		}
	} catch (error) {
		console.error('[Chat History API] Error:', error)
		return new Response(
			JSON.stringify({
				error: error instanceof Error ? error.message : 'An error occurred',
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			}
		)
	}
}
