import { supabase } from './client'

// Returns a consistent shape: { error: null } on success, { error: message }
// on failure. `user_id` is defaulted server-side to auth.uid().
export async function insertReport({ deviceInfoJSON, app_version, message }) {
  const { error } = await supabase.from('reports').insert([
    {
      device_info: deviceInfoJSON,
      app_version,
      message,
    },
  ])

  return { error: error ? error.message : null }
}
