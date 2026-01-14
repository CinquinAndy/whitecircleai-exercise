'use client'

import { useForm } from '@tanstack/react-form'
import { valibotValidator } from '@tanstack/valibot-form-adapter'
import { ArrowLeft, Loader2, Lock, Mail, User } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { forgotPasswordSchema, loginSchema, registerSchemaWithMatch } from '@/lib/validations/auth'
import { requestPasswordReset } from '@/services/pocketbase.client'
import { useAuthStore } from '@/stores/auth.store'

type AuthMode = 'login' | 'register' | 'forgot-password'

function FieldError({ error }: { error?: string }) {
	if (!error) return null
	return <p className="mt-1 text-xs text-destructive">{error}</p>
}

export function AuthForm() {
	const [mode, setMode] = useState<AuthMode>('login')
	const [success, setSuccess] = useState<string | null>(null)
	const { login, register, isLoading, error, clearError } = useAuthStore()

	// Login form
	const loginForm = useForm({
		defaultValues: { email: '', password: '' },
		validatorAdapter: valibotValidator(),
		validators: { onChange: loginSchema },
		onSubmit: async ({ value }) => {
			clearError()
			setSuccess(null)
			await login(value)
		},
	})

	// Register form
	const registerForm = useForm({
		defaultValues: { name: '', email: '', password: '', passwordConfirm: '' },
		validatorAdapter: valibotValidator(),
		validators: { onChange: registerSchemaWithMatch },
		onSubmit: async ({ value }) => {
			clearError()
			setSuccess(null)
			await register({
				email: value.email,
				password: value.password,
				passwordConfirm: value.passwordConfirm,
				name: value.name,
			})
		},
	})

	// Forgot password form
	const forgotForm = useForm({
		defaultValues: { email: '' },
		validatorAdapter: valibotValidator(),
		validators: { onChange: forgotPasswordSchema },
		onSubmit: async ({ value }) => {
			clearError()
			try {
				await requestPasswordReset(value.email)
				setSuccess('Un email de réinitialisation a été envoyé')
			} catch {
				// Error handled by store
			}
		},
	})

	const switchMode = (newMode: AuthMode) => {
		setMode(newMode)
		setSuccess(null)
		clearError()
		loginForm.reset()
		registerForm.reset()
		forgotForm.reset()
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-background dark:bg-[#212121] p-4">
			<div className="w-full max-w-md">
				{/* Logo/Brand */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
						<div className="w-8 h-8 rounded-full bg-primary" />
					</div>
					<h1 className="text-2xl font-bold text-foreground">WhiteCircle AI</h1>
					<p className="text-sm text-muted-foreground mt-1">
						{mode === 'login' && 'Connectez-vous pour continuer'}
						{mode === 'register' && 'Créez votre compte'}
						{mode === 'forgot-password' && 'Réinitialisez votre mot de passe'}
					</p>
				</div>

				{/* Card */}
				<div className="bg-card dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-xl border border-border">
					{/* Back button for forgot password */}
					{mode === 'forgot-password' && (
						<button
							type="button"
							onClick={() => switchMode('login')}
							className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
						>
							<ArrowLeft className="h-4 w-4" />
							Retour
						</button>
					)}

					{/* Error message */}
					{error && (
						<div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
							{error}
						</div>
					)}

					{/* Success message */}
					{success && (
						<div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm">
							{success}
						</div>
					)}

					{/* Login Form */}
					{mode === 'login' && (
						<form
							onSubmit={e => {
								e.preventDefault()
								e.stopPropagation()
								loginForm.handleSubmit()
							}}
							className="space-y-4"
						>
							<loginForm.Field name="email">
								{field => (
									<div>
										<label htmlFor="login-email" className="block text-sm font-medium text-foreground mb-1.5">
											Email
										</label>
										<div className="relative">
											<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
											<input
												id="login-email"
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
							</loginForm.Field>

							<loginForm.Field name="password">
								{field => (
									<div>
										<label htmlFor="login-password" className="block text-sm font-medium text-foreground mb-1.5">
											Mot de passe
										</label>
										<div className="relative">
											<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
											<input
												id="login-password"
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
							</loginForm.Field>

							<div className="flex justify-end">
								<button
									type="button"
									onClick={() => switchMode('forgot-password')}
									className="text-sm text-primary hover:underline"
								>
									Mot de passe oublié ?
								</button>
							</div>

							<button
								type="submit"
								disabled={isLoading}
								className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
							>
								{isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
								Se connecter
							</button>
						</form>
					)}

					{/* Register Form */}
					{mode === 'register' && (
						<form
							onSubmit={e => {
								e.preventDefault()
								e.stopPropagation()
								registerForm.handleSubmit()
							}}
							className="space-y-4"
						>
							<registerForm.Field name="name">
								{field => (
									<div>
										<label htmlFor="register-name" className="block text-sm font-medium text-foreground mb-1.5">
											Nom
										</label>
										<div className="relative">
											<User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
											<input
												id="register-name"
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
							</registerForm.Field>

							<registerForm.Field name="email">
								{field => (
									<div>
										<label htmlFor="register-email" className="block text-sm font-medium text-foreground mb-1.5">
											Email
										</label>
										<div className="relative">
											<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
											<input
												id="register-email"
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
							</registerForm.Field>

							<registerForm.Field name="password">
								{field => (
									<div>
										<label htmlFor="register-password" className="block text-sm font-medium text-foreground mb-1.5">
											Mot de passe
										</label>
										<div className="relative">
											<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
											<input
												id="register-password"
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
							</registerForm.Field>

							<registerForm.Field name="passwordConfirm">
								{field => (
									<div>
										<label
											htmlFor="register-password-confirm"
											className="block text-sm font-medium text-foreground mb-1.5"
										>
											Confirmer le mot de passe
										</label>
										<div className="relative">
											<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
											<input
												id="register-password-confirm"
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
							</registerForm.Field>

							<button
								type="submit"
								disabled={isLoading}
								className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
							>
								{isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
								Créer mon compte
							</button>
						</form>
					)}

					{/* Forgot Password Form */}
					{mode === 'forgot-password' && (
						<form
							onSubmit={e => {
								e.preventDefault()
								e.stopPropagation()
								forgotForm.handleSubmit()
							}}
							className="space-y-4"
						>
							<forgotForm.Field name="email">
								{field => (
									<div>
										<label htmlFor="forgot-email" className="block text-sm font-medium text-foreground mb-1.5">
											Email
										</label>
										<div className="relative">
											<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
											<input
												id="forgot-email"
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
							</forgotForm.Field>

							<button
								type="submit"
								disabled={isLoading}
								className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
							>
								{isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
								Envoyer le lien
							</button>
						</form>
					)}

					{/* Mode switchers */}
					{mode !== 'forgot-password' && (
						<div className="mt-6 pt-6 border-t border-border text-center text-sm">
							{mode === 'login' ? (
								<p className="text-muted-foreground">
									Pas encore de compte ?{' '}
									<button
										type="button"
										onClick={() => switchMode('register')}
										className="text-primary hover:underline font-medium"
									>
										S'inscrire
									</button>
								</p>
							) : (
								<p className="text-muted-foreground">
									Déjà un compte ?{' '}
									<button
										type="button"
										onClick={() => switchMode('login')}
										className="text-primary hover:underline font-medium"
									>
										Se connecter
									</button>
								</p>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
