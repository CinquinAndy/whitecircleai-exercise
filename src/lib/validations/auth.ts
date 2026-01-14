import * as v from 'valibot'

// Login schema
export const loginSchema = v.object({
	email: v.pipe(v.string(), v.nonEmpty('Email required'), v.email('Invalid email')),
	password: v.pipe(v.string(), v.nonEmpty('Password required'), v.minLength(6, 'Minimum 6 characters')),
})

export type LoginFormData = v.InferOutput<typeof loginSchema>

// Register schema
export const registerSchema = v.object({
	name: v.pipe(v.string(), v.nonEmpty('Name required'), v.minLength(2, 'Minimum 2 characters')),
	email: v.pipe(v.string(), v.nonEmpty('Email required'), v.email('Invalid email')),
	password: v.pipe(v.string(), v.nonEmpty('Password required'), v.minLength(8, 'Minimum 8 characters')),
	passwordConfirm: v.pipe(v.string(), v.nonEmpty('Confirmation required')),
})

// Add password match validation
export const registerSchemaWithMatch = v.pipe(
	registerSchema,
	v.forward(
		v.partialCheck(
			[['password'], ['passwordConfirm']],
			input => input.password === input.passwordConfirm,
			'Passwords do not match'
		),
		['passwordConfirm']
	)
)

export type RegisterFormData = v.InferOutput<typeof registerSchema>

// Forgot password schema
export const forgotPasswordSchema = v.object({
	email: v.pipe(v.string(), v.nonEmpty('Email required'), v.email('Invalid email')),
})

export type ForgotPasswordFormData = v.InferOutput<typeof forgotPasswordSchema>
