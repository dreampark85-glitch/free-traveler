import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "이용약관",
  description:
    "Free Traveler 서비스 이용 조건, 동행 기능 이용 책임, 콘텐츠 면책 안내",
  path: "/terms",
});

const POLICY_VERSION = "terms-2026-10-09-draft";

const SECTIONS = [
  {
    heading: "1. 서비스 소개",
    body: [
      "Free Traveler는 자유여행을 준비하는 사람을 위해 여행지 소개, 국가별 안전정보, 여행 조건 정리, 동행 모집·참가 요청 기능을 제공합니다.",
      "본 서비스는 항공권과 숙소의 예약·결제를 대행하지 않습니다. 외부 사이트로 이동하는 링크만 제공하며, 외부 사이트에서 이루어지는 거래는 해당 사업자의 약관을 따릅니다.",
    ],
  },
  {
    heading: "2. 계정과 성인 확인",
    body: [
      "동행 글을 작성하거나 참가를 요청하려면 이메일로 가입하고 만 19세 이상임을 확인해야 합니다.",
      "서비스는 정확한 생년월일을 수집하지 않고 성인 여부와 확인 시각만 저장합니다.",
    ],
  },
  {
    heading: "3. 동행 기능 이용 규칙",
    body: [
      "동행 글과 참가 요청에는 전화번호, 이메일 주소, 메신저 ID 같은 연락처를 적을 수 없습니다. 연락처로 보이는 내용이 있으면 등록이 제한됩니다.",
      "동행자 사이의 비용 분담은 당사자끼리 자율적으로 정하며, 서비스는 결제나 정산에 관여하지 않습니다.",
      "동행 글을 작성하려면 동행 안전수칙에 동의해야 하며, 동의한 정책 버전과 시각이 함께 기록됩니다.",
    ],
  },
  {
    heading: "4. 신고와 차단",
    body: [
      "다른 이용자의 글이나 행동이 부적절하다고 판단되면 신고할 수 있고, 특정 이용자를 차단하면 서로의 글과 프로필 노출이 제한됩니다.",
      "접수된 신고는 관리자가 상태(접수, 처리 완료, 기각)를 변경하는 방식으로 관리됩니다.",
    ],
  },
  {
    heading: "5. 콘텐츠 면책",
    body: [
      "여행지와 국가별 안전정보는 공식 출처를 바탕으로 정리한 참고 자료이며 공식 판단을 대체하지 않습니다. 출국 전에는 반드시 외교부 해외안전여행 등 공식 원문을 다시 확인해 주세요.",
      "변동 가능한 정보에는 확인일을 표시하며, 확인일이 7일을 넘기면 재확인이 필요하다는 안내를 함께 보여줍니다.",
      "서비스는 여행 중 발생한 사고, 손해, 분쟁에 대해 법령이 허용하는 범위에서 책임을 지지 않습니다.",
    ],
  },
  {
    heading: "6. 약관의 변경",
    body: [
      "약관을 바꾸면 이 페이지에 새 버전을 게시하고 버전 식별자를 갱신합니다.",
    ],
  },
];

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-display-lg text-ink">이용약관</h1>
        <p className="text-body-sm text-muted">정책 버전: {POLICY_VERSION}</p>
      </header>
      <div className="flex flex-col gap-8">
        {SECTIONS.map((section) => (
          <section key={section.heading} className="flex flex-col gap-2">
            <h2 className="text-display-md text-ink">{section.heading}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="text-body-md text-body">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
