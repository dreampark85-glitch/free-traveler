import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "개인정보처리방침",
  description:
    "Free Traveler가 수집하는 개인정보의 항목, 이용 목적, 보관 방식, 이용자 권리 안내",
  path: "/privacy",
});

const POLICY_VERSION = "privacy-2026-10-09-draft";

const SECTIONS = [
  {
    heading: "1. 수집하는 정보",
    body: [
      "가입 시: 이메일 주소와 비밀번호(비밀번호는 인증 서비스가 암호화해 보관하며 서비스는 원문을 알 수 없습니다).",
      "프로필: 닉네임, 연령대, 여행 스타일은 필수이고 성별과 자기소개는 선택입니다. 성인 여부와 확인 시각을 저장하되 정확한 생년월일은 수집하지 않습니다.",
      "동행 이용 시: 작성한 동행 글, 참가 요청 메시지, 신고 내용, 차단 목록, 동행 안전수칙에 동의한 정책 버전과 시각.",
    ],
  },
  {
    heading: "2. 저장하지 않는 정보",
    body: [
      "여행 준비 화면에서 입력하는 항공·숙소 조건(출발지, 도착지, 날짜, 인원 등)은 서버, 데이터베이스, 주소, 로그, 분석 이벤트로 전송하지 않으며 브라우저 화면 안에서만 사용됩니다.",
      "즐겨찾기한 여행지는 서버로 보내지 않고 이용자의 브라우저 저장소(localStorage)에만 보관됩니다.",
    ],
  },
  {
    heading: "3. 이용 목적",
    body: [
      "회원 인증과 계정 관리, 동행 글·참가 요청 처리, 신고·차단 처리, 관리자의 외부 이동 주소 설정에 필요한 범위에서만 정보를 이용합니다.",
      "동행 글과 프로필에서 다른 이용자에게 공개되는 항목은 닉네임, 연령대, 여행 스타일, 성인 확인 여부, 작성한 글 내용입니다. 이메일 주소와 전화번호는 공개하지 않습니다.",
    ],
  },
  {
    heading: "4. 보관과 파기",
    body: [
      "정보는 서비스 이용 기간 동안 보관합니다. 탈퇴를 요청하면 인증 계정을 삭제하고 공개 프로필의 닉네임과 소개를 즉시 비식별 처리합니다.",
    ],
  },
  {
    heading: "5. 제3자 제공과 외부 서비스",
    body: [
      "회원 인증과 동행 데이터 저장에는 Supabase를, 배포에는 Vercel을 이용합니다. 그 밖에 이용자의 개인정보를 제3자에게 판매하거나 광고 목적으로 제공하지 않습니다.",
      "항공·숙소 외부 사이트로 이동할 때는 입력한 조건을 주소에 붙이지 않고 새 탭으로 엽니다.",
    ],
  },
  {
    heading: "6. 이용자의 권리",
    body: [
      "이용자는 언제든지 프로필을 수정하거나 탈퇴를 요청할 수 있으며, 차단과 신고 기능으로 원치 않는 노출을 줄일 수 있습니다.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-display-lg text-ink">개인정보처리방침</h1>
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
