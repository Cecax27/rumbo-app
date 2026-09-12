create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, terms_accepted_at)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    case
      when (new.raw_user_meta_data ->> 'terms_accepted') = 'true'
        then now()
      else null
    end
  );

  insert into public.accounts (user_id, name, account_type, icon, color, is_primary_account)
  values (
    new.id,
    'Cartera',
    3,
    'monetization-on',
    '#546E7A',
    true
  );

  return new;
end;
$$;
