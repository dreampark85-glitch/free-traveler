-- 0002_rls_policies.sql — 6개 테이블 RLS 정책 (DB-RLS-BASE)
--
-- 원칙
--  * 6개 테이블 모두 RLS를 켠다. 정책이 없는 작업은 거부된다(기본 deny).
--  * 비공개 데이터는 본인, 요청 대상 글의 작성자, 관리자(role = 'ADMIN')만 읽을 수 있다.
--  * 클라이언트는 항상 RLS가 적용되는 경로로만 접근한다. service role 키는 서버 전용이다.
--  * role/status 같은 권한 컬럼은 클라이언트가 바꿀 수 없도록 컬럼 단위 UPDATE 권한을 제한한다.
--  * 관리자 승격(role 변경)은 service role로만 수행한다.

-- 0. 헬퍼 함수 ---------------------------------------------------------------------------
-- RLS를 우회해야 하는 조회(관리자 여부, 차단 관계)는 security definer 함수로 분리해
-- 정책 안에서 user_profile/user_block 정책이 재귀하지 않도록 한다.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_profile
    where user_id = auth.uid() and role = 'ADMIN' and status = 'ACTIVE'
  );
$$;

create or replace function public.is_active_adult()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_profile
    where user_id = auth.uid() and is_adult and status = 'ACTIVE'
  );
$$;

create or replace function public.is_blocked_between(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_block
    where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a)
  );
$$;

create or replace function public.is_post_owner(p uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.mate_post where post_id = p and owner_id = auth.uid()
  );
$$;

-- 1. RLS 활성화 --------------------------------------------------------------------------
alter table public.user_profile         enable row level security;
alter table public.mate_post            enable row level security;
alter table public.mate_application     enable row level security;
alter table public.user_block           enable row level security;
alter table public.report               enable row level security;
alter table public.outbound_link_setting enable row level security;

-- 2. 컬럼 단위 권한 ----------------------------------------------------------------------
-- 클라이언트(authenticated)가 바꿀 수 있는 컬럼만 열어 둔다.
revoke update on public.user_profile from authenticated;
grant update (nickname, is_adult, adult_verified_at, age_band, gender, travel_styles, bio)
  on public.user_profile to authenticated;

revoke update on public.mate_post from authenticated;
grant update (title, country_code, region, start_date, end_date, capacity, preferences,
              travel_styles, description, status)
  on public.mate_post to authenticated;

revoke update on public.mate_application from authenticated;
grant update (status) on public.mate_application to authenticated;

revoke update on public.report from authenticated;
grant update (status, resolved_at) on public.report to authenticated;

revoke update on public.outbound_link_setting from authenticated;
grant update (url, updated_by, updated_at) on public.outbound_link_setting to authenticated;

-- 비로그인(anon)은 읽기 전용 테이블만 SELECT 할 수 있다. 쓰기 권한은 모두 회수한다.
revoke insert, update, delete on all tables in schema public from anon;

-- 3. user_profile ------------------------------------------------------------------------
-- 프로필은 로그인한 사용자만 읽는다. 차단 관계에 있는 상대의 프로필은 보이지 않는다.
create policy user_profile_select on public.user_profile
  for select to authenticated
  using (
    user_id = auth.uid()
    or public.is_admin()
    or not public.is_blocked_between(auth.uid(), user_id)
  );

create policy user_profile_insert_self on public.user_profile
  for insert to authenticated
  with check (user_id = auth.uid() and role = 'MEMBER' and status = 'ACTIVE');

create policy user_profile_update_self on public.user_profile
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 4. mate_post ---------------------------------------------------------------------------
-- 공개 목록: 모집중이고 종료일이 지나지 않았으며 차단 관계가 아닌 글. 비로그인도 읽을 수 있다.
create policy mate_post_select_public on public.mate_post
  for select to anon, authenticated
  using (
    status = 'OPEN'
    and end_date >= current_date
    and not public.is_blocked_between(auth.uid(), owner_id)
  );

create policy mate_post_select_owner_admin on public.mate_post
  for select to authenticated
  using (owner_id = auth.uid() or public.is_admin());

create policy mate_post_insert on public.mate_post
  for insert to authenticated
  with check (
    owner_id = auth.uid()
    and status = 'OPEN'
    and public.is_active_adult()
  );

-- 작성자는 자신의 글을 수정·마감·삭제 처리(status)할 수 있지만 HIDDEN은 스스로 풀 수 없다.
create policy mate_post_update_owner on public.mate_post
  for update to authenticated
  using (owner_id = auth.uid() and status <> 'HIDDEN')
  with check (owner_id = auth.uid() and status in ('OPEN', 'CLOSED', 'DELETED'));

create policy mate_post_update_admin on public.mate_post
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 5. mate_application --------------------------------------------------------------------
create policy mate_application_select on public.mate_application
  for select to authenticated
  using (
    applicant_id = auth.uid()
    or public.is_post_owner(post_id)
    or public.is_admin()
  );

create policy mate_application_insert on public.mate_application
  for insert to authenticated
  with check (
    applicant_id = auth.uid()
    and status = 'PENDING'
    and public.is_active_adult()
    and not public.is_post_owner(post_id)
    and exists (
      select 1 from public.mate_post p
      where p.post_id = mate_application.post_id
        and p.status = 'OPEN'
        and p.end_date >= current_date
        and not public.is_blocked_between(auth.uid(), p.owner_id)
    )
  );

-- 요청자는 자신의 요청을 철회(WITHDRAWN)만 할 수 있다.
create policy mate_application_update_applicant on public.mate_application
  for update to authenticated
  using (applicant_id = auth.uid() and status in ('PENDING', 'ACCEPTED'))
  with check (applicant_id = auth.uid() and status = 'WITHDRAWN');

-- 글 작성자만 대기 중인 요청을 승인/거절할 수 있다.
create policy mate_application_update_owner on public.mate_application
  for update to authenticated
  using (public.is_post_owner(post_id) and status = 'PENDING')
  with check (public.is_post_owner(post_id) and status in ('ACCEPTED', 'REJECTED'));

-- 6. user_block --------------------------------------------------------------------------
create policy user_block_select_own on public.user_block
  for select to authenticated
  using (blocker_id = auth.uid());

create policy user_block_insert_own on public.user_block
  for insert to authenticated
  with check (blocker_id = auth.uid() and blocker_id <> blocked_id);

create policy user_block_delete_own on public.user_block
  for delete to authenticated
  using (blocker_id = auth.uid());

-- 7. report ------------------------------------------------------------------------------
create policy report_insert on public.report
  for insert to authenticated
  with check (reporter_id = auth.uid() and status = 'OPEN');

create policy report_select on public.report
  for select to authenticated
  using (reporter_id = auth.uid() or public.is_admin());

create policy report_update_admin on public.report
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 8. outbound_link_setting ---------------------------------------------------------------
-- 외부 이동 CTA가 주소를 읽어야 하므로 누구나 SELECT, 변경은 관리자만.
create policy outbound_link_select on public.outbound_link_setting
  for select to anon, authenticated
  using (true);

create policy outbound_link_insert_admin on public.outbound_link_setting
  for insert to authenticated
  with check (public.is_admin());

create policy outbound_link_update_admin on public.outbound_link_setting
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());
