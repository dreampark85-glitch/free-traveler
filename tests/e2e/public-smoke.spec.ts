import { expect, test } from "@playwright/test";
import { blockExternalRequests } from "./helpers";

test.beforeEach(async ({ page }) => {
  await blockExternalRequests(page);
});

test("E2E-001 메인 페이지의 추천 여행지와 주요 CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByTestId("destination-card").first()).toBeVisible();
  expect(
    await page.getByTestId("destination-card").count(),
  ).toBeGreaterThanOrEqual(6);
  const cta = page.getByTestId("main-cta").first();
  await expect(cta).toBeVisible();
  await expect(
    page.getByRole("link", { name: /여행 도구|동행/ }).first(),
  ).toBeVisible();
});

test("E2E-002 대표 소개의 free_traveler, 50회 이상, 30개국 이상", async ({
  page,
}) => {
  await page.goto("/about");
  await expect(page.getByText("free_traveler").first()).toBeVisible();
  await expect(page.getByText(/50\s*회\s*이상|50\+/).first()).toBeVisible();
  await expect(page.getByText(/30\s*개국\s*이상|30\+/).first()).toBeVisible();
});

test("E2E-003 여행 도구의 항공 외부 이동 안내와 href", async ({ page }) => {
  await page.goto("/travel-tools");
  await page.getByRole("tab", { name: /항공/ }).click();
  await page.getByLabel(/출발일/).fill("2027-03-10");
  await page.getByLabel(/귀국일/).fill("2027-03-15");
  const link = page.getByTestId("flight-outbound-link");
  await expect(page.getByTestId("outbound-notice")).toBeVisible();
  // 외부 사이트 내용은 검사하지 않고 안내 문구와 href만 확인한다. 입력값은 URL로 전달되지 않는다.
  const href = await link.getAttribute("href");
  expect(href).toMatch(/^https:\/\//);
  expect(href).not.toContain("?");
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", /noopener/);
});

test("E2E-004 여행 도구의 숙소 외부 이동 안내와 href", async ({ page }) => {
  await page.goto("/travel-tools");
  await page.getByRole("tab", { name: /숙소/ }).click();
  const link = page.getByTestId("hotel-outbound-link");
  await expect(page.getByTestId("outbound-notice")).toBeVisible();
  const href = await link.getAttribute("href");
  expect(href).toMatch(/^https:\/\//);
  expect(href).not.toContain("?");
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", /noopener/);
});

test("E2E-005 비로그인 동행글 작성의 로그인 안내", async ({ page }) => {
  await page.goto("/travel-tools");
  await page.getByRole("tab", { name: /동행/ }).click();
  await expect(page.getByTestId("mate-login-prompt")).toBeVisible();
  await expect(page.getByTestId("mate-composer-form")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: /로그인/ }).first(),
  ).toHaveAttribute("href", /\/account/);
});
