-- Independent Tables

-- Accounts
create table public.accounts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    institution text,
    currency char(3) not null,
    type text
);

-- Categories
create table public.categories (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    name text not null,
    icon text,
    color text
);

-- Groups & Sharing
create table public.groups (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    owner_id uuid not null references auth.users(id)
);

-- AI Advice
create table public.ai_advice (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    snapshot_hash text not null,
    provider text not null,
    prompt_version int not null,
    advice jsonb not null,
    created_at timestamptz default now(),
    tokens_in int,
    tokens_out int,
    cost_estimate numeric(9,6)
);

-- Dependent Tables

-- Transactions (depends on accounts)
create table public.transactions (
    id uuid primary key default gen_random_uuid(),
    account_id uuid not null references public.accounts(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    date timestamptz not null,
    amount numeric(12,2) not null,
    description text not null,
    note text,
    receipt_url text
);

-- Line Items (OCR detail) (depends on transactions, categories)
create table public.transaction_items (
    id uuid primary key default gen_random_uuid(),
    transaction_id uuid not null references public.transactions(id) on delete cascade,
    description text not null,
    amount numeric(12,2) not null,
    category_id uuid references public.categories(id),
    raw_data jsonb
);

-- Category Rules (depends on categories)
create table public.category_rules (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    pattern text not null,
    field text not null check (field in ('description', 'store_name')),
    category_id uuid not null references public.categories(id) on delete cascade,
    priority int default 0
);

-- Group Members (depends on groups)
create table public.group_members (
    group_id uuid not null references public.groups(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role text not null check (role in ('owner', 'admin', 'member')),
    primary key (group_id, user_id)
);

-- Shared Accounts (depends on accounts, groups)
create table public.shared_accounts (
    account_id uuid not null references public.accounts(id) on delete cascade,
    group_id uuid not null references public.groups(id) on delete cascade,
    primary key (account_id, group_id)
);

-- Budgets (depends on groups, categories)
create table public.budgets (
    id uuid primary key default gen_random_uuid(),
    scope text not null check (scope in ('personal','group')),
    owner_id uuid references auth.users(id),
    group_id uuid references public.groups(id),
    category_id uuid references public.categories(id),
    period_start date not null,
    period_end date not null,
    amount numeric(12,2) not null,
    rollover boolean default false
);


-- RLS Policies
-- Enable RLS
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_items enable row level security;
alter table public.categories enable row level security;
alter table public.category_rules enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.shared_accounts enable row level security;
alter table public.budgets enable row level security;
alter table public.ai_advice enable row level security;

-- Accounts: owner only
create policy "Accounts are viewable by owner"
  on public.accounts for select
  using (auth.uid() = user_id);

create policy "Accounts are manageable by owner"
  on public.accounts for all
  using (auth.uid() = user_id);

-- Transactions: owner or shared group
create policy "Transactions viewable by owner or group member"
  on public.transactions for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.shared_accounts sa
      join public.group_members gm on gm.group_id = sa.group_id
      where sa.account_id = transactions.account_id
      and gm.user_id = auth.uid()
    )
  );

create policy "Transactions modifiable by owner"
  on public.transactions for all
  using (auth.uid() = user_id);

-- Transaction items: same as parent
create policy "Items viewable by linked transaction access"
  on public.transaction_items for select
  using (
    exists (
      select 1 from public.transactions t
      where t.id = transaction_items.transaction_id
      and (
        t.user_id = auth.uid()
        or exists (
          select 1 from public.shared_accounts sa
          join public.group_members gm on gm.group_id = sa.group_id
          where sa.account_id = t.account_id
          and gm.user_id = auth.uid()
        )
      )
    )
  );

-- Categories: owner only
create policy "Categories viewable by owner"
  on public.categories for select
  using (user_id is null or auth.uid() = user_id);

create policy "Categories modifiable by owner"
  on public.categories for all
  using (auth.uid() = user_id);

-- Category rules: owner only
create policy "Rules viewable by owner"
  on public.category_rules for select
  using (auth.uid() = user_id);

create policy "Rules modifiable by owner"
  on public.category_rules for all
  using (auth.uid() = user_id);

-- Groups: owner & members
create policy "Groups viewable by members"
  on public.groups for select
  using (
    auth.uid() = owner_id
    or exists (select 1 from public.group_members gm where gm.group_id = id and gm.user_id = auth.uid())
  );

create policy "Groups modifiable by owner"
  on public.groups for all
  using (auth.uid() = owner_id);

-- Group members: only within group
create policy "Group members viewable by group members"
  on public.group_members for select
  using (
    exists (select 1 from public.group_members gm where gm.group_id = group_members.group_id and gm.user_id = auth.uid())
  );

-- Shared accounts: only visible if in group
create policy "Shared accounts visible to group members"
  on public.shared_accounts for select
  using (
    exists (select 1 from public.group_members gm where gm.group_id = shared_accounts.group_id and gm.user_id = auth.uid())
  );

-- Budgets: personal owner or group members
create policy "Budgets viewable by owner or group members"
  on public.budgets for select
  using (
    (scope = 'personal' and owner_id = auth.uid())
    or (scope = 'group' and exists (select 1 from public.group_members gm where gm.group_id = budgets.group_id and gm.user_id = auth.uid()))
  );

-- AI Advice: only by owner
create policy "AI advice viewable by owner"
  on public.ai_advice for select
  using (auth.uid() = user_id);

create policy "AI advice modifiable by owner"
  on public.ai_advice for all
  using (auth.uid() = user_id);

-- Create a bucket for receipts
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false);

-- Policy: Only the owner of the file can access
create policy "Users can upload their own receipts"
on storage.objects
for insert
with check (
  bucket_id = 'receipts'
  and (auth.uid())::text = (storage.foldername(name))[1]  -- first path segment is user_id
);

create policy "Users can read their own receipts"
on storage.objects
for select
using (
  bucket_id = 'receipts'
  and (auth.uid())::text = (storage.foldername(name))[1]
);
