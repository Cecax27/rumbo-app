export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const MIN_PASSWORD_LENGTH = 8

export const isValidEmail = (email: string): boolean =>
  typeof email === 'string' && email.trim() !== '' && EMAIL_REGEX.test(email)

export const isValidPassword = (password: string): boolean =>
  typeof password === 'string' && password.length >= MIN_PASSWORD_LENGTH

export const isValidName = (name: string): boolean =>
  typeof name === 'string' && name.trim() !== ''
