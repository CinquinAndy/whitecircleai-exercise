import PocketBase from 'pocketbase'

const PB_URL = process.env.PB_URL ?? 'https://whitecircle.andy-cinquin.fr'
const PB_TOKEN = process.env.PB_TOKEN

/**
 * Message stored inside the 'messages' JSON field of a conversation
 */
export interface ChatMessage {
	id: string // Client-side generated UUID
	role: 'user' | 'assistant' | 'system'
	content: string
	timestamp: string
}

/**
 * Conversation record from PocketBase
 */
export interface ConversationRecord {
	id: string
	title: string
	description: string
	owner: string
	messages: ChatMessage[]
	created: string
	updated: string
}

/**
 * Create a PocketBase admin client for server-side operations
 */
function createAdminPB(): PocketBase {
	const pb = new PocketBase(PB_URL)
	pb.autoCancellation(false)

	if (PB_TOKEN) {
		pb.authStore.save(PB_TOKEN, null)
	}

	return pb
}

/**
 * Save a chat message to a conversation in PocketBase.
 *
 * If conversationId is provided, it updates the existing conversation.
 * If not, it creates a new conversation.
 *
 * @param userId - The ID of the owner user
 * @param message - The message object containing role and content
 * @param conversationId - Optional conversation ID
 */
export async function saveMessage(
	userId: string,
	message: { role: 'user' | 'assistant' | 'system'; content: string },
	conversationId?: string
): Promise<{ conversationId: string; message: ChatMessage }> {
	const pb = createAdminPB()
	const newMessage: ChatMessage = {
		id: crypto.randomUUID(),
		role: message.role,
		content: message.content,
		timestamp: new Date().toISOString(),
	}

	try {
		if (conversationId) {
			// Update existing conversation
			const conversation = await pb.collection('conversation').getOne<ConversationRecord>(conversationId)
			const updatedMessages = [...(conversation.messages || []), newMessage]

			await pb.collection('conversation').update(conversationId, {
				messages: updatedMessages,
			})

			return { conversationId, message: newMessage }
		}

		// Create new conversation
		// Only create if it's a user message starting a thread?
		// Usually we want to create it on the first user message.
		const record = await pb.collection('conversation').create({
			owner: userId,
			title: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''), // Basic title generation
			messages: [newMessage],
		})

		return { conversationId: record.id, message: newMessage }
	} catch (error) {
		console.error('[Chat] Failed to save message:', error)
		throw error // Let the API route handle the error appropriately
	}
}

/**
 * Load a specific conversation or just the messages
 */
export async function getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
	const pb = createAdminPB()
	try {
		const record = await pb.collection('conversation').getOne<ConversationRecord>(conversationId)
		return record.messages || []
	} catch (error) {
		console.error('[Chat] Failed to load conversation:', error)
		return []
	}
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId: string): Promise<boolean> {
	const pb = createAdminPB()
	try {
		await pb.collection('conversation').delete(conversationId)
		return true
	} catch (error) {
		console.error('[Chat] Failed to delete conversation:', error)
		return false
	}
}

/**
 * List user conversations
 */
export async function listUserConversations(userId: string): Promise<ConversationRecord[]> {
	const pb = createAdminPB()
	try {
		const records = await pb.collection('conversation').getFullList<ConversationRecord>({
			filter: `owner = "${userId}"`,
			sort: '-updated',
		})
		return records
	} catch (error) {
		console.error('[Chat] Failed to list conversations:', error)
		return []
	}
}
