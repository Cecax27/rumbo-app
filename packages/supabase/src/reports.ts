import { supabase } from './client'

export type InsertReportInput = {
  deviceInfoJSON: Record<string, unknown> | null
  app_version: string | null
  message: string
}

// Returns a consistent shape: { error: null } on success, { error: message }
// on failure. `user_id` is defaulted server-side to auth.uid().
export async function insertReport({
  deviceInfoJSON,
  app_version,
  message,
}: InsertReportInput): Promise<{ error: string | null }> {
  const { error } = await supabase.from('reports').insert([
    {
      device_info: deviceInfoJSON,
      app_version,
      message,
    },
  ])

  return { error: error ? error.message : null }
}
