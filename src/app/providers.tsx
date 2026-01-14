'use client'

import { type ReactNode, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth.store'

export function Providers({ children }: { children: ReactNode }) {
	const initialize = useAuthStore(state => state.initialize)

	useEffect(() => {
		initialize()
	}, [initialize])

	return <>{children}</>
}
