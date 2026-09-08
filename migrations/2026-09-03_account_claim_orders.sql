-- Личный кабинет, OTP: при входе по подтверждённому номеру гостевые заказы с тем же телефоном
-- в guest_contact получают владельца. Вызывается из /api/account/link-session через service role.
-- Запустить в Supabase SQL Editor.

create or replace function claim_orders_by_phone(p_user_id uuid, p_phone text) returns integer
language plpgsql security definer set search_path = public as $$
declare
  v_digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  v_count integer;
begin
  if length(v_digits) < 9 then
    return 0;
  end if;

  update orders
  set user_id = p_user_id
  where user_id is null
    and regexp_replace(coalesce(guest_contact->>'phone', ''), '\D', '', 'g') = v_digits;

  get diagnostics v_count = row_count;

  return v_count;
end $$;

revoke execute on function claim_orders_by_phone(uuid, text) from public, anon, authenticated;
