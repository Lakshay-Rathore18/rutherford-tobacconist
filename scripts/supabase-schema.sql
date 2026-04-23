-- ============================================================
-- RUTHERFORD TOBACCONIST — SUPABASE SCHEMA + SEED (v2)
-- Aligned with src/lib/products.ts (27 SKUs, 4 categories)
-- Currency: USD. Bulk discount: $5 off every 10 cig packs.
-- ============================================================

-- 0. Extensions (enable BEFORE any index/function that uses them)
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ============================================================
-- 1. ENUMS (must exist before tables that reference them)
-- ============================================================
do $$ begin
  create type order_status as enum (
    'pending','confirmed','preparing','out_for_delivery','delivered','cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_source as enum ('voice','website','whatsapp','manual');
exception when duplicate_object then null; end $$;

-- ============================================================
-- 2. PRODUCT CATEGORIES
--    Slugs match src/lib/products.ts Category union.
-- ============================================================
create table if not exists product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  discount_eligible boolean default false,
  created_at timestamptz default now()
);

insert into product_categories (name, slug, discount_eligible) values
  ('Cigarettes',        'cigarettes',        true),
  ('Vapes',             'vapes',             false),
  ('Nicotine Pouches',  'nicotine-pouches',  false),
  ('Tobacco Pouches',   'tobacco-pouches',   false)
on conflict (slug) do nothing;

-- ============================================================
-- 3. DELIVERY AGENTS (defined before orders — forward-ref fix)
-- ============================================================
create table if not exists delivery_agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- 4. PRODUCTS
-- ============================================================
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references product_categories(id),
  brand text not null,
  name text not null,
  variant text,
  sku text unique,
  price numeric(10,2) not null,
  stock int not null default 0,
  min_order_qty int not null default 1,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_products_name_trgm  on products using gin (name gin_trgm_ops);
create index if not exists idx_products_brand_trgm on products using gin (brand gin_trgm_ops);
create index if not exists idx_products_name  on products (lower(name));
create index if not exists idx_products_brand on products (lower(brand));
create index if not exists idx_products_active on products (active) where active = true;

-- ============================================================
-- 5. CUSTOMERS
-- ============================================================
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  name text not null,
  email text,
  preferred_delivery_address text,
  first_order_at timestamptz default now(),
  last_order_at timestamptz default now(),
  total_orders int default 0,
  total_spend numeric(10,2) default 0,
  lifetime_packs_bought int default 0,
  notes text,
  created_at timestamptz default now()
);
create index if not exists idx_customers_phone on customers (phone);

-- ============================================================
-- 6. ORDERS
-- ============================================================
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  confirmation_number text unique not null,
  customer_id uuid references customers(id),
  customer_name text not null,
  customer_phone text not null,
  delivery_address text not null,
  subtotal numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total_price numeric(10,2) not null,
  status order_status default 'pending',
  source order_source default 'voice',
  vapi_call_id text,
  sms_sent boolean default false,
  sms_sent_at timestamptz,
  assigned_agent_id uuid references delivery_agents(id),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_orders_phone on orders (customer_phone);
create index if not exists idx_orders_status on orders (status);
create index if not exists idx_orders_confirmation on orders (confirmation_number);
create index if not exists idx_orders_created on orders (created_at desc);

-- ============================================================
-- 7. ORDER ITEMS
-- ============================================================
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade deferrable initially deferred,
  product_id uuid references products(id),
  product_name text not null,
  unit_price numeric(10,2) not null,
  quantity int not null default 1,
  line_total numeric(10,2) not null,
  created_at timestamptz default now()
);
create index if not exists idx_order_items_order on order_items (order_id);

-- ============================================================
-- 8. STOCK MOVEMENTS
-- ============================================================
create table if not exists stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id),
  change int not null,
  reason text,
  reference_id uuid,
  created_at timestamptz default now()
);

-- ============================================================
-- 9. FUNCTIONS
-- ============================================================

-- 9a. Confirmation number (e.g. RTH-260423-A7X3)
create or replace function generate_confirmation_number()
returns text as $$
begin
  return 'RTH-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(md5(random()::text), 1, 4));
end;
$$ language plpgsql;

