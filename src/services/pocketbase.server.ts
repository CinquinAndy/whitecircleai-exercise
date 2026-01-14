import PocketBase from 'pocketbase'

const PB_URL = process.env.PB_URL ?? 'https://whitecircle.andy-cinquin.fr'
const PB_TOKEN = process.env.PB_TOKEN

if (!PB_URL) {
	throw new Error('PB_URL is required')
}

/**
 * Server-side PocketBase instance with admin token authentication.
 * Use this for backend operations that require admin privileges.
 *
 * ⚠️ IMPORTANT: This should only be used in server-side code (API routes, Server Components, Server Actions)
 */
function createAdminClient(): PocketBase {
	const pb = new PocketBase(PB_URL)
	pb.autoCancellation(false)

	if (PB_TOKEN != null && PB_TOKEN !== '') {
		pb.authStore.save(PB_TOKEN, null)
		console.info('[PocketBase] Authenticated with admin token')
	} else {
		console.warn('[PocketBase] PB_TOKEN not found - admin operations may not work')
	}

	return pb
}

// Singleton instance for server-side admin operations
export const pbAdmin = createAdminClient()

// Re-export PocketBase URL for client usage
export const POCKETBASE_URL = PB_URL
