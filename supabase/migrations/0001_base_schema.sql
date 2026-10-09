-- 0001_base_schema.sql — Free Traveler 기본 스키마 (DB-SCHEMA-BASE)
--
-- 테이블은 정확히 6개: user_profile, mate_post, mate_application, user_block, report,
-- outbound_link_setting. 여행지·안전정보·대표 소개·미디어·감사 로그 테이블은 만들지 않는다
-- (콘텐츠는 src/data 정적 파일). RLS 정책은 0002_rls_policies.sql(DB-RLS-BASE)에서 다룬다.
-- 항공·숙소 입력 조건(날짜·인원·예산 등)을 저장하는 컬럼은 어디에도 두지 않는다.

-- 1. 사용자 프로필 -----------------------------------------------------------------------
create table public.user_profile (
  user_id           uuid primary key references auth.users (id) on delete cascade,
  nickname          varchar(30) not null unique,
  -- 정확한 생년월일은 저장하지 않고 성인 여부와 확인 시각만 둔다.
  is_adult          boolean not null default false,
  adult_verified_at timestamptz,
  age_band          text check (age_band in ('20S', '30S', '40S', '50S', '60_PLUS')),
  gender            text check (gender in ('FEMALE', 'MALE', 'OTHER', 'UNDISCLOSED')),
  travel_styles     text[] not null default '{}',
  bio               varchar(500),
  role              text not null default 'MEMBER' check (role in ('MEMBER', 'ADMIN')),
  status            text not null default 'ACTIVE' check (status in ('ACTIVE', 'RESTRICTED', 'DELETED')),
  created_at        timestamptz not null default now(),
  constraint user_profile_adult_time check (is_adult or adult_verified_at is null)
);

-- 2. 동행 모집글 -----------------------------------------------------------------------
create table public.mate_post (
  post_id           uuid primary key default gen_random_uuid(),
  owner_id          uuid not null references public.user_profile (user_id) on delete cascade,
  title             varchar(100) not null,
  country_code      char(2) not null,
  region            varchar(60),
  start_date        date not null,
  end_date          date not null,
  capacity          smallint not null check (capacity between 1 and 10),
  preferences       jsonb not null default '{}'::jsonb,
  travel_styles     text[] not null default '{}',
  description       text check (char_length(description) <= 3000),
  status            text not null default 'OPEN' check (status in ('OPEN', 'CLOSED', 'HIDDEN', 'DELETED')),
  -- 안전수칙 동의: 작성 시 정책 버전과 동의 시각을 함께 저장한다.
  policy_version    varchar(60) not null,
  policy_agreed_at  timestamptz not null,
  created_at        timestamptz not null default now(),
  constraint mate_post_period check (end_date >= start_date)
);
create index mate_post_status_period_idx on public.mate_post (status, end_date);
create index mate_post_owner_idx on public.mate_post (owner_id);

-- 3. 참가 요청 -------------------------------------------------------------------------
create table public.mate_application (
  application_id    uuid primary key default gen_random_uuid(),
  post_id           uuid not null references public.mate_post (post_id) on delete cascade,
  applicant_id      uuid not null references public.user_profile (user_id) on delete cascade,
  message           varchar(500) not null,
  status            text not null default 'PENDING' check (status in ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')),
  created_at        timestamptz not null default now()
);
-- 같은 글에 같은 사용자의 진행 중(PENDING/ACCEPTED) 요청은 하나만 허용한다.
create unique index mate_application_active_uniq
  on public.mate_application (post_id, applicant_id)
  where status in ('PENDING', 'ACCEPTED');
create index mate_application_applicant_idx on public.mate_application (applicant_id);

-- 4. 차단 ------------------------------------------------------------------------------
create table public.user_block (
  blocker_id        uuid not null references public.user_profile (user_id) on delete cascade,
  blocked_id        uuid not null references public.user_profile (user_id) on delete cascade,
  created_at        timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint user_block_not_self check (blocker_id <> blocked_id)
);

-- 5. 신고 ------------------------------------------------------------------------------
create table public.report (
  report_id         uuid primary key default gen_random_uuid(),
  reporter_id       uuid not null references public.user_profile (user_id) on delete cascade,
  target_type       text not null check (target_type in ('POST', 'USER')),
  target_id         uuid not null,
  reason_code       text not null check (reason_code in ('SPAM', 'CONTACT_EXPOSURE', 'HARASSMENT', 'FRAUD', 'OTHER')),
  description       varchar(1000),
  status            text not null default 'OPEN' check (status in ('OPEN', 'RESOLVED', 'DISMISSED')),
  created_at        timestamptz not null default now(),
  resolved_at       timestamptz
);
create index report_status_idx on public.report (status, created_at);

-- 6. 외부 이동 URL 설정(관리자) --------------------------------------------------------
create table public.outbound_link_setting (
  link_key          text primary key check (link_key in ('FLIGHT', 'HOTEL')),
  -- HTTPS만 허용한다. http:, javascript:, data: 등은 저장할 수 없다.
  url               text not null check (url ~* '^https://[^[:space:]]+$'),
  updated_by        uuid references public.user_profile (user_id) on delete set null,
  updated_at        timestamptz not null default now()
);
