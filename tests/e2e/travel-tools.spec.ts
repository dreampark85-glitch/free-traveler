import { expect, test, type Page } from "@playwright/test";
import { auth, blockExternalRequests, login } from "./helpers";

/**
 * E2E-TRAVEL-TOOLS — 여행 준비 화면 핵심 흐름 (chromium 전용).
 * ③ UC-02(항공)·UC-03(숙소): 입력 → 요약 → 외부 이동 버튼
 * ④ UC-04: 로그인 후 동행 작성(여행 정보 입력 포함) — 계정 환경변수가 있을 때만 실행
 *
 * 외부 이동 주소(FLIGHT_OUTBOUND_URL / HOTEL_OUTBOUND_URL)가 서버에 설정돼 있으면 새 탭 호출을
 * 가로채 주소에 쿼리가 없는지 확인하고, 설정돼 있지 않으면 이동이 막히고 입력이 유지되는지 확인한다.
 * 외부 사이트는 열지 않는다.
 */
function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

async function captureWindowOpen(page: Page) {
  await page.addInitScript(() => {
    const calls: { url: string; target: string; features: string }[] = [];
    (window as unknown as { __opened: typeof calls }).__opened = calls;
    window.open = (url, target, features) => {
      calls.push({
        url: String(url),
        target: String(target ?? ""),
        features: String(features ?? ""),
      });
      return null;
    };
  });
}

async function opened(page: Page) {
  return page.evaluate(
    () =>
      (
        window as unknown as {
          __opened: { url: string; target: string; features: string }[];
        }
      ).__opened,
  );
}

test.beforeEach(async ({ page }) => {
  await blockExternalRequests(page);
});

for (const kind of [
  {
    name: "③ 항공",
    tab: "비행기 찾기",
    form: "항공 여행 조건",
    start: "출발일",
    end: "귀국일",
    go: /항공권 검색 사이트로 이동/,
  },
  {
    name: "③ 숙소",
    tab: "숙소 찾기",
    form: "숙소 여행 조건",
    start: "체크인",
    end: "체크아웃",
    go: /숙소 검색 사이트로 이동/,
  },
]) {
  test(`${kind.name}: 입력 → 요약 → 외부 이동, 입력값은 전송되지 않는다`, async ({
    page,
  }) => {
    await captureWindowOpen(page);
    const sent: string[] = [];
    page.on("request", (request) => {
      if (["fetch", "xhr"].includes(request.resourceType())) {
        sent.push(
          `${request.method()} ${request.url()} ${request.postData() ?? ""}`,
        );
      }
    });

    await page.goto("/travel-tools");
    await page.getByRole("tab", { name: kind.tab }).click();
    const form = page.getByRole("form", { name: kind.form });
    const panel = page.getByRole("tabpanel", { name: kind.tab });

    // 국가를 바꾸면 지역이 초기화된다.
    await form.getByLabel("국가").selectOption({ label: "일본" });
    await form.getByLabel("지역").selectOption({ label: "도쿄" });
    await form.getByLabel("국가").selectOption({ label: "프랑스" });
    await expect(form.getByLabel("지역")).toHaveValue("");
    await form.getByLabel("지역").selectOption({ label: "파리" });

    // 경계값: 과거 시작일, 종료일 역전
    await form.getByLabel(kind.start).fill("2020-01-01");
    await form.getByLabel(kind.end).fill("2020-01-02");
    await form.getByRole("button", { name: "조건 확인하기" }).click();
    await expect(form.getByRole("alert").first()).toContainText(
      "입력한 내용을 확인해 주세요",
    );
    await form.getByLabel(kind.start).fill(daysFromNow(30));
    await form.getByLabel(kind.end).fill(daysFromNow(20));
    await form.getByRole("button", { name: "조건 확인하기" }).click();
    await expect(page.getByRole("alert").first()).toContainText(
      /빠를 수 없어요|늦어야 해요/,
    );

    // 정상 입력 → 요약
    await form.getByLabel(kind.end).fill(daysFromNow(35));
    await form.getByRole("button", { name: "조건 확인하기" }).click();
    await expect(
      panel.getByRole("heading", { name: "입력한 조건을 확인해 주세요" }),
    ).toBeVisible();
    await expect(
      panel.locator("dd").filter({ hasText: "프랑스" }),
    ).toBeVisible();
    await expect(panel.locator("dd").filter({ hasText: "파리" })).toBeVisible();
    await expect(
      panel.getByText(/입력값은 외부 사이트로 전달되지 않습니다/),
    ).toBeVisible();

    // 외부 이동
    await panel.getByRole("button", { name: kind.go }).click();
    const calls = await opened(page);
    if (calls.length > 0) {
      const url = new URL(calls[0].url);
      expect(url.protocol).toBe("https:");
      expect(url.search).toBe("");
      expect(calls[0].target).toBe("_blank");
      expect(calls[0].features).toContain("noopener");
      expect(calls[0].features).toContain("noreferrer");
    } else {
      // 서버에 이동 주소가 없으면 이동이 막히고 입력은 그대로 유지된다.
      await expect(
        panel.getByRole("alert").filter({ hasText: "이동을 막았어요" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "다시 시도" }),
      ).toBeVisible();
      await expect(
        panel.locator("dd").filter({ hasText: "파리" }),
      ).toBeVisible();
    }

    // 수정하기로 돌아가도 값이 유지된다.
    await panel.getByRole("button", { name: "수정하기" }).click();
    await expect(form.getByLabel("국가")).toHaveValue(/FR|프랑스/);

    // 입력값을 담은 네트워크 요청은 없다.
    expect(
      sent.filter((entry) => /프랑스|파리|FR|2\d{3}-\d{2}-\d{2}/.test(entry)),
    ).toEqual([]);
  });
}

