import type { ReactNode } from "react";
import Link from "next/link";

export type CtaAction = {
  label: string;
  href: string;
  /** 외부 사이트로 이동하면 새 탭에서 열고 opener를 끊는다. */
  external?: boolean;
};

export type CtaBannerProps = {
  title: string;
  description: string;
  /** 버튼은 1~2개. 첫 번째가 Primary다. */
  actions: [CtaAction] | [CtaAction, CtaAction];
  /** 통계 배지, 요약 카드 등 본문과 버튼 사이에 놓을 내용 */
  children?: ReactNode;
};

const primary =
  "inline-flex items-center justify-center rounded-sm bg-coral px-6 py-3 text-button text-on-coral transition-colors hover:bg-coral-hover";
const secondary =
  "inline-flex items-center justify-center rounded-sm border border-coral bg-canvas px-6 py-3 text-button text-coral transition-colors hover:bg-coral-tint";

function ActionButton({
  action,
  className,
}: {
  action: CtaAction;
  className: string;
}) {
  if (action.external) {
    return (
      <a
        href={action.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {action.label}
      </a>
    );
  }
  return (
    <Link href={action.href} className={className}>
      {action.label}
    </Link>
  );
}

export default function CtaBanner({
  title,
  description,
  actions,
  children,
}: CtaBannerProps) {
  return (
    <section className="rounded-lg bg-coral-tint px-6 py-10 md:px-12 md:py-14">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <h2 className="text-display-md text-ink">{title}</h2>
        <p className="text-body-md text-body">{description}</p>
        {children}
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <ActionButton action={actions[0]} className={primary} />
          {actions[1] ? (
            <ActionButton action={actions[1]} className={secondary} />
          ) : null}
        </div>
      </div>
    </section>
  );
}
