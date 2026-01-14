// Services barrel export

// Client-side PocketBase (user authentication)
export {
	getAuthToken,
	getClientPB,
	getCurrentUser,
	isAuthenticated,
	type LoginCredentials,
	login,
	logout,
	type RegisterData,
	refreshAuth,
	register,
	requestEmailChange,
	requestPasswordReset,
	requestVerification,
} from './pocketbase.client'
// Server-side PocketBase (admin operations)
// ⚠️ Only import in server components, API routes, or server actions
export { POCKETBASE_URL, pbAdmin } from './pocketbase.server'
