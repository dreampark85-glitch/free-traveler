import { z } from "zod";
import { plainText, travelStylesSchema } from "./common.schema";

/** 프로필 수정 입력. 닉네임·연령대·여행 스타일은 필수, 성별·자기소개는 선택. */
export const profileUpdateSchema = z.object({
  nickname: plainText(2, 30),
  ageBand: z.enum(["20S", "30S", "40S", "50S", "60_PLUS"], {
    error: "연령대를 선택해 주세요.",
  }),
  gender: z.enum(["FEMALE", "MALE", "OTHER", "UNDISCLOSED"]).optional(),
  travelStyles: travelStylesSchema.min(
    1,
    "여행 스타일을 1개 이상 선택해 주세요.",
  ),
  bio: plainText(0, 500).optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
