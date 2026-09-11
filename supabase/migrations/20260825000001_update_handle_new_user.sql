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
  return new;
end;
$$;
