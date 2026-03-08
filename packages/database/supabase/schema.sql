create extension if not exists "pgcrypto";

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists clinic_profiles (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  clinic_name text not null,
  timezone text,
  address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists doctor_profiles (
  id uuid primary key default gen_random_uuid(),
  clinic_profile_id uuid not null references clinic_profiles(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  license_number text,
  specialty text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists prescription_templates (
  id uuid primary key default gen_random_uuid(),
  clinic_profile_id uuid not null references clinic_profiles(id) on delete cascade,
  name text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists repositories (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  provider text not null default 'github',
  external_id text,
  url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists github_connections (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  name text not null,
  owner text not null,
  auth_type text not null default 'token',
  token_ref text,
  installation_id text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists github_repositories (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references github_connections(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  owner text not null,
  repo text not null,
  full_name text not null,
  default_branch text,
  is_private boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (connection_id, owner, repo)
);

create table if not exists databases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  adapter text not null,
  connection_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table databases add column if not exists client_id uuid references clients(id) on delete set null;
alter table databases add column if not exists config jsonb not null default '{}'::jsonb;
alter table databases add column if not exists is_active boolean not null default true;
alter table databases alter column project_id drop not null;

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  provider text not null default 'stripe',
  external_id text,
  plan text not null,
  status text not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists billing_profiles (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  provider text not null default 'stripe',
  mode text not null default 'platform',
  stripe_account_id text,
  stripe_customer_id text,
  key_ref text,
  webhook_secret_ref text,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, provider, mode)
);

create table if not exists subscription_entitlements (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  subscription_id uuid references subscriptions(id) on delete set null,
  feature_key text not null,
  is_enabled boolean not null default true,
  limit_value numeric,
  period text not null default 'month',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, feature_key)
);

create table if not exists receipts (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references subscriptions(id) on delete cascade,
  amount_cents bigint not null,
  currency text not null default 'usd',
  provider_receipt_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists usage_events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  event_name text not null,
  payload jsonb not null default '{}'::jsonb,
  event_timestamp timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists usage_metrics (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  metric_name text not null,
  metric_value numeric not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  title text not null,
  content jsonb not null,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tenant_branding (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  app_id text not null default 'default',
  brand_name text not null,
  logo_url text,
  favicon_url text,
  primary_color text,
  secondary_color text,
  accent_color text,
  locale text not null default 'en-AU',
  timezone text,
  domain text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, app_id)
);

create table if not exists tenant_features (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  app_id text not null default 'default',
  feature_key text not null,
  is_enabled boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  rollout text not null default 'general',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, app_id, feature_key)
);

create table if not exists user_platform_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  role_key text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, role_key)
);

create table if not exists user_client_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  role_key text not null,
  scope jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, client_id)
);

create table if not exists lab_projects (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete set null,
  name text not null,
  status text not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_tenant_branding_updated_at on tenant_branding;
create trigger trg_tenant_branding_updated_at
before update on tenant_branding
for each row
execute function set_updated_at();

drop trigger if exists trg_tenant_features_updated_at on tenant_features;
create trigger trg_tenant_features_updated_at
before update on tenant_features
for each row
execute function set_updated_at();

drop trigger if exists trg_user_platform_roles_updated_at on user_platform_roles;
create trigger trg_user_platform_roles_updated_at
before update on user_platform_roles
for each row
execute function set_updated_at();

drop trigger if exists trg_user_client_memberships_updated_at on user_client_memberships;
create trigger trg_user_client_memberships_updated_at
before update on user_client_memberships
for each row
execute function set_updated_at();

create index if not exists idx_usage_events_client_ts on usage_events(client_id, event_timestamp desc);
create index if not exists idx_usage_metrics_client_period on usage_metrics(client_id, period_start, period_end);
create index if not exists idx_subscriptions_client on subscriptions(client_id);
create index if not exists idx_databases_client on databases(client_id);
create unique index if not exists idx_subscriptions_external_id_unique on subscriptions(external_id) where external_id is not null;
create unique index if not exists idx_receipts_provider_receipt_id_unique on receipts(provider_receipt_id) where provider_receipt_id is not null;
create index if not exists idx_billing_profiles_client on billing_profiles(client_id);
create index if not exists idx_subscription_entitlements_client on subscription_entitlements(client_id);
create index if not exists idx_github_connections_client on github_connections(client_id);
create index if not exists idx_github_repositories_connection on github_repositories(connection_id);
create index if not exists idx_github_repositories_client on github_repositories(client_id);
create index if not exists idx_tenant_branding_client on tenant_branding(client_id);
create index if not exists idx_tenant_features_client_app on tenant_features(client_id, app_id);
create index if not exists idx_user_platform_roles_user on user_platform_roles(user_id);
create index if not exists idx_user_client_memberships_user on user_client_memberships(user_id);
create index if not exists idx_user_client_memberships_client on user_client_memberships(client_id);
