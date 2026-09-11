export class DatabaseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DatabaseError'
  }
}

// Supabase Auth error codes (from error.code) mapped to stable keys so apps can
// translate to localized, non-technical messages without coupling to the
// provider's string codes.
export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: 'invalid_credentials',
  EMAIL_NOT_CONFIRMED: 'email_not_confirmed',
  USER_ALREADY_EXISTS: 'user_already_exists',
  WEAK_PASSWORD: 'weak_password',
  SAME_PASSWORD: 'same_password',
  RATE_LIMITED: 'over_request_rate_limit',
  SESSION_EXPIRED: 'session_expired',
} as const

export type AuthErrorCode =
  (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES]
