"use client";

import { useCallback } from "react";

export type ShareData = {
  title: string;
  text?: string;
  /** 생략하면 현재 페이지 주소를 쓴다. */
  url?: string;
};

export type ShareResult = "shared" | "copied" | "cancelled" | "failed";

/**
 * Web Share API를 우선 쓰고, 지원하지 않으면 주소를 클립보드에 복사한다.
 * 공유하는 내용은 호출자가 넘긴 제목·문구·주소뿐이며 어디에도 전송·기록하지 않는다.
 */
export function useSharePage() {
  return useCallback(async (data: ShareData): Promise<ShareResult> => {
    const url = data.url ?? window.location.href;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: data.title, text: data.text, url });
        return "shared";
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return "cancelled";
        }
        // 공유 시트를 열지 못하면 복사로 넘어간다.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      return "copied";
    } catch {
      return "failed";
    }
  }, []);
}
