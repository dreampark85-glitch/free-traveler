import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "동행 안전수칙",
  description:
    "처음 만나는 동행과 안전하게 여행하기 위한 Free Traveler 동행 안전수칙과 콘텐츠 면책 안내",
  path: "/safety-guidelines",
});

const POLICY_VERSION = "safety-guidelines-2026-10-09-draft";

const SECTIONS = [
  {
    heading: "1. 만나기 전에",
    body: [
      "동행 글에 전화번호, 이메일, 메신저 ID를 적지 않습니다. 대화는 서비스의 참가 요청 메시지 안에서 시작해 주세요.",
      "상대의 글과 프로필을 충분히 읽고, 일정과 비용 분담 방식을 출발 전에 글로 분명히 정해 두세요.",
      "처음 만날 때는 낮 시간대의 사람이 많은 공공장소에서 만나고, 일정과 만나는 곳을 가족이나 친구에게 미리 알려 주세요.",
    ],
  },
  {
    heading: "2. 여행 중에",
    body: [
      "불편하거나 위험하다고 느끼면 어떤 일정에서도 중단하고 혼자 이동할 수 있습니다. 거절은 예의에 어긋나지 않습니다.",
      "여권, 결제 수단, 숙소 정보는 각자 보관하고 서로의 개인 물품을 맡거나 대신 결제하는 일은 신중하게 판단하세요.",
      "비용은 각자 부담하는 것을 기본으로 하며, 서비스는 결제와 정산에 관여하지 않습니다.",
    ],
  },
  {
    heading: "3. 문제가 생기면",
    body: [
      "부적절한 요구나 행동을 겪으면 해당 글이나 이용자를 신고하고, 원하지 않는 노출은 차단으로 막을 수 있습니다.",
      "신체나 재산에 위험이 있으면 현지 긴급전화와 외교부 영사콜센터(+82-2-3210-0404)에 먼저 연락하세요.",
    ],
  },
  {
    heading: "4. 콘텐츠 면책",
    body: [
      "여행지와 안전정보는 공식 출처를 바탕으로 정리한 참고 자료이며 공식 판단을 대체하지 않습니다. 출국 전에 외교부 해외안전여행 등 원문을 다시 확인해 주세요.",
      "확인일이 7일을 넘긴 정보에는 재확인 안내가 표시됩니다.",
    ],
  },
];

export default function SafetyGuidelinesPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-display-lg text-ink">동행 안전수칙</h1>
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
