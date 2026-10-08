import { representativeProfile } from "@/data/representative-profile";

/** 확정 소개문·여행 철학·콘텐츠 편집 원칙을 정적 프로필 데이터 그대로 보여준다. */
export default function IntroPhilosophy() {
  const { intro, philosophy, editorialPrinciple, expertise } =
    representativeProfile;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-body-lg text-body">{intro.replaceAll("`", "")}</p>
      <blockquote className="border-l-4 border-coral pl-5 text-display-md text-ink">
        &ldquo;{philosophy}&rdquo;
      </blockquote>
      <p className="text-body-md text-body">
        <span className="text-title-sm text-ink">콘텐츠 원칙. </span>
        {editorialPrinciple}
      </p>
      <p className="text-body-md text-body">
        <span className="text-title-sm text-ink">전문 영역. </span>
        {expertise.join(", ")}
      </p>
    </div>
  );
}
