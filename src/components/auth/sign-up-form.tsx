'use client'

import { useForm } from '@tanstack/react-form'
import { valibotValidator } from '@tanstack/valibot-form-adapter'
import { Loader2, Lock, Mail, User } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { registerSchemaWithMatch } from '@/lib/validations/auth'
import { useAuthStore } from '@/stores/auth.store'

function FieldError({ error }: { error?: string }) {
	if (!error) return null
	return <p className="mt-1 text-xs text-destructive">{error}</p>
}

export function SignUpForm() {
	const { register, isLoading, error, clearError } = useAuthStore()

	const form = useForm({
		defaultValues: { name: '', email: '', password: '', passwordConfirm: '' },
		validatorAdapter: valibotValidator(),
		validators: { onChange: registerSchemaWithMatch },
		onSubmit: async ({ value }) => {
			clearError()
			await register({
				email: value.email,
				password: value.password,
				passwordConfirm: value.passwordConfirm,
				name: value.name,
			})
		},
	})

	return (
		<div className="min-h-screen flex items-center justify-center bg-background dark:bg-[#212121] p-4">
			<div className="w-full max-w-md">
				{/* Logo/Brand */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
						<div className="w-8 h-8 rounded-full bg-primary" />
					</div>
					<h1 className="text-2xl font-bold text-foreground">WhiteCircle AI</h1>
					<p className="text-sm text-muted-foreground mt-1">Create your account</p>
				</div>

				{/* Card */}
				<div className="bg-card dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-xl border border-border">
					{/* Error message */}
					{error && (
						<div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
							{error}
						</div>
					)}

					<form
						onSubmit={e => {
							e.preventDefault()
							e.stopPropagation()
							form.handleSubmit()
						}}
						className="space-y-4"
					>
						<form.Field name="name">
							{field => (
								<div>
									<label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
										Name
									</label>
									<div className="relative">
										<User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<input
											id="name"
											type="text"
											value={field.state.value}
											onChange={e => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											placeholder="Votre nom"
											className={cn(
												'w-full pl-10 pr-4 py-2.5 rounded-xl bg-background dark:bg-[#2a2a2a] border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all',
												field.state.meta.errors.length > 0 ? 'border-destructive' : 'border-border'
											)}
										/>
									</div>
									<FieldError error={field.state.meta.errors[0]?.message} />
								</div>
							)}
						</form.Field>

						<form.Field name="email">
							{field => (
								<div>
									<label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
										Email
									</label>
									<div className="relative">
										<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<input
											id="email"
											type="email"
											value={field.state.value}
											onChange={e => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											placeholder="votre@email.com"
											className={cn(
												'w-full pl-10 pr-4 py-2.5 rounded-xl bg-background dark:bg-[#2a2a2a] border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all',
												field.state.meta.errors.length > 0 ? 'border-destructive' : 'border-border'
											)}
										/>
									</div>
									<FieldError error={field.state.meta.errors[0]?.message} />
								</div>
							)}
						</form.Field>

						<form.Field name="password">
							{field => (
								<div>
									<label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
										Password
									</label>
									<div className="relative">
										<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<input
											id="password"
											type="password"
											value={field.state.value}
											onChange={e => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											placeholder="••••••••"
											className={cn(
												'w-full pl-10 pr-4 py-2.5 rounded-xl bg-background dark:bg-[#2a2a2a] border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all',
												field.state.meta.errors.length > 0 ? 'border-destructive' : 'border-border'
											)}
										/>
									</div>
									<FieldError error={field.state.meta.errors[0]?.message} />
								</div>
							)}
						</form.Field>

						<form.Field name="passwordConfirm">
							{field => (
								<div>
									<label htmlFor="passwordConfirm" className="block text-sm font-medium text-foreground mb-1.5">
										Confirm Password
									</label>
									<div className="relative">
										<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<input
											id="passwordConfirm"
											type="password"
											value={field.state.value}
											onChange={e => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											placeholder="••••••••"
											className={cn(
												'w-full pl-10 pr-4 py-2.5 rounded-xl bg-background dark:bg-[#2a2a2a] border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all',
												field.state.meta.errors.length > 0 ? 'border-destructive' : 'border-border'
											)}
										/>
									</div>
									<FieldError error={field.state.meta.errors[0]?.message} />
								</div>
							)}
						</form.Field>

						<button
							type="submit"
							disabled={isLoading}
							className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							{isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
							Sign Up
						</button>
					</form>

					{/* Mode switcher */}
					<div className="mt-6 pt-6 border-t border-border text-center text-sm">
						<p className="text-muted-foreground">
							Already have an account ?{' '}
							<Link href="/sign-in" className="text-primary hover:underline font-medium">
								Sign In
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
