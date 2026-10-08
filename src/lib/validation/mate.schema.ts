import { z } from "zod";
import {
  dateStringSchema,
  plainText,
  travelStylesSchema,
  uuidSchema,
} from "./common.schema";

/** 동행 모집글 작성·수정 입력 (REQ-FUNC-031). 연락처 탐지는 별도 Task(UNIT-CONTACT-DETECTION)에서 추가한다. */
export const matePostSchema = z
  .object({
    title: plainText(2, 100),
    countryCode: z
      .string()
      .regex(/^[A-Z]{2}$/, "국가 코드는 대문자 2자리여야 해요."),
    region: plainText(1, 60).optional(),
    startDate: dateStringSchema,
    endDate: dateStringSchema,
    capacity: z
      .number()
      .int()
      .min(1, "모집 인원은 1명 이상이에요.")
      .max(10, "모집 인원은 10명까지예요."),
    travelStyles: travelStylesSchema.min(
      1,
      "여행 스타일을 1개 이상 선택해 주세요.",
    ),
    description: plainText(1, 3000),
    /** 안전수칙에 동의해야 글을 올릴 수 있다. */
    safetyAgreed: z.literal(true, { error: "동행 안전수칙에 동의해 주세요." }),
    policyVersion: plainText(1, 20),
  })
  .refine((v) => v.endDate >= v.startDate, {
    path: ["endDate"],
    message: "종료일은 시작일보다 빠를 수 없어요.",
  });

export type MatePostInput = z.infer<typeof matePostSchema>;

/** 참가 요청 입력 (REQ-FUNC-034): 500자 제한의 비공개 메시지 */
export const mateApplicationSchema = z.object({
  postId: uuidSchema,
  message: plainText(1, 500),
});

export type MateApplicationInput = z.infer<typeof mateApplicationSchema>;

/** 작성자의 요청 처리: 승인 또는 거절만 허용 */
export const applicationDecisionSchema = z.object({
  decision: z.enum(["ACCEPTED", "REJECTED"]),
});
