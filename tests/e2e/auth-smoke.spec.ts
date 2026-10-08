import { expect, test } from "@playwright/test";
import { auth, blockExternalRequests, login } from "./helpers";

// 인증 환경변수(E2E_AUTH_EMAIL / E2E_AUTH_PASSWORD)가 없으면 이 파일만 명시적으로 skip한다.
test.describe("auth smoke", () => {
  test.skip(
    !auth.email || !auth.password,
    "E2E_AUTH_EMAIL / E2E_AUTH_PASSWORD 환경변수가 없어 로그인 Smoke를 건너뜁니다.",
  );

  test.beforeEach(async ({ page }) => {
    await blockExternalRequests(page);
  });

  test("E2E-006 로그인 사용자의 동행글 작성과 목록·상세 확인", async ({
    page,
  }) => {
    const title = `e2e-동행-${Date.now()}`;
    await login(page, auth.email!, auth.password!);

    await page.goto("/travel-tools");
    await page.getByRole("tab", { name: /동행/ }).click();
    const form = page.getByTestId("mate-composer-form");
    await expect(form).toBeVisible();
    await form.getByLabel("제목").fill(title);
    await form.getByLabel("설명").fill("E2E Smoke용 동행 모집글입니다.");
    await form.getByRole("checkbox", { name: /안전수칙/ }).check();
    await form.getByRole("button", { name: /등록|작성/ }).click();

    await page.goto("/mates");
    const card = page.getByTestId("mate-post-card").filter({ hasText: title });
    await expect(card).toBeVisible();
    await card.click();
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  });

  test("E2E-007 동행글 신청과 계정 화면의 내 활동 확인", async ({ page }) => {
    test.skip(
      !auth.email2 || !auth.password2,
      "신청은 작성자가 아닌 두 번째 계정(E2E_AUTH_EMAIL_2 / E2E_AUTH_PASSWORD_2)이 필요합니다.",
    );
    await login(page, auth.email2!, auth.password2!);

    await page.goto("/mates");
    await page.getByTestId("mate-post-card").first().click();
    await page.getByLabel(/메시지/).fill("E2E Smoke 참가 요청입니다.");
    await page.getByRole("button", { name: /신청|요청/ }).click();
    await expect(page.getByText(/접수|요청했습니다/)).toBeVisible();

    await page.goto("/account");
    await page.getByRole("tab", { name: /내 활동/ }).click();
    await expect(page.getByTestId("my-activity-sent-requests")).toBeVisible();
  });
});
