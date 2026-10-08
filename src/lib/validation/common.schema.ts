import { z } from "zod";

/**
 * 저장 XSS 방지 계층 (REQ-NF-015). React가 렌더링 시 이스케이프하더라도
 * 저장 단계에서 HTML 태그, 스크립트 URL, 제어 문자가 들어간 텍스트를 거부한다.
 */
const HTML_TAG = /<\s*\/?\s*[a-zA-Z!][^>]*>?/;
const DANGEROUS_SCHEME = /(?:javascript|vbscript|data)\s*:/i;
// 탭(\t)과 줄바꿈(\n, \r)을 제외한 제어 문자
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

export function isSafePlainText(value: string): boolean {
  return (
    !HTML_TAG.test(value) &&
    !DANGEROUS_SCHEME.test(value) &&
    !CONTROL_CHARS.test(value)
  );
}

/** 앞뒤 공백을 제거하고 HTML·스크립트 URL·제어 문자를 거부하는 일반 텍스트 */
export function plainText(min: number, max: number) {
  return z
    .string()
    .trim()
    .min(min, `${min}자 이상 입력해 주세요.`)
    .max(max, `${max}자 이하로 입력해 주세요.`)
    .refine(isSafePlainText, "HTML 태그나 스크립트는 입력할 수 없어요.");
}

export const uuidSchema = z.uuid("올바른 ID가 아니에요.");

/** YYYY-MM-DD 형식의 실제 존재하는 날짜 */
export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식으로 입력해 주세요.")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
    );
  }, "존재하지 않는 날짜예요.");

export const travelStylesSchema = z
  .array(plainText(1, 20))
  .max(10, "여행 스타일은 10개까지 선택할 수 있어요.");
