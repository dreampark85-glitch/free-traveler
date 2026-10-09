import { describe, expect, it } from "vitest";
import {
  todayString,
  validateFlightDates,
} from "@/components/scr003/FlightForm";
import { validateHotelDates } from "@/components/scr003/HotelForm";

const TODAY = "2026-10-09";

describe("todayString", () => {
  it("로컬 날짜를 YYYY-MM-DD로 만든다", () => {
    expect(todayString(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
    expect(todayString(new Date(2026, 11, 31, 0, 0))).toBe("2026-12-31");
  });
});

describe("validateFlightDates", () => {
  it("정상 입력은 오류가 없다", () => {
    expect(validateFlightDates("2026-10-20", "2026-10-25", TODAY)).toEqual({});
  });
  it("출발일이 오늘이면 허용한다", () => {
    expect(validateFlightDates(TODAY, "2026-10-12", TODAY)).toEqual({});
  });
  it("출발일이 어제면 거부한다", () => {
    expect(validateFlightDates("2026-10-08", "2026-10-12", TODAY).start).toBe(
      "출발일은 오늘 이후여야 해요.",
    );
  });
  it("같은 날 왕복은 허용한다", () => {
    expect(validateFlightDates("2026-10-20", "2026-10-20", TODAY)).toEqual({});
  });
  it("귀국일이 출발일보다 하루 빠르면 거부한다", () => {
    expect(validateFlightDates("2026-10-20", "2026-10-19", TODAY).end).toBe(
      "귀국일은 출발일보다 빠를 수 없어요.",
    );
  });
  it("빈 값은 각각 필수 오류를 낸다", () => {
    expect(validateFlightDates("", "", TODAY)).toEqual({
      start: "출발일을 입력해 주세요.",
      end: "귀국일을 입력해 주세요.",
    });
  });
  it("출발일만 비어 있으면 귀국일은 필수 오류만 비교 없이 통과한다", () => {
    expect(validateFlightDates("", "2026-10-20", TODAY)).toEqual({
      start: "출발일을 입력해 주세요.",
    });
  });
  it("과거 출발일과 역전된 귀국일은 오류를 함께 낸다", () => {
    const errors = validateFlightDates("2020-01-02", "2020-01-01", TODAY);
    expect(errors.start).toBeDefined();
    expect(errors.end).toBeDefined();
  });
  it("연도·월 경계에서도 문자열 비교가 올바르다", () => {
    expect(validateFlightDates("2026-12-31", "2027-01-01", TODAY)).toEqual({});
    expect(
      validateFlightDates("2027-01-01", "2026-12-31", TODAY).end,
    ).toBeDefined();
  });
});

describe("validateHotelDates", () => {
  it("정상 입력은 오류가 없다", () => {
    expect(validateHotelDates("2026-10-20", "2026-10-23", TODAY)).toEqual({});
  });
  it("체크인이 오늘이면 허용한다", () => {
    expect(validateHotelDates(TODAY, "2026-10-10", TODAY)).toEqual({});
  });
  it("체크인이 어제면 거부한다", () => {
    expect(validateHotelDates("2026-10-08", "2026-10-12", TODAY).start).toBe(
      "체크인은 오늘 이후여야 해요.",
    );
  });
  it("체크아웃이 체크인과 같은 날이면 거부한다", () => {
    expect(validateHotelDates("2026-10-20", "2026-10-20", TODAY).end).toBe(
      "체크아웃은 체크인보다 늦어야 해요.",
    );
  });
  it("체크아웃이 체크인보다 빠르면 거부한다", () => {
    expect(validateHotelDates("2026-10-20", "2026-10-19", TODAY).end).toBe(
      "체크아웃은 체크인보다 늦어야 해요.",
    );
  });
  it("체크아웃이 체크인 다음 날이면 허용한다", () => {
    expect(validateHotelDates("2026-10-20", "2026-10-21", TODAY)).toEqual({});
  });
  it("빈 값은 각각 필수 오류를 낸다", () => {
    expect(validateHotelDates("", "", TODAY)).toEqual({
      start: "체크인 날짜를 입력해 주세요.",
      end: "체크아웃 날짜를 입력해 주세요.",
    });
  });
});