-- 9b. Timestamp trigger
create or replace function update_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_orders_updated_at on orders;
create trigger trg_orders_updated_at before update on orders
for each row execute function update_timestamp();

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at before update on products
for each row execute function update_timestamp();

-- 9c. Deduct stock on confirmation
create or replace function deduct_stock_on_order()
returns trigger as $$
declare item record;
begin
  if new.status = 'confirmed' and (old.status is null or old.status = 'pending') then
    for item in select * from order_items where order_id = new.id loop
      update products set stock = stock - item.quantity, updated_at = now()
        where id = item.product_id and stock >= item.quantity;
      if not found then raise exception 'Insufficient stock for %', item.product_name; end if;
      insert into stock_movements (product_id, change, reason, reference_id)
        values (item.product_id, -item.quantity, 'order', new.id);
    end loop;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_deduct_stock on orders;
create trigger trg_deduct_stock after update on orders
for each row execute function deduct_stock_on_order();

-- 9d. Restore stock on cancel
create or replace function restore_stock_on_cancel()
returns trigger as $$
declare item record;
begin
  if new.status = 'cancelled' and old.status != 'cancelled' then
    for item in select * from order_items where order_id = new.id loop
      update products set stock = stock + item.quantity, updated_at = now()
        where id = item.product_id;
      insert into stock_movements (product_id, change, reason, reference_id)
        values (item.product_id, item.quantity, 'cancellation_restore', new.id);
    end loop;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_restore_stock on orders;
create trigger trg_restore_stock after update on orders
for each row execute function restore_stock_on_cancel();

-- 9e. Sync customer on order insert
create or replace function sync_customer_on_order()
returns trigger as $$
declare cig_packs int := 0; item record; prod record;
begin
  for item in select * from order_items where order_id = new.id loop
    select pc.discount_eligible into prod
    from products p join product_categories pc on p.category_id = pc.id
    where p.id = item.product_id;
    if prod.discount_eligible then cig_packs := cig_packs + item.quantity; end if;
  end loop;

  insert into customers (phone, name, first_order_at, last_order_at, total_orders, total_spend, lifetime_packs_bought, preferred_delivery_address)
  values (new.customer_phone, new.customer_name, now(), now(), 1, new.total_price, cig_packs, new.delivery_address)
  on conflict (phone) do update set
    name = excluded.name,
    last_order_at = now(),
    total_orders = customers.total_orders + 1,
    total_spend = customers.total_spend + excluded.total_spend,
    lifetime_packs_bought = customers.lifetime_packs_bought + excluded.lifetime_packs_bought,
    preferred_delivery_address = excluded.preferred_delivery_address;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_customer on orders;
create trigger trg_sync_customer after insert on orders
for each row execute function sync_customer_on_order();

-- ============================================================
-- 10. VIEWS
-- ============================================================
create or replace view v_order_summary as
select o.id, o.confirmation_number, o.customer_name, o.customer_phone, o.delivery_address,
       o.subtotal, o.discount, o.total_price, o.status::text, o.source::text,
       o.sms_sent, o.created_at, da.name as agent_name, da.phone as agent_phone,
       coalesce(json_agg(json_build_object(
         'product', oi.product_name, 'qty', oi.quantity,
         'unit_price', oi.unit_price, 'line_total', oi.line_total
       )) filter (where oi.id is not null), '[]'::json) as items
from orders o
left join delivery_agents da on o.assigned_agent_id = da.id
left join order_items oi on oi.order_id = o.id
group by o.id, da.name, da.phone;

create or replace view v_low_stock as
select id, brand, name, variant, stock, price
from products where active = true and stock <= 5
order by stock asc;

create or replace view v_top_customers as
select phone, name, total_orders, total_spend, lifetime_packs_bought, last_order_at
from customers order by total_spend desc limit 50;

