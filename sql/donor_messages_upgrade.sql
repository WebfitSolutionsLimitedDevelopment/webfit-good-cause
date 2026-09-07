-- Good Cause donor messages upgrade
-- Safe to run more than once. Does not alter existing donation records.

alter table public.donations
  add column if not exists message text;

comment on column public.donations.message is
  'Optional public message supplied by a contributor. Contact details remain private.';

-- Keep public messages bounded even if a future client bypasses UI validation.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'donations_message_length_check'
      and conrelid = 'public.donations'::regclass
  ) then
    alter table public.donations
      add constraint donations_message_length_check
      check (message is null or char_length(message) <= 500) not valid;
  end if;
end $$;
