import { randomUUID } from "node:crypto";
import nextEnv from "@next/env";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * TEST-RLS-BASIC — 실제 Supabase(테스트 프로젝트)에 대한 RLS 통합 테스트.
 *
 * - supabase/seed.sql이 만든 가짜 사용자 4명(작성자·요청자·제3자·관리자)으로 로그인해 역할별로 접근을 시도한다.
 *   시드 사용자에게는 비밀번호가 없으므로 service role로 실행마다 무작위 비밀번호를 설정한다(저장·출력하지 않는다).
 * - 환경변수(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)가
 *   없으면 이 파일 전체가 skip된다. 운영 DB에는 절대 돌리지 않는다.
 * - 값을 바꾸는 검사는 끝날 때마다 시드 값으로 되돌린다.
 */
// NODE_ENV=test에서는 Next가 .env.local을 건너뛰므로 잠시 development로 바꿔 읽는다.
const nodeEnv = process.env.NODE_ENV;
(process.env as Record<string, string | undefined>).NODE_ENV = "development";
nextEnv.loadEnvConfig(process.cwd(), true);
(process.env as Record<string, string | undefined>).NODE_ENV = nodeEnv;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const configured = Boolean(url && anonKey && serviceKey);

const ID = {
  owner: "00000000-0000-4000-8000-000000000001",
  applicant: "00000000-0000-4000-8000-000000000002",
  outsider: "00000000-0000-4000-8000-000000000003",
  admin: "00000000-0000-4000-8000-000000000004",
  postOpen: "00000000-0000-4000-8000-0000000000a1",
  postPast: "00000000-0000-4000-8000-0000000000a2",
  application: "00000000-0000-4000-8000-0000000000b1",
  report: "00000000-0000-4000-8000-0000000000c1",
} as const;
const SEED_EMAIL = {
  owner: "seed-owner@example.test",
  applicant: "seed-applicant@example.test",
  outsider: "seed-outsider@example.test",
  admin: "seed-admin@example.test",
} as const;
type Who = keyof typeof SEED_EMAIL;

const noSession = { auth: { persistSession: false, autoRefreshToken: false } };
const day = (offset: number) =>
  new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);

/** RLS가 막으면 오류가 나거나(INSERT, 컬럼 권한) 영향받은 행이 0건이다(UPDATE·DELETE). */
function denied(result: { error: unknown; data: unknown }): boolean {
  return (
    result.error !== null ||
    (Array.isArray(result.data) && result.data.length === 0)
  );
}

