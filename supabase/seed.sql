-- seed.sql — TEST-RLS-BASIC, E2E-MATE-AUTH용 최소 샘플 데이터 (DB-SEED-BASE)
--
-- 로컬/테스트 DB에만 적용한다. 운영 DB에는 적용하지 않는다.
-- 모든 값은 가짜다(example.test 도메인). 이 파일에는 비밀번호나 키를 넣지 않는다:
-- 시드 사용자는 로그인 가능한 비밀번호가 없으므로 RLS 테스트는 JWT claim(sub)을 지정해
-- 역할을 흉내 내고, 로그인이 필요한 E2E는 환경변수의 테스트 계정을 따로 만든다.
-- 여러 번 실행해도 같은 결과가 되도록 모든 INSERT에 on conflict do nothing을 쓴다.

-- 1. 인증 사용자(가짜) -------------------------------------------------------------------
insert into auth.users (
  id, instance_id, aud, role, email, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  -- GoTrue가 사용자를 읽을 때 NULL이면 "Database error loading user"가 나므로 빈 문자열로 둔다.
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'seed-owner@example.test', now(), '{}', '{}', now(), now(),
   '', '', '', '', '', '', '', ''),
  ('00000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'seed-applicant@example.test', now(), '{}', '{}', now(), now(),
   '', '', '', '', '', '', '', ''),
  ('00000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'seed-outsider@example.test', now(), '{}', '{}', now(), now(),
   '', '', '', '', '', '', '', ''),
  ('00000000-0000-4000-8000-000000000004', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'seed-admin@example.test', now(), '{}', '{}', now(), now(),
   '', '', '', '', '', '', '', '')
on conflict (id) do nothing;

-- 2. 프로필: 작성자, 요청자, 제3자, 관리자 ------------------------------------------------
insert into public.user_profile
  (user_id, nickname, is_adult, adult_verified_at, age_band, gender, travel_styles, bio, role)
values
  ('00000000-0000-4000-8000-000000000001', '시드작성자', true, now(), '30S', 'UNDISCLOSED',
   array['자유여행', '맛집'], '테스트용 가짜 프로필입니다.', 'MEMBER'),
  ('00000000-0000-4000-8000-000000000002', '시드요청자', true, now(), '20S', 'UNDISCLOSED',
   array['사진', '도보'], '테스트용 가짜 프로필입니다.', 'MEMBER'),
  ('00000000-0000-4000-8000-000000000003', '시드제3자', true, now(), '40S', 'UNDISCLOSED',
   array['휴양'], '테스트용 가짜 프로필입니다.', 'MEMBER'),
  ('00000000-0000-4000-8000-000000000004', '시드관리자', true, now(), '30S', 'UNDISCLOSED',
   array['자유여행'], '테스트용 가짜 프로필입니다.', 'ADMIN')
on conflict (user_id) do nothing;

-- 3. 모집글: 모집중 1건(미래), 종료일이 지난 1건 ------------------------------------------
insert into public.mate_post
  (post_id, owner_id, title, country_code, region, start_date, end_date, capacity,
   travel_styles, description, status, policy_version, policy_agreed_at)
values
  ('00000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-000000000001',
   '도쿄 4박 5일 같이 걸어요', 'JP', '도쿄',
   current_date + 30, current_date + 34, 3, array['도보', '맛집'],
   '테스트용 모집글입니다. 연락처는 적지 않았습니다.', 'OPEN',
   'safety-guidelines-seed', now()),
  ('00000000-0000-4000-8000-0000000000a2', '00000000-0000-4000-8000-000000000001',
   '지난 여행 동행 모집', 'TH', '방콕',
   current_date - 20, current_date - 15, 2, array['사진'],
   '종료일이 지난 테스트용 모집글입니다.', 'OPEN',
   'safety-guidelines-seed', now())
on conflict (post_id) do nothing;

-- 4. 참가 요청: 요청자 → 모집중 글(대기) ---------------------------------------------------
insert into public.mate_application (application_id, post_id, applicant_id, message, status)
values
  ('00000000-0000-4000-8000-0000000000b1', '00000000-0000-4000-8000-0000000000a1',
   '00000000-0000-4000-8000-000000000002', '테스트용 참가 요청 메시지입니다.', 'PENDING')
on conflict (application_id) do nothing;

-- 5. 차단과 신고 -------------------------------------------------------------------------
insert into public.user_block (blocker_id, blocked_id)
values ('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001')
on conflict (blocker_id, blocked_id) do nothing;

insert into public.report
  (report_id, reporter_id, target_type, target_id, reason_code, description, status)
values
  ('00000000-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-000000000002',
   'POST', '00000000-0000-4000-8000-0000000000a1', 'OTHER',
   '테스트용 신고입니다.', 'OPEN')
on conflict (report_id) do nothing;

-- 6. 외부 이동 URL(HTTPS 허용목록) -------------------------------------------------------
insert into public.outbound_link_setting (link_key, url, updated_by)
values
  ('FLIGHT', 'https://www.google.com/travel/flights', '00000000-0000-4000-8000-000000000004'),
  ('HOTEL', 'https://www.google.com/travel/hotels', '00000000-0000-4000-8000-000000000004')
on conflict (link_key) do nothing;
