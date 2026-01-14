import * as v from 'valibot'

// Login schema
export const loginSchema = v.object({
	email: v.pipe(v.string(), v.nonEmpty('Email requis'), v.email('Email invalide')),
	password: v.pipe(v.string(), v.nonEmpty('Mot de passe requis'), v.minLength(6, 'Minimum 6 caractères')),
})

export type LoginFormData = v.InferOutput<typeof loginSchema>

// Register schema
export const registerSchema = v.object({
	name: v.pipe(v.string(), v.nonEmpty('Nom requis'), v.minLength(2, 'Minimum 2 caractères')),
	email: v.pipe(v.string(), v.nonEmpty('Email requis'), v.email('Email invalide')),
	password: v.pipe(v.string(), v.nonEmpty('Mot de passe requis'), v.minLength(8, 'Minimum 8 caractères')),
	passwordConfirm: v.pipe(v.string(), v.nonEmpty('Confirmation requise')),
})

// Add password match validation
export const registerSchemaWithMatch = v.pipe(
	registerSchema,
	v.forward(
		v.partialCheck(
			[['password'], ['passwordConfirm']],
			input => input.password === input.passwordConfirm,
			'Les mots de passe ne correspondent pas'
		),
		['passwordConfirm']
	)
)

export type RegisterFormData = v.InferOutput<typeof registerSchema>

// Forgot password schema
export const forgotPasswordSchema = v.object({
	email: v.pipe(v.string(), v.nonEmpty('Email requis'), v.email('Email invalide')),
})

export type ForgotPasswordFormData = v.InferOutput<typeof forgotPasswordSchema>
