import { supabase } from './client'

export const signUp = async (email, password, options) => {
  return await supabase.auth.signUp({
    email,
    password,
    options: options ?? {},
  })
}

export const signIn = async (email, password) => {
  return await supabase.auth.signInWithPassword({ email, password })
}

export const getSession = async () => {
  return await supabase.auth.getSession()
}

export const getUser = async () => {
  return await supabase.auth.getUser()
}

export const signOut = async () => {
  return await supabase.auth.signOut()
}

export const resetPassword = async (email, options) => {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'rumbo://update-password',
    ...(options ?? {}),
  })
}

export const updateUserPassword = async (password) => {
  return await supabase.auth.updateUser({ password })
}

export const resendConfirmation = async (email) => {
  return await supabase.auth.resend({ type: 'signup', email })
}

export const updateProfile = async (data) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    return { data: null, error: error ?? new Error('User not found') }
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', user.id)

  return { data: null, error: updateError }
}

// Supabase's updateUser({ password }) does not verify the current password, so
// we reauthenticate first via signInWithPassword as the current-password check.
export const changePassword = async (currentPassword, newPassword) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user || !user.email) {
    return { data: null, error: userError ?? new Error('User not found') }
  }

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })
  if (reauthError) {
    return { data: null, error: reauthError }
  }

  return await supabase.auth.updateUser({ password: newPassword })
}

// Invokes the delete-user Edge Function (service-role) which deletes the
// caller's user-scoped data and then the Auth user itself. Normalizes the
// FunctionsHttpError thrown on non-2xx responses into a returned error.
export const deleteAccount = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('delete-user', {
      method: 'POST',
    })
    return { data, error }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Delete account failed'),
    }
  }
}
