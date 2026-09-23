-- Исправление: в coupon_check/coupon_reserve выходная колонка coupon_id конфликтовала с колонкой таблиц
-- («column reference coupon_id is ambiguous»). Выходные колонки переименованы с префиксом r_.
-- Запустить в Supabase SQL Editor после 2026-09-23_coupons.sql.

drop function if exists coupon_reserve(uuid, text, integer, bigint);
drop function if exists coupon_check(uuid, text, integer, boolean);

create or replace function coupon_check(
  p_user_id uuid, p_code text, p_subtotal integer, p_lock boolean default false
) returns table (r_ok boolean, r_reason text, r_coupon_id bigint, r_discount integer)
language plpgsql security definer set search_path = public as $$
declare
  c coupons%rowtype;
  g coupon_grants%rowtype;
  v_uses integer;
  v_user_uses integer;
begin
  if p_lock then
    select * into c from coupons where coupons.code = upper(trim(p_code)) for update;
  else
    select * into c from coupons where coupons.code = upper(trim(p_code));
  end if;

  if c.id is null then
    return query select false, 'not_found'::text, null::bigint, 0; return;
  end if;

  if not c.active or c.starts_at > now() or (c.ends_at is not null and c.ends_at < now()) then
    return query select false, 'inactive'::text, c.id, 0; return;
  end if;

  if c.kind = 'personal' then
    select * into g from coupon_grants where coupon_grants.coupon_id = c.id and coupon_grants.user_id = p_user_id;

    if g.coupon_id is null then
      return query select false, 'not_granted'::text, c.id, 0; return;
    end if;

    if g.expires_at is not null and g.expires_at < now() then
      return query select false, 'expired'::text, c.id, 0; return;
    end if;
  end if;

  if c.min_subtotal is not null and p_subtotal < c.min_subtotal then
    return query select false, 'min_subtotal'::text, c.id, 0; return;
  end if;

  select count(*) into v_uses
  from coupon_redemptions where coupon_redemptions.coupon_id = c.id and coupon_redemptions.status <> 'released';

  if c.max_uses is not null and v_uses >= c.max_uses then
    return query select false, 'exhausted'::text, c.id, 0; return;
  end if;

  select count(*) into v_user_uses
  from coupon_redemptions
  where coupon_redemptions.coupon_id = c.id and coupon_redemptions.user_id = p_user_id and coupon_redemptions.status <> 'released';

  if v_user_uses >= c.per_user_limit then
    return query select false, 'already_used'::text, c.id, 0; return;
  end if;

  return query select true, null::text, c.id, coupon_compute(c.discount_type, c.value, c.max_discount, p_subtotal);
end $$;

create or replace function coupon_reserve(
  p_user_id uuid, p_code text, p_subtotal integer, p_order_id bigint
) returns table (r_ok boolean, r_reason text, r_coupon_id bigint, r_discount integer)
language plpgsql security definer set search_path = public as $$
declare
  r record;
begin
  select * into r from coupon_check(p_user_id, p_code, p_subtotal, true);

  if not r.r_ok then
    return query select r.r_ok, r.r_reason, r.r_coupon_id, r.r_discount; return;
  end if;

  insert into coupon_redemptions (coupon_id, user_id, order_id, discount)
  values (r.r_coupon_id, p_user_id, p_order_id, r.r_discount);

  update orders set coupon_id = r.r_coupon_id where orders.id = p_order_id;

  return query select true, null::text, r.r_coupon_id, r.r_discount;
end $$;

revoke execute on function coupon_check(uuid, text, integer, boolean) from public, anon, authenticated;
revoke execute on function coupon_reserve(uuid, text, integer, bigint) from public, anon, authenticated;
