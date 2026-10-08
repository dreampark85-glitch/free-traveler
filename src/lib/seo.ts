import type { Metadata } from "next";

export const SITE_NAME = "Free Traveler";

type BuildMetadataInput = {
  /** 화면 제목. 사이트 이름은 자동으로 붙는다. */
  title: string;
  description: string;
  /** 정규 경로(예: "/about"). canonical과 og:url에 쓴다. */
  path: string;
};

/**
 * 공개 페이지 공통 메타데이터 빌더 (title / description / canonical / Open Graph).
 * 각 page.tsx가 `export const metadata = buildMetadata({...})`로 호출한다.
 * canonical·og:url은 상대 경로이므로 루트 layout의 `metadataBase`로 절대 URL이 된다.
 */
export function buildMetadata({
  title,
  description,
  path,
}: BuildMetadataInput): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;
  return {
    title: fullTitle,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      type: "website",
      locale: "ko_KR",
    },
  };
}
