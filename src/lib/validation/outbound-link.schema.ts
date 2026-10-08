import { z } from "zod";

/**
 * 관리자 외부 이동 URL 설정 (REQ-FUNC-077): HTTPS 주소만 허용한다.
 * http:, javascript:, data: 등은 저장할 수 없고, 주소에 계정 정보나 공백이 있어도 거부한다.
 */
export const outboundUrlSchema = z
  .string()
  .trim()
  .max(2048, "주소가 너무 길어요.")
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && !url.username && !url.password;
    } catch {
      return false;
    }
  }, "https:// 로 시작하는 올바른 주소만 설정할 수 있어요.");

export const outboundLinkSchema = z.object({
  linkKey: z.enum(["FLIGHT", "HOTEL"]),
  url: outboundUrlSchema,
});

export type OutboundLinkInput = z.infer<typeof outboundLinkSchema>;
