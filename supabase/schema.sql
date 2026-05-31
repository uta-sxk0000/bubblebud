create extension if not exists "pgcrypto";

create type order_status as enum ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');
create type checkout_provider as enum ('stripe', 'paypal');
create type checkout_status as enum ('created', 'approved', 'paid', 'expired', 'failed');
create type review_status as enum ('pending', 'approved', 'hidden', 'deleted');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  phone text,
  auth_provider text not null default 'email',
  role text not null default 'customer',
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace view public.users as
select
  id,
  full_name as name,
  email,
  auth_provider as "authProvider",
  role,
  created_at as "createdAt"
from public.profiles;

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default 'Home',
  full_name text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'US',
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  slug text not null unique,
  title text not null,
  description text not null,
  category text not null,
  price_cents integer not null check (price_cents >= 0),
  sale_price_cents integer check (sale_price_cents >= 0),
  compare_at_cents integer check (compare_at_cents >= 0),
  sku text not null unique,
  inventory_quantity integer not null default 0,
  stock_status text not null default 'in_stock',
  images text[] not null default '{}',
  variants jsonb not null default '[]',
  tags text[] not null default '{}',
  featured boolean not null default false,
  best_seller boolean not null default false,
  active boolean not null default true,
  details text[] not null default '{}',
  care text,
  shipping text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wishlist_items (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  guest_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id text not null references public.products(id),
  variant text not null default 'Default',
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  created_at timestamptz not null default now(),
  unique (cart_id, product_id, variant)
);

create table if not exists public.discounts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  percent_off integer check (percent_off between 1 and 100),
  amount_off_cents integer check (amount_off_cents >= 0),
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.checkout_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  provider checkout_provider not null,
  provider_session_id text unique,
  provider_order_id text unique,
  status checkout_status not null default 'created',
  customer_email text not null,
  customer_name text not null,
  customer_phone text,
  shipping_address jsonb not null,
  billing_address jsonb not null,
  items jsonb not null,
  subtotal_cents integer not null default 0,
  discount_cents integer not null default 0,
  tax_cents integer not null default 0,
  shipping_cents integer not null default 0,
  total_cents integer not null default 0,
  currency text not null default 'usd',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references public.profiles(id) on delete set null,
  guest_email text,
  customer_email text not null,
  customer_name text not null,
  customer_phone text,
  status order_status not null default 'pending',
  payment_status payment_status not null default 'pending',
  payment_provider text,
  payment_id text unique,
  stripe_session_id text unique,
  paypal_order_id text unique,
  stripe_payment_intent_id text,
  subtotal_cents integer not null default 0,
  discount_cents integer not null default 0,
  tax_cents integer not null default 0,
  shipping_cents integer not null default 0,
  total_cents integer not null default 0,
  currency text not null default 'usd',
  shipping_address jsonb,
  billing_address jsonb,
  shipping_method text,
  tracking_number text,
  tracking_url text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id),
  product_title text not null,
  sku text not null,
  variant text not null default 'Default',
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null,
  total_cents integer not null
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text,
  status review_status not null default 'approved',
  visible boolean not null default true,
  verified_purchase boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  order_number text,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.products enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.discounts enable row level security;
alter table public.checkout_intents enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.contact_messages enable row level security;

create policy "Anyone can read active products" on public.products for select using (active = true);
create policy "Anyone can read visible reviews" on public.reviews for select using (visible = true and status = 'approved');

create policy "Users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users read own addresses" on public.addresses for select using (auth.uid() = user_id);
create policy "Users manage own addresses" on public.addresses for all using (auth.uid() = user_id);
create policy "Users read own wishlist" on public.wishlist_items for select using (auth.uid() = user_id);
create policy "Users manage own wishlist" on public.wishlist_items for all using (auth.uid() = user_id);
create policy "Users read own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users read own order items" on public.order_items for select using (
  exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);
create policy "Users read own reviews" on public.reviews for select using (auth.uid() = user_id);
create policy "Users read own checkout intents" on public.checkout_intents for select using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, auth_provider)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_app_meta_data->>'provider', 'email')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.decrement_inventory(items jsonb)
returns void
language plpgsql
security definer
as $$
declare
  item jsonb;
begin
  for item in select * from jsonb_array_elements(items)
  loop
    update public.products
    set inventory_quantity = greatest(0, inventory_quantity - (item->>'quantity')::integer),
        stock_status = case
          when greatest(0, inventory_quantity - (item->>'quantity')::integer) = 0 then 'out_of_stock'
          when greatest(0, inventory_quantity - (item->>'quantity')::integer) <= 5 then 'low_stock'
          else 'in_stock'
        end,
        updated_at = now()
    where id = item->>'product_id';
  end loop;
end;
$$;

create or replace function public.create_order_from_checkout_intent(
  checkout_intent_id uuid,
  provider_name text,
  provider_payment_id text,
  provider_order_id text default null,
  provider_session_id text default null,
  stripe_payment_intent text default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  intent public.checkout_intents;
  new_order_id uuid;
  order_no text;
  item jsonb;
begin
  select * into intent from public.checkout_intents where id = checkout_intent_id for update;
  if not found then
    raise exception 'Checkout intent not found';
  end if;

  select id into new_order_id from public.orders where payment_id = provider_payment_id;
  if new_order_id is not null then
    return new_order_id;
  end if;

  order_no := 'BB-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));

  insert into public.orders (
    order_number,
    user_id,
    guest_email,
    customer_email,
    customer_name,
    customer_phone,
    status,
    payment_status,
    payment_provider,
    payment_id,
    stripe_session_id,
    paypal_order_id,
    stripe_payment_intent_id,
    subtotal_cents,
    discount_cents,
    tax_cents,
    shipping_cents,
    total_cents,
    currency,
    shipping_address,
    billing_address,
    shipping_method,
    paid_at
  )
  values (
    order_no,
    intent.user_id,
    case when intent.user_id is null then intent.customer_email else null end,
    intent.customer_email,
    intent.customer_name,
    intent.customer_phone,
    'paid',
    'paid',
    provider_name,
    provider_payment_id,
    provider_session_id,
    provider_order_id,
    stripe_payment_intent,
    intent.subtotal_cents,
    intent.discount_cents,
    intent.tax_cents,
    intent.shipping_cents,
    intent.total_cents,
    intent.currency,
    intent.shipping_address,
    intent.billing_address,
    case when intent.shipping_cents = 0 then 'Free standard shipping' else 'Standard shipping' end,
    now()
  )
  returning id into new_order_id;

  for item in select * from jsonb_array_elements(intent.items)
  loop
    insert into public.order_items (
      order_id,
      product_id,
      product_title,
      sku,
      variant,
      quantity,
      unit_price_cents,
      total_cents
    )
    values (
      new_order_id,
      item->>'product_id',
      item->>'product_title',
      item->>'sku',
      coalesce(item->>'variant', 'Default'),
      (item->>'quantity')::integer,
      (item->>'unit_price_cents')::integer,
      (item->>'total_cents')::integer
    );
  end loop;

  update public.checkout_intents
  set status = 'paid',
      updated_at = now()
  where id = checkout_intent_id;

  perform public.decrement_inventory(intent.items);

  return new_order_id;
end;
$$;
