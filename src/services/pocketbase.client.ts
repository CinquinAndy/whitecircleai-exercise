import PocketBase, { type AuthRecord } from 'pocketbase'

// PocketBase URL for client-side - must be public
const POCKETBASE_URL = process.env.NEXT_PUBLIC_PB_URL ?? 'https://whitecircle.andy-cinquin.fr'

/**
 * Client-side PocketBase instance for user authentication.
 * This is used in browser context for user login/signup/etc.
 */
function createClientPB(): PocketBase {
	const pb = new PocketBase(POCKETBASE_URL)
	pb.autoCancellation(false)
	return pb
}

// Singleton for client usage
let clientPB: PocketBase | null = null

export function getClientPB(): PocketBase {
	if (typeof window === 'undefined') {
		// Server-side: create new instance each time (no localStorage)
		return createClientPB()
	}

	// Client-side: use singleton
	if (!clientPB) {
		clientPB = createClientPB()

		// Load auth from localStorage if available
		const storedAuth = localStorage.getItem('pb_auth')
		if (storedAuth) {
			try {
				const { token, record } = JSON.parse(storedAuth)
				clientPB.authStore.save(token, record)
			} catch {
				localStorage.removeItem('pb_auth')
			}
		}

		// Subscribe to auth changes to persist in localStorage
		clientPB.authStore.onChange((token, record) => {
			if (token && record) {
				localStorage.setItem('pb_auth', JSON.stringify({ token, record }))
			} else {
				localStorage.removeItem('pb_auth')
			}
		})
	}

	return clientPB
}

// ============================================================================
// Authentication API Functions
// ============================================================================

export interface LoginCredentials {
	email: string
	password: string
}

export interface RegisterData {
	email: string
	password: string
	passwordConfirm: string
	name?: string
}

/**
 * Login with email and password
 * Uses: POST /api/collections/users/auth-with-password
 */
export async function login(credentials: LoginCredentials): Promise<AuthRecord> {
	const pb = getClientPB()
	const authData = await pb.collection('users').authWithPassword(credentials.email, credentials.password)
	return authData.record
}

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<AuthRecord> {
	const pb = getClientPB()
	const record = await pb.collection('users').create(data)

	// Auto-login after registration
	await pb.collection('users').authWithPassword(data.email, data.password)

	return record as AuthRecord
}

/**
 * Logout the current user
 */
export function logout(): void {
	const pb = getClientPB()
	pb.authStore.clear()
}

/**
 * Refresh the auth token
 * Uses: POST /api/collections/users/auth-refresh
 */
export async function refreshAuth(): Promise<AuthRecord | null> {
	const pb = getClientPB()
	if (!pb.authStore.isValid) {
		return null
	}

	try {
		const authData = await pb.collection('users').authRefresh()
		return authData.record
	} catch {
		pb.authStore.clear()
		return null
	}
}

/**
 * Request email verification
 * Uses: POST /api/collections/users/request-verification
 */
export async function requestVerification(email: string): Promise<boolean> {
	const pb = getClientPB()
	return await pb.collection('users').requestVerification(email)
}

/**
 * Request password reset
 * Uses: POST /api/collections/users/request-password-reset
 */
export async function requestPasswordReset(email: string): Promise<boolean> {
	const pb = getClientPB()
	return await pb.collection('users').requestPasswordReset(email)
}

/**
 * Request email change
 * Uses: POST /api/collections/users/request-email-change
 */
export async function requestEmailChange(newEmail: string): Promise<boolean> {
	const pb = getClientPB()
	return await pb.collection('users').requestEmailChange(newEmail)
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): AuthRecord | null {
	const pb = getClientPB()
	if (!pb.authStore.isValid) {
		return null
	}
	return pb.authStore.record as AuthRecord
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
	const pb = getClientPB()
	return pb.authStore.isValid
}

/**
 * Get current auth token (for API calls)
 */
export function getAuthToken(): string | null {
	const pb = getClientPB()
	return pb.authStore.token || null
}
