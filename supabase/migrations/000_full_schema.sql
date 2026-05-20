-- ============================================================
-- FINANZAS APP — Full Schema (run this once on a clean DB)
-- ============================================================

-- Extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
do $$ begin
  create type account_type      as enum ('cash', 'bank', 'digital', 'credit');
exception when duplicate_object then null; end $$;

do $$ begin
  create type category_type     as enum ('expense', 'income');
exception when duplicate_object then null; end $$;

do $$ begin
  create type transaction_type  as enum ('income', 'expense', 'transfer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type contribution_type as enum ('deposit', 'withdrawal');
exception when duplicate_object then null; end $$;

do $$ begin
  create type wishlist_priority as enum ('low', 'medium', 'high');
exception when duplicate_object then null; end $$;

do $$ begin
  create type debt_type as enum (
    'credit_card', 'personal_loan', 'mortgage',
    'car_loan', 'student_loan', 'other'
  );
exception when duplicate_object then null; end $$;

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists profiles (
  id               uuid references auth.users(id) on delete cascade primary key,
  full_name        text,
  avatar_url       text,
  default_currency varchar(3) not null default 'USD',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists accounts (
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

create table if not exists categories (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references profiles(id) on delete cascade,
  name       varchar(100) not null,
  type       category_type not null,
  icon       varchar(50) not null default 'Tag',
  color      varchar(7) not null default '#6b7280',
  created_at timestamptz not null default now()
);

create table if not exists transactions (
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

create table if not exists savings_goals (
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

create table if not exists savings_contributions (
  id         uuid primary key default uuid_generate_v4(),
  goal_id    uuid references savings_goals(id) on delete cascade not null,
  user_id    uuid references profiles(id) on delete cascade not null,
  amount     numeric(12,2) not null check (amount > 0),
  type       contribution_type not null default 'deposit',
  notes      text,
  date       date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists wishlist_items (
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

create table if not exists exchange_rates (
  id              uuid primary key default uuid_generate_v4(),
  base_currency   varchar(3) not null,
  target_currency varchar(3) not null,
  rate            numeric(18,6) not null,
  fetched_at      timestamptz not null default now(),
  unique(base_currency, target_currency)
);

create table if not exists debts (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references profiles(id) on delete cascade not null,
  name          varchar(100) not null,
  type          debt_type not null default 'other',
  total_amount  numeric(12,2) not null check (total_amount > 0),
  paid_amount   numeric(12,2) not null default 0 check (paid_amount >= 0),
  currency      varchar(3) not null default 'USD',
  interest_rate numeric(5,2),
  due_date      date,
  color         varchar(7) default '#ba1a1a',
  notes         text,
  is_settled    boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists debt_payments (
  id         uuid primary key default uuid_generate_v4(),
  debt_id    uuid references debts(id) on delete cascade not null,
  user_id    uuid references profiles(id) on delete cascade not null,
  amount     numeric(12,2) not null check (amount > 0),
  notes      text,
  date       date not null default current_date,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists transactions_user_date_idx     on transactions(user_id, date desc);
create index if not exists transactions_account_idx       on transactions(account_id);
create index if not exists transactions_category_idx      on transactions(category_id);
create index if not exists savings_contributions_goal_idx on savings_contributions(goal_id);
create index if not exists wishlist_user_idx              on wishlist_items(user_id);
create index if not exists accounts_user_idx              on accounts(user_id);
create index if not exists debts_user_idx                 on debts(user_id);
create index if not exists debt_payments_debt_idx         on debt_payments(debt_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$ begin
  create trigger profiles_updated_at          before update on profiles            for each row execute function update_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger accounts_updated_at          before update on accounts            for each row execute function update_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger transactions_updated_at      before update on transactions        for each row execute function update_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger savings_goals_updated_at     before update on savings_goals       for each row execute function update_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger wishlist_items_updated_at    before update on wishlist_items      for each row execute function update_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger debts_updated_at             before update on debts               for each row execute function update_updated_at();
exception when duplicate_object then null; end $$;

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- SEED DEFAULT CATEGORIES (skip if already seeded)
-- ============================================================
insert into categories (user_id, name, type, icon, color)
select * from (values
  (null::uuid, 'Alimentación',    'expense'::category_type, 'UtensilsCrossed', '#ef4444'),
  (null::uuid, 'Transporte',      'expense'::category_type, 'Car',             '#f97316'),
  (null::uuid, 'Vivienda',        'expense'::category_type, 'Home',            '#8b5cf6'),
  (null::uuid, 'Salud',           'expense'::category_type, 'HeartPulse',      '#ec4899'),
  (null::uuid, 'Educación',       'expense'::category_type, 'BookOpen',        '#3b82f6'),
  (null::uuid, 'Entretenimiento', 'expense'::category_type, 'Tv',              '#14b8a6'),
  (null::uuid, 'Ropa',            'expense'::category_type, 'ShoppingBag',     '#a855f7'),
  (null::uuid, 'Servicios',       'expense'::category_type, 'Zap',             '#eab308'),
  (null::uuid, 'Personal',        'expense'::category_type, 'User',            '#06b6d4'),
  (null::uuid, 'Otros',           'expense'::category_type, 'MoreHorizontal',  '#6b7280'),
  (null::uuid, 'Salario',         'income'::category_type,  'Briefcase',       '#22c55e'),
  (null::uuid, 'Freelance',       'income'::category_type,  'Laptop',          '#10b981'),
  (null::uuid, 'Inversión',       'income'::category_type,  'TrendingUp',      '#84cc16'),
  (null::uuid, 'Regalo',          'income'::category_type,  'Gift',            '#f43f5e'),
  (null::uuid, 'Otros ingresos',  'income'::category_type,  'PlusCircle',      '#6b7280')
) as v(user_id, name, type, icon, color)
where not exists (select 1 from categories where user_id is null);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles              enable row level security;
alter table accounts              enable row level security;
alter table categories            enable row level security;
alter table transactions          enable row level security;
alter table savings_goals         enable row level security;
alter table savings_contributions enable row level security;
alter table wishlist_items        enable row level security;
alter table exchange_rates        enable row level security;
alter table debts                 enable row level security;
alter table debt_payments         enable row level security;

-- Profiles
do $$ begin
  create policy "profile_select" on profiles for select using (auth.uid() = id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "profile_update" on profiles for update using (auth.uid() = id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "profile_insert" on profiles for insert with check (auth.uid() = id);
exception when duplicate_object then null; end $$;

-- Accounts
do $$ begin
  create policy "accounts_all" on accounts for all using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Categories
do $$ begin
  create policy "categories_select" on categories for select
    using (user_id is null or auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "categories_insert" on categories for insert
    with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "categories_update" on categories for update
    using (auth.uid() = user_id and user_id is not null);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "categories_delete" on categories for delete
    using (auth.uid() = user_id and user_id is not null);
exception when duplicate_object then null; end $$;

-- Transactions
do $$ begin
  create policy "transactions_all" on transactions for all using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Savings Goals
do $$ begin
  create policy "savings_goals_all" on savings_goals for all using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Savings Contributions
do $$ begin
  create policy "contributions_all" on savings_contributions for all using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Wishlist
do $$ begin
  create policy "wishlist_all" on wishlist_items for all using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Exchange Rates
do $$ begin
  create policy "rates_select" on exchange_rates for select to authenticated using (true);
exception when duplicate_object then null; end $$;

-- Debts
do $$ begin
  create policy "debts_all" on debts for all using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "debt_payments_all" on debt_payments for all using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
