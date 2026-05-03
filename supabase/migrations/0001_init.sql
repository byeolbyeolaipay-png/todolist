-- categories 테이블
create table public.categories (
  id          uuid primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  color       text not null default '#3b82f6',
  is_default  boolean not null default false,
  created_at  bigint not null
);

-- tasks 테이블
create table public.tasks (
  id           uuid primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  category_id  uuid references public.categories(id) on delete set null,
  title        text not null,
  description  text,
  due_at       bigint,
  priority     text not null default 'normal' check (priority in ('low','normal','high')),
  status       text not null default 'active' check (status in ('active','completed','trashed')),
  completed_at bigint,
  created_at   bigint not null,
  updated_at   bigint not null
);

-- 인덱스
create index tasks_user_status   on public.tasks(user_id, status);
create index tasks_user_due      on public.tasks(user_id, due_at);
create index tasks_user_category on public.tasks(user_id, category_id);

-- RLS 활성화
alter table public.categories enable row level security;
alter table public.tasks      enable row level security;

-- categories RLS
create policy "categories: 본인 row만"
  on public.categories for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- tasks RLS
create policy "tasks: 본인 row만"
  on public.tasks for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