-- ============================================================
-- 11. SEED: full catalogue (27 SKU families, variants inflated)
-- ============================================================
do $$
declare cat_cig uuid; cat_vape uuid; cat_snus uuid; cat_tobacco uuid;
begin
  select id into cat_cig     from product_categories where slug = 'cigarettes';
  select id into cat_vape    from product_categories where slug = 'vapes';
  select id into cat_snus    from product_categories where slug = 'nicotine-pouches';
  select id into cat_tobacco from product_categories where slug = 'tobacco-pouches';

  -- Cigarettes (min_order_qty = 2 per business rule)
  insert into products (category_id, brand, name, sku, price, stock, min_order_qty) values
    (cat_cig,'Marlboro','Marlboro Red','CIG-MARLBORO-RED',13.00,100,2),
    (cat_cig,'Manchester','Manchester Red','CIG-MANC-RED',15.00,100,2),
    (cat_cig,'Double Happiness','Double Happiness Soft Pack','CIG-DH-SOFT',20.00,100,2),
    (cat_cig,'Double Happiness','Double Happiness Red','CIG-DH-RED',15.00,100,2),
    (cat_cig,'Euro','Euro Red','CIG-EURO-RED',13.00,100,2),
    (cat_cig,'Manchester','Manchester Lights','CIG-MANC-LIGHTS',15.00,100,2),
    (cat_cig,'Manchester','Manchester Green Crush','CIG-MANC-GREEN',18.00,100,2),
    (cat_cig,'Oscar','Oscar','CIG-OSCAR',13.00,100,2),
    (cat_cig,'Manchester','Manchester Special Edition','CIG-MANC-SPECIAL',20.00,100,2),
    (cat_cig,'Manchester','Manchester Reserve','CIG-MANC-RESERVE',15.00,100,2),
    (cat_cig,'Gold Pin','Gold Pin','CIG-GOLDPIN',15.00,100,2),
    (cat_cig,'Esse','Esse Lights','CIG-ESSE-LIGHTS',13.00,100,2),
    (cat_cig,'Esse','Esse Menthol','CIG-ESSE-MENTHOL',15.00,100,2),
    (cat_cig,'Manchester','Manchester Double Drive','CIG-MANC-DDRIVE',18.00,100,2),
    (cat_cig,'Manchester','Manchester Original B','CIG-MANC-ORIGB',13.00,100,2),
    (cat_cig,'Winfield','Winfield Original Classic','CIG-WINFIELD-ORIG',13.00,100,2),
    (cat_cig,'JPS','JPS','CIG-JPS',13.00,100,2)
  on conflict (sku) do nothing;

  -- Vapes — Z Lodar $48
  insert into products (category_id, brand, name, variant, sku, price, stock) values
    (cat_vape,'Z Lodar','Z Lodar','Chuppa Chup Strawberry','VAPE-ZLOD-CHUPSTRAW',48.00,50),
    (cat_vape,'Z Lodar','Z Lodar','Blueberry Raspberry Ice','VAPE-ZLOD-BLURASP',48.00,50),
    (cat_vape,'Z Lodar','Z Lodar','Black Pomegranate Cherry','VAPE-ZLOD-BLKPOM',48.00,50),
    (cat_vape,'Z Lodar','Z Lodar','Blackberry Ice','VAPE-ZLOD-BLKICE',48.00,50),
    (cat_vape,'Z Lodar','Z Lodar','Skittles','VAPE-ZLOD-SKIT',48.00,50)
  on conflict (sku) do nothing;

  -- IGET One $70
  insert into products (category_id, brand, name, variant, sku, price, stock) values
    (cat_vape,'IGET','IGET One','Black Forest','VAPE-IGET1-BLKFOR',70.00,50),
    (cat_vape,'IGET','IGET One','Chuppa Chup Cherry','VAPE-IGET1-CHUPCHER',70.00,50),
    (cat_vape,'IGET','IGET One','Blue Monster','VAPE-IGET1-BLUMON',70.00,50),
    (cat_vape,'IGET','IGET One','Blueberry Raspberry','VAPE-IGET1-BLURASP',70.00,50),
    (cat_vape,'IGET','IGET One','Strawberry Raspberry','VAPE-IGET1-STRAWRASP',70.00,50),
    (cat_vape,'IGET','IGET One','Raspberry Grape Ice','VAPE-IGET1-RASPGRP',70.00,50),
    (cat_vape,'IGET','IGET One','Strawberry','VAPE-IGET1-STRAW',70.00,50),
    (cat_vape,'IGET','IGET One','Mixed Berry Ice','VAPE-IGET1-MIXBER',70.00,50),
    (cat_vape,'IGET','IGET One','Strawberry Pomegranate Ice','VAPE-IGET1-STRAWPOM',70.00,50),
    (cat_vape,'IGET','IGET One','Cherry Pomegranate','VAPE-IGET1-CHERPOM',70.00,50),
    (cat_vape,'IGET','IGET One','Tropical Orange Monster','VAPE-IGET1-TROPORG',70.00,50),
    (cat_vape,'IGET','IGET One','Cherry Monster','VAPE-IGET1-CHERMON',70.00,50)
  on conflict (sku) do nothing;

  -- IGET Bar Pro $55
  insert into products (category_id, brand, name, variant, sku, price, stock) values
    (cat_vape,'IGET','IGET Bar Pro','Grape Ice','VAPE-IGETPRO-GRPICE',55.00,50),
    (cat_vape,'IGET','IGET Bar Pro','Strawberry Watermelon Ice','VAPE-IGETPRO-STWMEL',55.00,50),
    (cat_vape,'IGET','IGET Bar Pro','Cherry Pomegranate','VAPE-IGETPRO-CHERPOM',55.00,50),
    (cat_vape,'IGET','IGET Bar Pro','Kiwi Pineapple','VAPE-IGETPRO-KWPIN',55.00,50),
    (cat_vape,'IGET','IGET Bar Pro','Blackberry Ice','VAPE-IGETPRO-BLKICE',55.00,50),
    (cat_vape,'IGET','IGET Bar Pro','Strawberry Kiwi','VAPE-IGETPRO-STKW',55.00,50),
    (cat_vape,'IGET','IGET Bar Pro','Black Pomegranate Cherry','VAPE-IGETPRO-BLKPOM',55.00,50),
    (cat_vape,'IGET','IGET Bar Pro','Blackberry Yogurt Ice Berry','VAPE-IGETPRO-BLKYOG',55.00,50),
    (cat_vape,'IGET','IGET Bar Pro','Passion Fruit Peach Iced Tea','VAPE-IGETPRO-PASPTEA',55.00,50),
    (cat_vape,'IGET','IGET Bar Pro','Strawberry Passion Fruit Mango','VAPE-IGETPRO-STPFM',55.00,50),
    (cat_vape,'IGET','IGET Bar Pro','Raspberry Grape','VAPE-IGETPRO-RASPGRP',55.00,50)
  on conflict (sku) do nothing;

  -- Ali Bar $63
  insert into products (category_id, brand, name, variant, sku, price, stock) values
    (cat_vape,'Ali','Ali Bar','Pink Lemon','VAPE-ALIBAR-PNKLMN',63.00,50),
    (cat_vape,'Ali','Ali Bar','Yellow Starburst','VAPE-ALIBAR-YLWSTR',63.00,50),
    (cat_vape,'Ali','Ali Bar','Cool Mint','VAPE-ALIBAR-CLMNT',63.00,50),
    (cat_vape,'Ali','Ali Bar','Quadruple Berry','VAPE-ALIBAR-QDBER',63.00,50),
    (cat_vape,'Ali','Ali Bar','Ribena','VAPE-ALIBAR-RIBEN',63.00,50),
    (cat_vape,'Ali','Ali Bar','Peach Ice','VAPE-ALIBAR-PCHICE',63.00,50),
    (cat_vape,'Ali','Ali Bar','Blueberry Mint','VAPE-ALIBAR-BLUMNT',63.00,50),
    (cat_vape,'Ali','Ali Bar','Hubba Bubba Grape','VAPE-ALIBAR-HUBBGR',63.00,50),
    (cat_vape,'Ali','Ali Bar','Cherry Pomegranate','VAPE-ALIBAR-CHERPOM',63.00,50),
    (cat_vape,'Ali','Ali Bar','Strawberry Kiwi','VAPE-ALIBAR-STKW',63.00,50),
    (cat_vape,'Ali','Ali Bar','Grapefruit Guava Lemon','VAPE-ALIBAR-GFGLMN',63.00,50)
  on conflict (sku) do nothing;

  -- Ali 12K $58
  insert into products (category_id, brand, name, variant, sku, price, stock) values
    (cat_vape,'Ali','Ali 12K','Pineapple Coconut','VAPE-ALI12K-PNCOC',58.00,50),
    (cat_vape,'Ali','Ali 12K','Watermelon','VAPE-ALI12K-WTMLN',58.00,50)
  on conflict (sku) do nothing;

  -- Bullubul $45
  insert into products (category_id, brand, name, variant, sku, price, stock) values
    (cat_vape,'Bullubul','Bullubul Vape','Midnight Dual Berry','VAPE-BULL-MDBER',45.00,50),
    (cat_vape,'Bullubul','Bullubul Vape','Blackberry Fabulous','VAPE-BULL-BLKFAB',45.00,50),
    (cat_vape,'Bullubul','Bullubul Vape','Midnight Blackberry','VAPE-BULL-MDBLK',45.00,50),
    (cat_vape,'Bullubul','Bullubul Vape','Quad Berry','VAPE-BULL-QDBER',45.00,50),
    (cat_vape,'Bullubul','Bullubul Vape','Watermelon','VAPE-BULL-WTMLN',45.00,50)
  on conflict (sku) do nothing;

  -- HQD Slick $40 (32 flavours)
  insert into products (category_id, brand, name, variant, sku, price, stock) values
    (cat_vape,'HQD','Slick','Banana Ice','VAPE-SLICK-BANIC',40.00,50),
    (cat_vape,'HQD','Slick','Banana Pomegranate Cherry','VAPE-SLICK-BANPOM',40.00,50),
    (cat_vape,'HQD','Slick','Black Dragon','VAPE-SLICK-BLKDRG',40.00,50),
    (cat_vape,'HQD','Slick','Black Ice','VAPE-SLICK-BLKICE',40.00,50),
    (cat_vape,'HQD','Slick','Blackberry Cherry Pomegranate','VAPE-SLICK-BLKCHPOM',40.00,50),
    (cat_vape,'HQD','Slick','Blackberry Raspberry Lemon','VAPE-SLICK-BLKRSLMN',40.00,50),
    (cat_vape,'HQD','Slick','Blueberry Lemonade','VAPE-SLICK-BLULMN',40.00,50),
    (cat_vape,'HQD','Slick','Blueberry Raspberry','VAPE-SLICK-BLURASP',40.00,50),
    (cat_vape,'HQD','Slick','Cherry Pomegranate','VAPE-SLICK-CHERPOM',40.00,50),
    (cat_vape,'HQD','Slick','Cola','VAPE-SLICK-COLA',40.00,50),
    (cat_vape,'HQD','Slick','Cola Ice','VAPE-SLICK-COLAICE',40.00,50),
    (cat_vape,'HQD','Slick','Grapey','VAPE-SLICK-GRAPEY',40.00,50),
    (cat_vape,'HQD','Slick','Guava Ice','VAPE-SLICK-GUAVICE',40.00,50),
    (cat_vape,'HQD','Slick','Ice Mint','VAPE-SLICK-ICEMNT',40.00,50),
    (cat_vape,'HQD','Slick','Kiwi Lemon','VAPE-SLICK-KWLMN',40.00,50),
    (cat_vape,'HQD','Slick','Kiwi Pineapple','VAPE-SLICK-KWPIN',40.00,50),
    (cat_vape,'HQD','Slick','Lemon Mint','VAPE-SLICK-LMNMNT',40.00,50),
    (cat_vape,'HQD','Slick','Lemon Passionfruit','VAPE-SLICK-LMNPAS',40.00,50),
    (cat_vape,'HQD','Slick','Lush Ice','VAPE-SLICK-LUSH',40.00,50),
    (cat_vape,'HQD','Slick','Mango Honeydew Ice','VAPE-SLICK-MNGHDY',40.00,50),
    (cat_vape,'HQD','Slick','Peach Berry','VAPE-SLICK-PCHBER',40.00,50),
    (cat_vape,'HQD','Slick','Raspberry Grape','VAPE-SLICK-RASPGRP',40.00,50),
    (cat_vape,'HQD','Slick','Sour Gummy Worms','VAPE-SLICK-SRGUMMY',40.00,50),
    (cat_vape,'HQD','Slick','Strawberry Kiwi','VAPE-SLICK-STKW',40.00,50),
    (cat_vape,'HQD','Slick','Strawberry Mango','VAPE-SLICK-STMNG',40.00,50),
    (cat_vape,'HQD','Slick','Strawberry Watermelon','VAPE-SLICK-STWML',40.00,50),
    (cat_vape,'HQD','Slick','Tobacco','VAPE-SLICK-TOBAC',40.00,50),
    (cat_vape,'HQD','Slick','Watermelon Bubblegum','VAPE-SLICK-WTMLBUB',40.00,50),
    (cat_vape,'HQD','Slick','Mixed Berries','VAPE-SLICK-MIXBER',40.00,50),
    (cat_vape,'HQD','Slick','Mango Magic','VAPE-SLICK-MNGMAG',40.00,50),
    (cat_vape,'HQD','Slick','Passionfruit Mango Lemon','VAPE-SLICK-PASMLN',40.00,50),
    (cat_vape,'HQD','Slick','Watermelon Ice','VAPE-SLICK-WTMLICE',40.00,50)
  on conflict (sku) do nothing;

  -- Zyn $25
  insert into products (category_id, brand, name, variant, sku, price, stock) values
    (cat_snus,'Zyn','Zyn','Fresh Mint','SNUS-ZYN-FRSHMNT',25.00,80),
    (cat_snus,'Zyn','Zyn','Cool Frost','SNUS-ZYN-CLFROST',25.00,80),
    (cat_snus,'Zyn','Zyn','Cool Mint','SNUS-ZYN-CLMNT',25.00,80),
    (cat_snus,'Zyn','Zyn','Cool Watermelon','SNUS-ZYN-CLWTML',25.00,80),
    (cat_snus,'Zyn','Zyn','Spearmint','SNUS-ZYN-SPRMNT',25.00,80),
    (cat_snus,'Zyn','Zyn','Citrus','SNUS-ZYN-CITRUS',25.00,80),
    (cat_snus,'Zyn','Zyn','Espresso','SNUS-ZYN-ESPRS',25.00,80),
    (cat_snus,'Zyn','Zyn','Wintergreen','SNUS-ZYN-WNTGRN',25.00,80),
    (cat_snus,'Zyn','Zyn','Smooth Mint','SNUS-ZYN-SMTHMNT',25.00,80)
  on conflict (sku) do nothing;

  -- Velo $25
  insert into products (category_id, brand, name, variant, sku, price, stock) values
    (cat_snus,'Velo','Velo','X Freeze','SNUS-VELO-XFRZ',25.00,80),
    (cat_snus,'Velo','Velo','Polar Mint','SNUS-VELO-PLRMNT',25.00,80),
    (cat_snus,'Velo','Velo','Berry Frost','SNUS-VELO-BERFST',25.00,80),
    (cat_snus,'Velo','Velo','Ice Cool','SNUS-VELO-ICECC',25.00,80),
    (cat_snus,'Velo','Velo','Tropical Mint','SNUS-VELO-TRPMNT',25.00,80),
    (cat_snus,'Velo','Velo','Cinnamon','SNUS-VELO-CINNM',25.00,80),
    (cat_snus,'Velo','Velo','Ruby Berry','SNUS-VELO-RUBYB',25.00,80)
  on conflict (sku) do nothing;

  -- Tobacco pouches
  insert into products (category_id, brand, name, variant, sku, price, stock) values
    (cat_tobacco,'Manchester','Manchester Tobacco Pouch','1kg','TOB-MANC-1KG',105.00,30),
    (cat_tobacco,'Manchester','Manchester Tobacco Pouch','100g','TOB-MANC-100G',28.00,50)
  on conflict (sku) do nothing;