describe.skipIf(!configured)("RLS 기본 정책 (실제 Supabase)", () => {
  let admin: SupabaseClient;
  const users = {} as Record<Who, SupabaseClient>;
  const anon = (): SupabaseClient => createClient(url!, anonKey!, noSession);

  beforeAll(async () => {
    admin = createClient(url!, serviceKey!, noSession);

    // 시드가 적용돼 있는지 먼저 확인한다.
    const seeded = await admin
      .from("mate_post")
      .select("post_id")
      .eq("post_id", ID.postOpen);
    if (seeded.error || seeded.data?.length !== 1) {
      throw new Error(
        "supabase/seed.sql이 적용되지 않았습니다. 0001, 0002, seed를 순서대로 적용하세요.",
      );
    }
    // 시드 글의 일정이 지나 모집 종료로 보이지 않게, 실행마다 미래로 되돌린다.
    await admin
      .from("mate_post")
      .update({ start_date: day(30), end_date: day(34), status: "OPEN" })
      .eq("post_id", ID.postOpen);

    for (const who of Object.keys(SEED_EMAIL) as Who[]) {
      const password = `${randomUUID()}Aa1!`;
      const updated = await admin.auth.admin.updateUserById(ID[who], {
        password,
        email_confirm: true,
      });
      if (updated.error) {
        throw new Error(
          `시드 사용자(${who}) 준비 실패: ${updated.error.message}`,
        );
      }
      const client = createClient(url!, anonKey!, noSession);
      const signed = await client.auth.signInWithPassword({
        email: SEED_EMAIL[who],
        password,
      });
      if (signed.error) {
        throw new Error(
          `시드 사용자(${who}) 로그인 실패: ${signed.error.message}`,
        );
      }
      users[who] = client;
    }
  }, 60_000);

  afterAll(async () => {
    if (!admin) return;
    // 시드 상태로 복원
    await admin
      .from("mate_post")
      .delete()
      .in("title", ["남 명의", "내 글", "미성년"]);
    await admin
      .from("mate_post")
      .update({ status: "OPEN", title: "도쿄 4박 5일 같이 걸어요" })
      .eq("post_id", ID.postOpen);
    await admin
      .from("mate_application")
      .update({ status: "PENDING" })
      .eq("application_id", ID.application);
    await admin.from("report").delete().neq("report_id", ID.report);
    await admin
      .from("report")
      .update({ status: "OPEN", resolved_at: null })
      .eq("report_id", ID.report);
    await admin
      .from("user_profile")
      .update({
        nickname: "시드제3자",
        is_adult: true,
        adult_verified_at: new Date().toISOString(),
      })
      .eq("user_id", ID.outsider);
    await admin
      .from("outbound_link_setting")
      .update({ url: "https://www.google.com/travel/flights" })
      .eq("link_key", "FLIGHT");
  }, 60_000);

  describe("비회원(anon)", () => {
    it("모집 중이고 종료되지 않은 글만 보인다", async () => {
      const { data, error } = await anon().from("mate_post").select("post_id");
      expect(error).toBeNull();
      expect(data?.map((r) => r.post_id)).toEqual([ID.postOpen]);
    });
    it.each(["user_profile", "mate_application", "report", "user_block"])(
      "%s는 빈 결과다",
      async (table) => {
        const { data, error } = await anon().from(table).select("*");
        expect(error).toBeNull();
        expect(data).toEqual([]);
      },
    );
    it("외부 이동 주소는 읽을 수 있다", async () => {
      const { data } = await anon()
        .from("outbound_link_setting")
        .select("link_key");
      expect(data).toHaveLength(2);
    });
    it("글 쓰기는 거부된다", async () => {
      const result = await anon()
        .from("mate_post")
        .insert({
          owner_id: ID.owner,
          title: "비회원",
          country_code: "JP",
          start_date: day(1),
          end_date: day(2),
          capacity: 1,
          policy_version: "v",
          policy_agreed_at: new Date().toISOString(),
        });
      expect(result.error).not.toBeNull();
    });
  });

  describe("조회 범위", () => {
    it("작성자는 자기 글을 모두 본다(종료된 글 포함)", async () => {
      const { data } = await users.owner.from("mate_post").select("post_id");
      expect(data?.map((r) => r.post_id).sort()).toEqual(
        [ID.postOpen, ID.postPast].sort(),
      );
    });
    it("작성자와 요청자는 참가 요청을 보고, 제3자는 못 본다", async () => {
      expect(
        (await users.owner.from("mate_application").select("application_id"))
          .data,
      ).toHaveLength(1);
      expect(
        (
          await users.applicant
            .from("mate_application")
            .select("application_id")
        ).data,
      ).toHaveLength(1);
      expect(
        (await users.outsider.from("mate_application").select("application_id"))
          .data,
      ).toEqual([]);
    });
    it("차단 관계에서는 서로의 글과 프로필이 보이지 않는다", async () => {
      // 시드: 제3자가 작성자를 차단
      expect(
        (await users.outsider.from("mate_post").select("post_id")).data,
      ).toEqual([]);
      const profile = await users.owner
        .from("user_profile")
        .select("user_id")
        .eq("user_id", ID.outsider);
      expect(profile.data).toEqual([]);
    });
    it("차단 목록은 본인 것만 보인다", async () => {
      const { data } = await users.outsider
        .from("user_block")
        .select("blocker_id");
      expect(data?.every((r) => r.blocker_id === ID.outsider)).toBe(true);
      expect(
        (await users.applicant.from("user_block").select("*")).data,
      ).toEqual([]);
    });
    it("회원은 남의 신고를 못 보고 관리자는 본다", async () => {
      expect((await users.outsider.from("report").select("*")).data).toEqual(
        [],
      );
      expect(
        (await users.admin.from("report").select("report_id")).data?.length,
      ).toBeGreaterThanOrEqual(1);
    });
  });

  describe("참가 요청", () => {
    it("작성자만 대기 중 요청을 승인한다", async () => {
      const byApplicant = await users.applicant
        .from("mate_application")
        .update({ status: "ACCEPTED" })
        .eq("application_id", ID.application)
        .select();
      expect(denied(byApplicant)).toBe(true);
      const byOutsider = await users.outsider
        .from("mate_application")
        .update({ status: "ACCEPTED" })
        .eq("application_id", ID.application)
        .select();
      expect(denied(byOutsider)).toBe(true);
      const byOwner = await users.owner
        .from("mate_application")
        .update({ status: "ACCEPTED" })
        .eq("application_id", ID.application)
        .select();
      expect(byOwner.error).toBeNull();
      expect(byOwner.data).toHaveLength(1);
      await admin
        .from("mate_application")
        .update({ status: "PENDING" })
        .eq("application_id", ID.application);
    });
    it("같은 글에 진행 중 요청이 있으면 UNIQUE로 막힌다", async () => {
      const result = await users.applicant.from("mate_application").insert({
        post_id: ID.postOpen,
        applicant_id: ID.applicant,
        message: "중복 요청",
      });
      expect(result.error).not.toBeNull();
    });
    it("본인 글에는 참가 요청을 보낼 수 없다", async () => {
      const result = await users.owner.from("mate_application").insert({
        post_id: ID.postOpen,
        applicant_id: ID.owner,
        message: "내 글에 요청",
      });
      expect(result.error).not.toBeNull();
    });
  });

  describe("동행 글", () => {
    it("작성자는 마감할 수 있지만 스스로 HIDDEN으로 바꿀 수 없다", async () => {
      const hidden = await users.owner
        .from("mate_post")
        .update({ status: "HIDDEN" })
        .eq("post_id", ID.postOpen)
        .select();
      expect(denied(hidden)).toBe(true);
      const closed = await users.owner
        .from("mate_post")
        .update({ status: "CLOSED" })
        .eq("post_id", ID.postOpen)
        .select();
      expect(closed.data).toHaveLength(1);
      await admin
        .from("mate_post")
        .update({ status: "OPEN" })
        .eq("post_id", ID.postOpen);
    });
    it("제3자는 남의 글을 고칠 수 없다", async () => {
      const result = await users.applicant
        .from("mate_post")
        .update({ title: "해킹" })
        .eq("post_id", ID.postOpen)
        .select();
      expect(denied(result)).toBe(true);
    });
    it("다른 사람 명의로는 글을 쓸 수 없다", async () => {
      const result = await users.applicant.from("mate_post").insert({
        owner_id: ID.owner,
        title: "남 명의",
        country_code: "JP",
        start_date: day(1),
        end_date: day(2),
        capacity: 1,
        policy_version: "v",
        policy_agreed_at: new Date().toISOString(),
      });
      expect(result.error).not.toBeNull();
    });
    it("성인 회원은 자기 명의로 쓸 수 있다(정책 버전 34자 포함)", async () => {
      const result = await users.applicant.from("mate_post").insert({
        owner_id: ID.applicant,
        title: "내 글",
        country_code: "JP",
        start_date: day(10),
        end_date: day(12),
        capacity: 2,
        policy_version: "safety-guidelines-2026-10-09-draft",
        policy_agreed_at: new Date().toISOString(),
      });
      expect(result.error).toBeNull();
    });
    it("성인 확인이 안 된 회원은 글을 쓸 수 없다", async () => {
      await admin
        .from("user_profile")
        .update({ is_adult: false, adult_verified_at: null })
        .eq("user_id", ID.outsider);
      const result = await users.outsider.from("mate_post").insert({
        owner_id: ID.outsider,
        title: "미성년",
        country_code: "JP",
        start_date: day(1),
        end_date: day(2),
        capacity: 1,
        policy_version: "v",
        policy_agreed_at: new Date().toISOString(),
      });
      expect(result.error).not.toBeNull();
      await admin
        .from("user_profile")
        .update({ is_adult: true, adult_verified_at: new Date().toISOString() })
        .eq("user_id", ID.outsider);
    });
  });

  describe("프로필과 권한 상승", () => {
    it("회원은 스스로 ADMIN이 될 수 없다", async () => {
      const result = await users.outsider
        .from("user_profile")
        .update({ role: "ADMIN" })
        .eq("user_id", ID.outsider)
        .select();
      expect(denied(result)).toBe(true);
      const profile = await admin
        .from("user_profile")
        .select("role")
        .eq("user_id", ID.outsider)
        .single();
      expect(profile.data?.role).toBe("MEMBER");
    });
    it("자기 닉네임은 고칠 수 있고 남의 프로필은 못 고친다", async () => {
      const mine = await users.outsider
        .from("user_profile")
        .update({ nickname: "새닉네임" })
        .eq("user_id", ID.outsider)
        .select();
      expect(mine.data).toHaveLength(1);
      const theirs = await users.outsider
        .from("user_profile")
        .update({ nickname: "남의것" })
        .eq("user_id", ID.applicant)
        .select();
      expect(denied(theirs)).toBe(true);
    });
  });

  describe("신고·차단·관리자", () => {
    it("회원은 신고를 접수할 수 있고 상태는 바꿀 수 없다", async () => {
      const created = await users.applicant.from("report").insert({
        reporter_id: ID.applicant,
        target_type: "POST",
        target_id: ID.postOpen,
        reason_code: "SPAM",
      });
      expect(created.error).toBeNull();
      const changed = await users.outsider
        .from("report")
        .update({ status: "RESOLVED" })
        .eq("report_id", ID.report)
        .select();
      expect(denied(changed)).toBe(true);
    });
    it("관리자는 신고 상태를 바꿀 수 있다", async () => {
      const result = await users.admin
        .from("report")
        .update({ status: "RESOLVED", resolved_at: new Date().toISOString() })
        .eq("report_id", ID.report)
        .select();
      expect(result.data).toHaveLength(1);
    });
    it("자기 자신 차단과 남의 이름으로 차단은 거부된다", async () => {
      const self = await users.applicant
        .from("user_block")
        .insert({ blocker_id: ID.applicant, blocked_id: ID.applicant });
      expect(self.error).not.toBeNull();
      const other = await users.applicant
        .from("user_block")
        .insert({ blocker_id: ID.owner, blocked_id: ID.applicant });
      expect(other.error).not.toBeNull();
    });
    it("외부 이동 주소는 관리자만 바꾸고 HTTPS만 저장된다", async () => {
      const byMember = await users.outsider
        .from("outbound_link_setting")
        .update({ url: "https://evil.example" })
        .eq("link_key", "FLIGHT")
        .select();
      expect(denied(byMember)).toBe(true);
      const ok = await users.admin
        .from("outbound_link_setting")
        .update({
          url: "https://www.example.com/flights",
          updated_by: ID.admin,
        })
        .eq("link_key", "FLIGHT")
        .select();
      expect(ok.data).toHaveLength(1);
      for (const bad of [
        "http://insecure.example",
        "javascript:alert(1)",
        "data:text/html,x",
      ]) {
        const result = await users.admin
          .from("outbound_link_setting")
          .update({ url: bad })
          .eq("link_key", "FLIGHT")
          .select();
        expect(result.error, bad).not.toBeNull();
      }
    });
  });
});
