-- ============================================================
-- FINANZAS APP — Initial Schema
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
create type account_type       as enum ('cash', 'bank', 'digital', 'credit');
create type category_type      as enum ('expense', 'income');
create type transaction_type   as enum ('income', 'expense', 'transfer');
create type contribution_type  as enum ('deposit', 'withdrawal');
create type wishlist_priority  as enum ('low', 'medium', 'high');

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles (1-1 with auth.users)
create table profiles (
  id               uuid references auth.users(id) on delete cascade primary key,
  full_name        text,
  avatar_url       text,
  default_currency varchar(3) not null default 'USD',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Accounts / Wallets
create table accounts (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references profiles(id) on delete cascade not null,
  name       varchar(100) not null,
  type       account_type not null default 'cash',
  currency   varchar(3) not null default 'USD',
  balance    numeric(12,2) not null default 0,
  color      varchar(7) default '#1b667c',
  icon       varchar(50) default 'Wallet',
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Categories (user_id NULL = system default)
create table categories (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references profiles(id) on delete cascade,
  name       varchar(100) not null,
  type       category_type not null,
  icon       varchar(50) not null default 'Tag',
  color      varchar(7) not null default '#6b7280',
  created_at timestamptz not null default now()
);

-- Transactions
create table transactions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references profiles(id) on delete cascade not null,
  account_id  uuid references accounts(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  type        transaction_type not null,
  amount      numeric(12,2) not null check (amount > 0),
  currency    varchar(3) not null default 'USD',
  description text not null,
  date        date not null default current_date,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Savings Goals
create table savings_goals (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references profiles(id) on delete cascade not null,
  name           varchar(100) not null,
  target_amount  numeric(12,2) not null check (target_amount > 0),
  current_amount numeric(12,2) not null default 0 check (current_amount >= 0),
  currency       varchar(3) not null default 'USD',
  target_date    date,
  color          varchar(7) default '#1b667c',
  icon           varchar(50) default 'PiggyBank',
  is_completed   boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Savings Contributions
create table savings_contributions (
  id         uuid primary key default uuid_generate_v4(),
  goal_id    uuid references savings_goals(id) on delete cascade not null,
  user_id    uuid references profiles(id) on delete cascade not null,
  amount     numeric(12,2) not null check (amount > 0),
  type       contribution_type not null default 'deposit',
  notes      text,
  date       date not null default current_date,
  created_at timestamptz not null default now()
);

-- Wishlist Items
create table wishlist_items (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references profiles(id) on delete cascade not null,
  name         varchar(200) not null,
  description  text,
  price        numeric(12,2) check (price >= 0),
  currency     varchar(3) not null default 'USD',
  url          text,
  image_url    text,
  priority     wishlist_priority not null default 'medium',
  is_purchased boolean not null default false,
  purchased_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Exchange Rates Cache
create table exchange_rates (
  id              uuid primary key default uuid_generate_v4(),
  base_currency   varchar(3) not null,
  target_currency varchar(3) not null,
  rate            numeric(18,6) not null,
  fetched_at      timestamptz not null default now(),
  unique(base_currency, target_currency)
);

-- ============================================================
-- INDEXES
-- ============================================================
create index transactions_user_date_idx      on transactions(user_id, date desc);
create index transactions_account_idx        on transactions(account_id);
create index transactions_category_idx       on transactions(category_id);
create index savings_contributions_goal_idx  on savings_contributions(goal_id);
create index wishlist_user_idx               on wishlist_items(user_id);
create index accounts_user_idx               on accounts(user_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at          before update on profiles           for each row execute function update_updated_at();
create trigger accounts_updated_at          before update on accounts           for each row execute function update_updated_at();
create trigger transactions_updated_at      before update on transactions       for each row execute function update_updated_at();
create trigger savings_goals_updated_at     before update on savings_goals      for each row execute function update_updated_at();
create trigger wishlist_items_updated_at    before update on wishlist_items     for each row execute function update_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- SEED DEFAULT CATEGORIES
-- ============================================================
insert into categories (user_id, name, type, icon, color) values
  -- Gastos
  (null, 'Alimentación',    'expense', 'UtensilsCrossed', '#ef4444'),
  (null, 'Transporte',      'expense', 'Car',             '#f97316'),
  (null, 'Vivienda',        'expense', 'Home',            '#8b5cf6'),
  (null, 'Salud',           'expense', 'HeartPulse',      '#ec4899'),
  (null, 'Educación',       'expense', 'BookOpen',        '#3b82f6'),
  (null, 'Entretenimiento', 'expense', 'Tv',              '#14b8a6'),
  (null, 'Ropa',            'expense', 'ShoppingBag',     '#a855f7'),
  (null, 'Servicios',       'expense', 'Zap',             '#eab308'),
  (null, 'Personal',        'expense', 'User',            '#06b6d4'),
  (null, 'Otros',           'expense', 'MoreHorizontal',  '#6b7280'),
  -- Ingresos
  (null, 'Salario',         'income',  'Briefcase',   '#22c55e'),
  (null, 'Freelance',       'income',  'Laptop',      '#10b981'),
  (null, 'Inversión',       'income',  'TrendingUp',  '#84cc16'),
  (null, 'Regalo',          'income',  'Gift',        '#f43f5e'),
  (null, 'Otros ingresos',  'income',  'PlusCircle',  '#6b7280');

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles             enable row level security;
alter table accounts             enable row level security;
alter table categories           enable row level security;
alter table transactions         enable row level security;
alter table savings_goals        enable row level security;
alter table savings_contributions enable row level security;
alter table wishlist_items       enable row level security;
alter table exchange_rates       enable row level security;

-- Profiles
create policy "profile_select" on profiles for select using (auth.uid() = id);
create policy "profile_update" on profiles for update using (auth.uid() = id);

-- Accounts
create policy "accounts_all" on accounts for all using (auth.uid() = user_id);

-- Categories (propias + defaults del sistema)
create policy "categories_select" on categories for select
  using (user_id is null or auth.uid() = user_id);
create policy "categories_insert" on categories for insert
  with check (auth.uid() = user_id);
create policy "categories_update" on categories for update
  using (auth.uid() = user_id and user_id is not null);
create policy "categories_delete" on categories for delete
  using (auth.uid() = user_id and user_id is not null);

-- Transactions
create policy "transactions_all" on transactions for all using (auth.uid() = user_id);

-- Savings Goals
create policy "savings_goals_all" on savings_goals for all using (auth.uid() = user_id);

-- Savings Contributions
create policy "contributions_all" on savings_contributions for all using (auth.uid() = user_id);

-- Wishlist
create policy "wishlist_all" on wishlist_items for all using (auth.uid() = user_id);

-- Exchange Rates (solo lectura para usuarios autenticados)
create policy "rates_select" on exchange_rates for select
  to authenticated using (true);
