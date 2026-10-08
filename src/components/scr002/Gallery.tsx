import Image from "next/image";
import Link from "next/link";
import { focusRingClass, touchTargetClass } from "@/components/ui/FocusRing";
import {
  resolveProfileImage,
  type ProfileImage,
} from "@/data/representative-profile";

type GalleryProps = {
  /** alt·출처·작가·라이선스가 모두 있는 이미지만 표시한다. 8장 이상을 권장한다. */
  images: readonly Partial<ProfileImage>[];
};

/** 사진 그리드. 이미지 자리는 4:3 고정 치수 블록이라 로딩 중에도 레이아웃이 밀리지 않는다. */
export default function Gallery({ images }: GalleryProps) {
  const ready = images
    .map((image) => resolveProfileImage(image))
    .filter((image): image is ProfileImage => "src" in image);

  if (ready.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-md bg-surface-soft px-6 py-12 text-center">
        <p className="text-title-md text-ink">아직 공개된 사진이 없어요.</p>
        <p className="text-body-md text-body">
          출처와 라이선스를 확인한 사진부터 순서대로 올라와요. 그동안 여행지
          소개에서 현지 정보를 먼저 둘러보세요.
        </p>
        <Link
          href="/"
          className={`${touchTargetClass} ${focusRingClass} rounded-sm bg-coral px-6 py-3 text-button text-on-coral hover:bg-coral-hover`}
        >
          여행지 둘러보기
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-base md:grid-cols-4">
      {ready.map((image) => (
        <li key={image.src} className="flex flex-col gap-1">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-surface-soft">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              unoptimized
              loading="lazy"
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-cover"
            />
          </div>
          <p className="text-caption text-muted">
            <a
              href={image.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${focusRingClass} rounded-sm underline`}
            >
              {image.author} · {image.licenseType}
            </a>
          </p>
        </li>
      ))}
    </ul>
  );
}
