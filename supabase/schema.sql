-- 구독 탐지견: 알림 신청 테이블 (Supabase SQL Editor에서 실행)
create table if not exists public.reminder_requests (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  channel      text not null check (channel in ('kakao', 'email', 'sms')),
  contact      text not null,
  service_id   text not null,
  service_name text not null,
  kind         text not null check (kind in ('trial', 'billing')),
  due_date     date not null,
  alert_date   date not null,
  price        integer,
  notified_at  timestamptz
);

create index if not exists reminder_requests_alert_idx
  on public.reminder_requests (alert_date) where notified_at is null;

-- 서버(service role)만 접근. 클라이언트 직접 접근 차단.
alter table public.reminder_requests enable row level security;
