import { expect, test, type Browser, type Page } from "@playwright/test";
import { auth, blockExternalRequests, login } from "./helpers";

/**
 * E2E-MATE-AUTH — 인증이 필요한 핵심 흐름 ⑤⑥ (chromium 전용).
 *
 * 비로그인 보호 검사는 Secret 없이 항상 실행한다. 로그인 흐름은 아래 환경변수가 있어야 실행하고,
 * 없으면 skip한다(통과로 세지 않는다). 계정은 모두 이메일 인증을 마치고 프로필(닉네임)과
 * 성인 확인을 끝낸 테스트 전용 계정이어야 하며, 관리자 계정은 user_profile.role이 ADMIN이어야 한다.
 *   E2E_AUTH_EMAIL / E2E_AUTH_PASSWORD         작성자
 *   E2E_AUTH_EMAIL_2 / E2E_AUTH_PASSWORD_2     참가 요청자
 *   E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD       관리자
 */
const admin = {
  email: process.env.E2E_ADMIN_EMAIL,
  password: process.env.E2E_ADMIN_PASSWORD,
};

test.describe("비로그인 보호", () => {
  test.beforeEach(async ({ page }) => {
    await blockExternalRequests(page);
  });

  test("동행 탭은 작성 폼 대신 로그인 유도만 보여준다", async ({ page }) => {
    await page.goto("/travel-tools?tab=mate");
    await expect(
      page.getByRole("heading", {
        name: /로그인하고 성인 확인을 완료하면 동행을 모집할 수 있어요/,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /로그인·가입하러 가기/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("form", { name: "동행 모집글 작성" }),
    ).toHaveCount(0);
  });

  test("계정 화면은 게스트 탭만 렌더링한다", async ({ page }) => {
    await page.goto("/account");
    await expect(page.getByRole("tab", { name: "로그인·가입" })).toBeVisible();
    for (const name of ["프로필", "내 활동", "관리자"]) {
      await expect(page.getByRole("tab", { name })).toHaveCount(0);
    }
    // 역할에 없는 영역은 DOM에도 없다.
    await expect(page.getByText("신고 처리 현황")).toHaveCount(0);
    await expect(page.getByText("외부 URL 설정")).toHaveCount(0);
  });

  test("비로그인 쓰기 API는 401로 막힌다", async ({ request }) => {
    const id = "00000000-0000-4000-8000-0000000000a1";
    for (const [method, path] of [
      ["POST", "/api/mates"],
      ["POST", `/api/mates/${id}/requests`],
      ["POST", `/api/mates/${id}/report`],
      ["POST", "/api/blocks"],
      ["PATCH", `/api/applications/${id}`],
      ["GET", "/api/admin/reports"],
    ] as const) {
      const response = await request.fetch(path, {
        method,
        data: {},
        failOnStatusCode: false,
      });
      expect(response.status(), `${method} ${path}`).toBe(401);
    }
  });
});

async function newPage(browser: Browser): Promise<Page> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await blockExternalRequests(page);
  return page;
}

test.describe("로그인 흐름", () => {
  test.skip(
    !auth.email ||
      !auth.password ||
      !auth.email2 ||
      !auth.password2 ||
      !admin.email ||
      !admin.password,
    "E2E 계정 환경변수(작성자·요청자·관리자)가 없어 로그인 흐름을 건너뜁니다.",
  );

  test("⑤ 동행 작성 → 목록·상세 → 참가 요청 → 작성자 승인", async ({
    browser,
  }) => {
    const title = `e2e-동행-${Date.now()}`;
    const start = new Date(Date.now() + 14 * 86_400_000)
      .toISOString()
      .slice(0, 10);
    const end = new Date(Date.now() + 18 * 86_400_000)
      .toISOString()
      .slice(0, 10);

    // 작성자: 글 작성
    const author = await newPage(browser);
    await login(author, auth.email!, auth.password!);
    await author.goto("/travel-tools?tab=mate");
    const form = author.getByRole("form", { name: "동행 모집글 작성" });
    await expect(form).toBeVisible();
    await form.getByLabel("제목").fill(title);
    await form.getByLabel("국가").selectOption({ label: "일본" });
    await form.getByLabel("지역").selectOption({ label: "도쿄" });
    await form.getByLabel("시작일").fill(start);
    await form.getByLabel("종료일").fill(end);
    await form.getByRole("button", { name: "맛집" }).click();
    await form.getByLabel("설명").fill("E2E Smoke용 동행 모집글입니다.");
    await form.getByRole("checkbox", { name: /동행 안전수칙/ }).check();
    await form.getByRole("button", { name: "동행글 올리기" }).click();
    await expect(author).toHaveURL(/\/mates/);

    // 요청자: 목록 → 상세 → 참가 요청
    const applicant = await newPage(browser);
    await login(applicant, auth.email2!, auth.password2!);
    await applicant.goto("/mates");
    await applicant.getByRole("button", { name: new RegExp(title) }).click();
    await expect(
      applicant.getByRole("heading", { level: 2, name: title }),
    ).toBeVisible();
    await applicant
      .getByLabel("참가 요청 메시지")
      .fill("E2E Smoke 참가 요청입니다.");
    await applicant.getByRole("button", { name: "참가 요청 보내기" }).click();
    await expect(
      applicant.getByText("참가 요청을 보냈어요").first(),
    ).toBeVisible();

    // 작성자: 내 활동에서 승인
    await author.goto("/account");
    await author.getByRole("tab", { name: "내 활동" }).click();
    const received = author.getByRole("region", { name: "받은 참가 요청" });
    await expect(
      received.getByText("E2E Smoke 참가 요청입니다."),
    ).toBeVisible();
    await received.getByRole("button", { name: "승인" }).first().click();
    await expect(author.getByText("참가 요청을 승인했어요")).toBeVisible();
  });

  test("⑥ 신고·차단 → 관리자 신고 상태 변경", async ({ browser }) => {
    const applicant = await newPage(browser);
    await login(applicant, auth.email2!, auth.password2!);
    await applicant.goto("/mates");
    await applicant
      .getByRole("button", { name: /e2e-동행-/ })
      .first()
      .click();

    await applicant.getByRole("button", { name: "이 글 신고하기" }).click();
    await applicant.getByLabel("신고 사유").selectOption("OTHER");
    await applicant.getByRole("button", { name: "신고 접수" }).click();
    await expect(
      applicant.getByText("신고가 접수됐어요").first(),
    ).toBeVisible();

    await applicant.getByRole("button", { name: "이 사용자 차단하기" }).click();
    await applicant.getByRole("button", { name: "차단하기" }).click();
    await expect(applicant.getByText("이 사용자를 차단했어요")).toBeVisible();

    const adminPage = await newPage(browser);
    await login(adminPage, admin.email!, admin.password!);
    await adminPage.goto("/account");
    await adminPage.getByRole("tab", { name: "관리자" }).click();
    await adminPage.getByRole("button", { name: "처리 완료" }).first().click();
    await expect(adminPage.getByText("신고 상태를 바꿨어요")).toBeVisible();
  });
});
