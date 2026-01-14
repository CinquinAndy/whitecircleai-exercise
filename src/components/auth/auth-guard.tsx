'use client'

import { Loader2 } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { type ReactNode, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth.store'

interface AuthGuardProps {
	children: ReactNode
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/sign-in', '/sign-up', '/forgot-password']

export function AuthGuard({ children }: AuthGuardProps) {
	const router = useRouter()
	const pathname = usePathname()
	const { user, isInitialized, initialize } = useAuthStore()

	const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))
	const isAuthenticated = user !== null

	useEffect(() => {
		initialize()
	}, [initialize])

	useEffect(() => {
		if (!isInitialized) return

		if (!isAuthenticated && !isPublicRoute) {
			// Not authenticated and trying to access protected route -> redirect to sign-in
			router.replace('/sign-in')
		} else if (isAuthenticated && isPublicRoute) {
			// Authenticated but on public route -> redirect to home
			router.replace('/')
		}
	}, [isAuthenticated, isPublicRoute, isInitialized, router])

	// Show loading while initializing
	if (!isInitialized) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background dark:bg-[#212121]">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-sm text-muted-foreground">Loading...</p>
				</div>
			</div>
		)
	}

	// If not authenticated and not on public route, show loading (redirect in progress)
	if (!isAuthenticated && !isPublicRoute) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background dark:bg-[#212121]">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		)
	}

	// If authenticated and on public route, show loading (redirect in progress)
	if (isAuthenticated && isPublicRoute) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background dark:bg-[#212121]">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		)
	}

	return <>{children}</>
}
