import { createClient, processLock } from '@supabase/supabase-js'

const supabaseUrl = 'https://vnvosctyzocafkhgrvfl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudm9zY3R5em9jYWZraGdydmZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MzY2MjAsImV4cCI6MjA2NzUxMjYyMH0.NlAq5UQRAjdYXCn79EV0icQSZ6xtoJIP1c22NnPRR_w'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
})