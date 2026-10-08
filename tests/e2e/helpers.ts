import type { Page } from "@playwright/test";

/**
 * Selector 규칙: role → label → data-testid 순서로 사용하고 텍스트 위치·CSS 구조에 기대지 않는다.
 * 이 Smoke가 기대하는 data-testid (구현 Task가 부여해야 한다):
 *   destination-card, main-cta, outbound-notice, flight-outbound-link, hotel-outbound-link,
 *   mate-login-prompt, mate-composer-form, mate-post-card, my-activity-sent-requests
 */

/** 외부 사이트는 열거나 검사하지 않는다 — 앱 오리진 밖 요청은 모두 차단한다(이미지 응답 상태도 검사하지 않음). */
export async function blockExternalRequests(page: Page): Promise<void> {
  const base = new URL(
    process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
  );
  await page.route(
    (url) => url.origin !== base.origin && url.protocol.startsWith("http"),
    (route) => route.abort(),
  );
}

export const auth = {
  email: process.env.E2E_AUTH_EMAIL,
  password: process.env.E2E_AUTH_PASSWORD,
  // 신청(E2E-007)은 작성자가 아닌 두 번째 계정이 필요하다.
  email2: process.env.E2E_AUTH_EMAIL_2,
  password2: process.env.E2E_AUTH_PASSWORD_2,
};

export async function login(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto("/account");
  await page.getByLabel("이메일").fill(email);
  await page.getByLabel("비밀번호").fill(password);
  await page.getByRole("button", { name: "로그인" }).click();
  await page.getByRole("tab", { name: /내 활동/ }).waitFor();
}
