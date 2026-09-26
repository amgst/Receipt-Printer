create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "own roles or admin" on public.user_roles for select to authenticated
using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create table public.shop_settings (
  user_id uuid primary key,
  business_name text not null default 'My Store',
  tagline text default '',
  logo_data text,
  address text default '',
  phone text default '',
  store_number text default '',
  register_number text default '01',
  cashier text default '',
  tax_rate numeric not null default 0,
  currency text not null default '$',
  footer_text text default 'Thank you for your visit!',
  footer_note text default '',
  qr_url text default '',
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.shop_settings to authenticated;
grant all on public.shop_settings to service_role;
alter table public.shop_settings enable row level security;
create policy "own settings select" on public.shop_settings for select to authenticated using (user_id = auth.uid());
create policy "own settings insert" on public.shop_settings for insert to authenticated with check (user_id = auth.uid());
create policy "own settings update" on public.shop_settings for update to authenticated using (user_id = auth.uid());

create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  trans_number text not null,
  total numeric not null default 0,
  data jsonb not null,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.receipts to authenticated;
grant all on public.receipts to service_role;
alter table public.receipts enable row level security;
create policy "own receipts select" on public.receipts for select to authenticated using (user_id = auth.uid());
create policy "own receipts insert" on public.receipts for insert to authenticated with check (user_id = auth.uid());
create policy "own receipts delete" on public.receipts for delete to authenticated using (user_id = auth.uid());
create index receipts_user_idx on public.receipts(user_id, created_at desc);