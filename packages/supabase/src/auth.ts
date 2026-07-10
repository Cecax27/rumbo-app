import { supabase } from './client'

export const signUp = async (email: string, password: string) => {
  return await supabase.auth.signUp({ email, password })
}

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password })
}

export const getSession = async () => {
  return await supabase.auth.getSession()
}

export const signOut = async () => {
  return await supabase.auth.signOut()
}

export const resetPasswordForEmail = async (email: string, options?: { redirectTo?: string }) => {
  return await supabase.auth.resetPasswordForEmail(email, options ?? {})
}

export const updateUserPassword = async (password: string) => {
  return await supabase.auth.updateUser({ password })
}
