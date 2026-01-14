'use client'

import type { ReactNode } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'

export function Providers({ children }: { children: ReactNode }) {
	return <AuthGuard>{children}</AuthGuard>
}
