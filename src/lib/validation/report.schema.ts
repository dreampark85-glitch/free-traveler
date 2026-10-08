import { z } from "zod";
import { plainText, uuidSchema } from "./common.schema";

/** 신고 입력 (REQ-FUNC-039): 사유 코드 + 설명 */
export const reportSchema = z.object({
  targetType: z.enum(["POST", "USER"]),
  targetId: uuidSchema,
  reasonCode: z.enum(
    ["SPAM", "CONTACT_EXPOSURE", "HARASSMENT", "FRAUD", "OTHER"],
    {
      error: "신고 사유를 선택해 주세요.",
    },
  ),
  description: plainText(0, 1000).optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;

/** 차단·차단 해제 입력 (REQ-FUNC-040) */
export const blockSchema = z.object({
  blockedId: uuidSchema,
});

/** 관리자의 신고 상태 변경 (REQ-FUNC-041) */
export const reportStatusSchema = z.object({
  reportId: uuidSchema,
  status: z.enum(["OPEN", "RESOLVED", "DISMISSED"]),
});
