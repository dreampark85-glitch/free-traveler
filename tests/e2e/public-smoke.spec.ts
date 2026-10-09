import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { blockExternalRequests } from "./helpers";

/**
 * E2E-PUBLIC-SMOKE — Secret 없이 실행하는 공개 화면 핵심 흐름 (chromium 전용).
 * ① UC-01 여행지 탐색(필터 → 카드 → Drawer)
 * ② UC-07·UC-08 안전정보 Drawer와 대표 소개(/about) 방문·상호작용
 * + axe-core 접근성 검사(serious/critical 0건)
 * 외부 사이트 내용과 이미지 응답 상태는 검사하지 않는다.
 */
test.beforeEach(async ({ page }) => {
  await blockExternalRequests(page);
});

test("① 메인: 테마 필터 → 여행지 카드 → 상세 Drawer", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: /어디로 떠날지/ }),
  ).toBeVisible();

  // 국내·해외 카드가 각각 6장 이상 보인다.
  for (const section of [
    "국내에서 다시 발견하는 여행지",
    "해외에서 처음 만나는 도시들",
  ]) {
    const region = page.getByRole("region", { name: section });
    await expect(region.getByRole("button")).toHaveCount(6);
  }

  // 테마 Chip → URL과 탐색 목록이 좁혀진다.
  await page.getByRole("button", { name: "미식", exact: true }).click();
  await expect(page).toHaveURL(/theme=/);
  const explorer = page.getByRole("region", {
    name: "어떤 이유로 떠나고 싶으신가요?",
  });
  await expect(
    explorer.getByText(/조건에 맞는 여행지가 총 \d+곳/),
  ).toBeVisible();

  // 카드 → 상세 Drawer(명소·일정·출처), Esc로 닫힘
  await page
    .getByRole("region", { name: "국내에서 다시 발견하는 여행지" })
    .getByRole("button")
    .first()
    .click();
  const drawer = page.getByRole("dialog");
  await expect(drawer).toBeVisible();
  await expect(
    drawer.getByRole("heading", { name: "대표 명소" }),
  ).toBeVisible();
  await expect(drawer.getByRole("heading", { name: "1일 일정" })).toBeVisible();
  await expect(drawer.getByText(/출처:/)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(drawer).toHaveCount(0);
});

test("② 안전정보 Drawer: 8개 카테고리, 재확인 경고, 외부 링크 속성", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("region", { name: "떠나기 전 꼭 확인할 안전정보" })
    .getByRole("button")
    .first()
    .click();

  const drawer = page.getByRole("dialog", { name: /안전정보/ });
  await expect(drawer).toBeVisible();
  for (const category of [
    "치안",
    "사기",
    "법규",
    "교통",
    "재난",
    "보건",
    "문화",
    "긴급연락처",
  ]) {
    await expect(drawer.getByRole("heading", { name: category })).toBeVisible();
  }
  // 공식 출처 대조 전이면 색상만이 아니라 텍스트로 재확인 경고를 보여준다.
  await expect(drawer.getByText(/재확인 필요/).first()).toBeVisible();

  const mofa = drawer.getByRole("link", { name: /외교부 해외안전여행/ });
  await expect(mofa).toHaveAttribute("target", "_blank");
  await expect(mofa).toHaveAttribute("rel", /noopener/);
  await expect(mofa).toHaveAttribute("rel", /noreferrer/);
  expect(await mofa.getAttribute("href")).toMatch(/^https:\/\//);
});

test("② 대표 소개(/about): 지표, 권역 토글, 추천 여행지, CTA", async ({
  page,
}) => {
  await page.goto("/about");
  await expect(
    page.getByRole("heading", { level: 1, name: /free_traveler를 소개합니다/ }),
  ).toBeVisible();
  await expect(page.getByText("50+ Trips")).toBeVisible();
  await expect(page.getByText("30+ Countries")).toBeVisible();

  // 권역 버튼을 누르면 설명이 펼쳐진다.
  const asia = page.getByRole("button", { name: /^아시아 · \d+개국/ });
  await expect(asia).toHaveAttribute("aria-expanded", "false");
  await asia.click();
  await expect(asia).toHaveAttribute("aria-expanded", "true");

  const favorites = page.getByRole("region", {
    name: "다시 가고 싶은 여행지",
  });
  await expect(
    favorites.getByRole("button").filter({ hasNotText: "" }),
  ).not.toHaveCount(0);
  await expect(
    favorites.getByRole("link", { name: "여행 조건 정리하기" }),
  ).toHaveAttribute("href", "/travel-tools");
  await expect(
    favorites.getByRole("link", { name: "동행 찾아보기" }),
  ).toHaveAttribute("href", "/mates");
});

for (const path of ["/", "/about"]) {
  test(`axe: ${path} serious/critical 위반 0건`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(
      blocking.map((v) => `${v.id} (${v.impact}): ${v.nodes.length}곳`),
    ).toEqual([]);
  });
}