end $$;

-- ============================================================
-- 12. RPC: search_products (voice-agent fuzzy lookup)
-- ============================================================
create or replace function search_products(search_query text)
returns table (
  id uuid, brand text, name text, variant text,
  price numeric, stock int, category text, in_stock boolean
) as $$
begin
  return query
  select p.id, p.brand, p.name, p.variant, p.price, p.stock,
         pc.name as category, (p.stock > 0 and p.active) as in_stock
  from products p join product_categories pc on p.category_id = pc.id
  where p.active = true and (
        p.name ilike '%' || search_query || '%'
     or p.brand ilike '%' || search_query || '%'
     or p.variant ilike '%' || search_query || '%'
     or p.sku ilike '%' || search_query || '%'
  )
  order by
    case when p.name ilike search_query then 0
         when p.name ilike search_query || '%' then 1
         when p.variant ilike '%' || search_query || '%' then 2
         else 3 end, p.name
  limit 10;
end;
$$ language plpgsql;

-- 13. RPC: get_customer_context
create or replace function get_customer_context(p_phone text)
returns json as $$
declare result json;
begin
  select json_build_object(
    'found', true, 'name', c.name, 'total_orders', c.total_orders,
    'total_spend', c.total_spend, 'lifetime_packs', c.lifetime_packs_bought,
    'preferred_address', c.preferred_delivery_address,
    'last_order', c.last_order_at,
    'packs_until_next_discount', 10 - (c.lifetime_packs_bought % 10)
  ) into result from customers c where c.phone = p_phone;
  if result is null then result := json_build_object('found', false); end if;
  return result;
