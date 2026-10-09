import { describe, expect, it } from "vitest";
import { deriveStatus } from "@/lib/mate/deriveStatus";

describe("동행글 모집 상태 파생 (REQ-FUNC-037)", () => {
  it("종료일이 오늘 이후이면 OPEN이다", () => {
    expect(deriveStatus({ endDate: "2026-10-11" }, "2026-10-10")).toBe("OPEN");
    expect(deriveStatus({ endDate: "2027-01-01" }, "2026-10-10")).toBe("OPEN");
  });

  it("경계일: 종료일이 오늘이면 아직 OPEN이다", () => {
    expect(deriveStatus({ endDate: "2026-10-10" }, "2026-10-10")).toBe("OPEN");
  });

  it("경계일: 종료일이 어제이면 CLOSED이다", () => {
    expect(deriveStatus({ endDate: "2026-10-09" }, "2026-10-10")).toBe(
      "CLOSED",
    );
  });

  it("익일: 어제까지 OPEN이던 글이 하루 지나면 CLOSED로 바뀐다", () => {
    const post = { endDate: "2026-10-10" };
    expect(deriveStatus(post, "2026-10-10")).toBe("OPEN");
    expect(deriveStatus(post, "2026-10-11")).toBe("CLOSED");
  });

  it("작성자가 수동으로 마감한 글은 종료일이 남아도 CLOSED이다", () => {
    expect(
      deriveStatus({ status: "CLOSED", endDate: "2099-12-31" }, "2026-10-10"),
    ).toBe("CLOSED");
  });

  it("저장된 상태가 OPEN이어도 종료일이 지나면 CLOSED이다(배치 없이 조회 시점에 파생)", () => {
    expect(
      deriveStatus({ status: "OPEN", endDate: "2026-01-01" }, "2026-10-10"),
    ).toBe("CLOSED");
  });

  it("Date 객체의 로컬 날짜로도 같은 결과를 낸다", () => {
    const today = new Date(2026, 9, 10, 23, 59); // 로컬 2026-10-10 23:59
    expect(deriveStatus({ endDate: "2026-10-10" }, today)).toBe("OPEN");
    expect(deriveStatus({ endDate: "2026-10-09" }, today)).toBe("CLOSED");
    const nextDay = new Date(2026, 9, 11, 0, 0);
    expect(deriveStatus({ endDate: "2026-10-10" }, nextDay)).toBe("CLOSED");
  });

  it("월말·연말 경계에서도 문자열 날짜 비교가 맞다", () => {
    expect(deriveStatus({ endDate: "2026-12-31" }, "2027-01-01")).toBe(
      "CLOSED",
    );
    expect(deriveStatus({ endDate: "2026-02-28" }, "2026-03-01")).toBe(
      "CLOSED",
    );
    expect(deriveStatus({ endDate: "2026-02-28" }, "2026-02-28")).toBe("OPEN");
  });
});
