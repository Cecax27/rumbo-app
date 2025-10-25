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