end;
$$ language plpgsql;

-- 14. RPC: place_order (atomic)
create or replace function place_order(
  p_customer_name text, p_customer_phone text, p_delivery_address text,
  p_items jsonb, p_source text default 'voice', p_vapi_call_id text default null
) returns json as $$
declare
  v_order_id uuid; v_conf text;
  v_subtotal numeric := 0; v_discount numeric := 0; v_total numeric := 0;
  v_item jsonb; v_product record; v_cig_packs int := 0; v_qty int;
begin
  v_conf := generate_confirmation_number();
  v_order_id := gen_random_uuid();

  for v_item in select * from jsonb_array_elements(p_items) loop
    select p.*, pc.discount_eligible into v_product
    from products p join product_categories pc on p.category_id = pc.id
    where (lower(p.name) = lower(v_item->>'name')
        or lower(p.brand || ' ' || p.name) = lower(v_item->>'name')
        or p.sku = v_item->>'sku') and p.active = true
    limit 1;

    if v_product is null then
      return json_build_object('success', false, 'error', 'Product not found: ' || (v_item->>'name'));
    end if;

    v_qty := coalesce((v_item->>'quantity')::int, 1);
    if v_qty < v_product.min_order_qty then
      return json_build_object('success', false, 'error',
        v_product.name || ' requires min qty ' || v_product.min_order_qty);
    end if;
    if v_product.stock < v_qty then
      return json_build_object('success', false, 'error',
        v_product.name || ' out of stock (only ' || v_product.stock || ' left)');
    end if;

    v_subtotal := v_subtotal + (v_product.price * v_qty);
    if v_product.discount_eligible then v_cig_packs := v_cig_packs + v_qty; end if;

    insert into order_items (order_id, product_id, product_name, unit_price, quantity, line_total)
    values (v_order_id, v_product.id,
            v_product.brand || ' ' || v_product.name || coalesce(' - ' || v_product.variant, ''),
            v_product.price, v_qty, v_product.price * v_qty);
  end loop;

  v_discount := (v_cig_packs / 10) * 5.00;
  v_total := v_subtotal - v_discount;

  insert into orders (id, confirmation_number, customer_name, customer_phone, delivery_address,
                      subtotal, discount, total_price, source, vapi_call_id)
  values (v_order_id, v_conf, p_customer_name, p_customer_phone, p_delivery_address,
          v_subtotal, v_discount, v_total, p_source::order_source, p_vapi_call_id);

  return json_build_object(
    'success', true, 'order_id', v_order_id, 'confirmation_number', v_conf,
    'subtotal', v_subtotal, 'discount', v_discount, 'total', v_total,
    'cig_packs_in_order', v_cig_packs,
    'message', case when v_discount > 0 then 'Bulk discount of $' || v_discount || ' applied' else null end
  );
end;
$$ language plpgsql;
