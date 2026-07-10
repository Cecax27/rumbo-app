import { supabase } from "@repo/supabase/client"

export const checkWelcomeSeen = async (): Promise<boolean> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("welcome")
    .single()
  if (error || !data) return false
  return data.welcome === true || data.welcome === "true"
}

export const setWelcomeSeen = async (): Promise<void> => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return
  await supabase.from("profiles").update({ welcome: "true" }).eq("id", user.id)
}
