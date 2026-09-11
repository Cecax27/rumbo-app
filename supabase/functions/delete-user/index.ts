import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

// User-scoped tables that hold application data for a given user. They carry a
// `user_id` column but no foreign key to `auth.users`, so deleting the Auth user
// alone would orphan them. They must be deleted explicitly before removing the
// Auth user. Order matters: `retirement_plans.account_id` and several others
// reference `accounts` without `ON DELETE CASCADE`, so `accounts` is deleted
// last. `budget_plan_groups` is removed by the `budget_plans` -> `budget_plan_groups`
// ON DELETE CASCADE when `budget_plans` rows are deleted.
const USER_SCOPED_TABLES = [
  'reports',
  'spendings',
  'deferred_spendings',
  'incomes',
  'transfers',
  'saving_goals',
  'retirement_plans',
  'budget_plans',
  'accounts',
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Validate the caller's JWT using the anon key. This rejects unauthenticated
  // requests without exposing the service role.
  const userClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } },
  )

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser()

  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const userId = user.id

  // 1. Delete user-scoped application data (data first, auth user last).
  for (const table of USER_SCOPED_TABLES) {
    const { error } = await adminClient
      .from(table)
      .delete()
      .eq('user_id', userId)

    if (error) {
      return new Response(
        JSON.stringify({ error: `Failed to delete ${table}: ${error.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }
  }

  // 2. Delete the Auth user. This cascades to `public.profiles`
  //    (`profiles_id_fkey ... ON DELETE CASCADE`) and all auth-schema children
  //    (sessions, identities, mfa factors, etc.).
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)

  if (deleteError) {
    return new Response(
      JSON.stringify({ error: deleteError.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