test("③ 탭을 오가도 탭별 입력은 독립적으로 유지된다", async ({ page }) => {
  await page.goto("/travel-tools");
  await page
    .getByRole("form", { name: "항공 여행 조건" })
    .getByLabel("국가")
    .selectOption({ label: "일본" });
  await page.getByRole("tab", { name: "숙소 찾기" }).click();
  await expect(
    page.getByRole("form", { name: "숙소 여행 조건" }).getByLabel("국가"),
  ).toHaveValue("");
  await page.getByRole("tab", { name: "비행기 찾기" }).click();
  await expect(
    page.getByRole("form", { name: "항공 여행 조건" }).getByLabel("국가"),
  ).not.toHaveValue("");
  await expect(page).toHaveURL(/tab=flight/);
});

test.describe("④ 로그인 후 동행 작성", () => {
  test.skip(
    !auth.email || !auth.password,
    "E2E_AUTH_EMAIL / E2E_AUTH_PASSWORD 환경변수가 없어 로그인 후 동행 작성을 건너뜁니다.",
  );

  test("여행 정보를 입력해 동행글을 올리면 /mates로 이동한다", async ({
    page,
  }) => {
    const title = `e2e-작성-${Date.now()}`;
    await login(page, auth.email!, auth.password!);
    await page.goto("/travel-tools?tab=mate");
    const form = page.getByRole("form", { name: "동행 모집글 작성" });
    await expect(form).toBeVisible();

    // 연락처가 들어간 설명은 제출이 막힌다.
    await form.getByLabel("제목").fill(title);
    await form.getByLabel("국가").selectOption({ label: "일본" });
    await form.getByLabel("지역").selectOption({ label: "도쿄" });
    await form.getByLabel("시작일").fill(daysFromNow(20));
    await form.getByLabel("종료일").fill(daysFromNow(24));
    await form.getByRole("button", { name: "맛집" }).click();
    await form.getByLabel("설명").fill("연락은 010-1234-5678 로 주세요.");
    await form.getByRole("checkbox", { name: /동행 안전수칙/ }).check();
    await form.getByRole("button", { name: "동행글 올리기" }).click();
    await expect(form.getByText(/전화번호로 보이는 내용/)).toBeVisible();

    await form.getByLabel("설명").fill("E2E 작성 흐름 확인용 모집글입니다.");
    await form.getByRole("button", { name: "동행글 올리기" }).click();
    await expect(page).toHaveURL(/\/mates/);
  });
});
