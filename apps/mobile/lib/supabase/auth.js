import { supabase } from './client'

export const signUp = async (email, password) => {
  return await supabase.auth.signUp({ email, password })
}

export const signIn = async (email, password) => {
  return await supabase.auth.signInWithPassword({ email, password })
}

export const getSession = async () => {
  return await supabase.auth.getSession()
}

export const signOut = async () => {
  return await supabase.auth.signOut()
}

export const resetPassword = async (email) => {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'rumbo://update-password',
  })
}

export const updateUserPassword = async (password) => {
  return await supabase.auth.updateUser({ password })
}
