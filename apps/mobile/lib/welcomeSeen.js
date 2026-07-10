import { supabase } from './supabase/client';

export const checkWelcomeSeen = async () => {
  const { data, error } = await supabase.from('profiles').select('welcome').single();
  if (error || !data) return false;
  return data.welcome === true || data.welcome === 'true';
};

export const setWelcomeSeen = async () => { 
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) {
    return;
  }

  await supabase.from('profiles').update({welcome: 'true'}).eq('id', user.id);

  return;
};