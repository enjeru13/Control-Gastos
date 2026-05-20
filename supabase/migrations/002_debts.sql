-- ============================================================
-- DEBTS & PAYMENTS
-- ============================================================

create type debt_type as enum (
  'credit_card', 'personal_loan', 'mortgage',
  'car_loan', 'student_loan', 'other'
);

create table debts (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references profiles(id) on delete cascade not null,
  name         varchar(100) not null,
  type         debt_type not null default 'other',
  total_amount numeric(12,2) not null check (total_amount > 0),
  paid_amount  numeric(12,2) not null default 0 check (paid_amount >= 0),
  currency     varchar(3) not null default 'USD',
  interest_rate numeric(5,2),   -- % anual, nullable
  due_date     date,
  color        varchar(7) default '#ba1a1a',
  notes        text,
  is_settled   boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table debt_payments (
  id         uuid primary key default uuid_generate_v4(),
  debt_id    uuid references debts(id) on delete cascade not null,
  user_id    uuid references profiles(id) on delete cascade not null,
  amount     numeric(12,2) not null check (amount > 0),
  notes      text,
  date       date not null default current_date,
  created_at timestamptz not null default now()
);

-- Indexes
create index debts_user_idx         on debts(user_id);
create index debt_payments_debt_idx  on debt_payments(debt_id);

-- Updated_at trigger
create trigger debts_updated_at
  before update on debts
  for each row execute function update_updated_at();

-- RLS
alter table debts         enable row level security;
alter table debt_payments enable row level security;

create policy "debts_all"         on debts         for all using (auth.uid() = user_id);
create policy "debt_payments_all" on debt_payments  for all using (auth.uid() = user_id);
