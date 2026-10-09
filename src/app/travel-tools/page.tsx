import { Suspense, type ReactNode } from "react";
import CtaBanner from "@/components/shared/CtaBanner";
import FlightForm from "@/components/scr003/FlightForm";
import HotelForm from "@/components/scr003/HotelForm";
import MateComposer, {
  type MateViewer,
} from "@/components/scr003/MateComposer";
import TabSwitcher from "@/components/scr003/TabSwitcher";
import { getSessionUser } from "@/lib/auth/session";
import { buildMetadata } from "@/lib/seo";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { outboundUrlSchema } from "@/lib/validation/outbound-link.schema";

export const metadata = buildMetadata({
  title: "여행 준비",
  description:
    "항공권과 숙소 조건을 정리해 외부 사이트로 이동하고, 같은 일정으로 떠날 동행 모집글도 작성하세요. 입력한 조건은 서버로 전달되지 않습니다.",
  path: "/travel-tools",
});

/** 항상 요청 시점의 세션과 설정을 읽는다. */
export const dynamic = "force-dynamic";

const STEPS = [
  {
    title: "조건 입력",
    body: "국가, 지역, 날짜를 입력해요. 입력한 값은 이 화면 안에서만 쓰여요.",
  },
  {
    title: "요약 확인",
    body: "입력한 조건을 한눈에 확인하고, 틀린 곳은 바로 고칠 수 있어요.",
  },
  {
    title: "이동 또는 게시",
    body: "항공·숙소는 외부 사이트를 새 탭으로 열고, 동행은 모집글로 올려요.",
  },
] as const;

const TIPS = [
  {
    title: "날짜를 하루씩 옮겨 비교해 보세요",
    body: "출발일과 귀국일을 앞뒤로 하루만 바꿔도 조건이 달라질 수 있어요. 여러 날짜를 번갈아 확인해 보세요.",
  },
  {
    title: "결제 전에 수하물·취소 규정을 확인하세요",
    body: "같은 조건이라도 수하물과 취소·변경 규정이 달라요. 예약 사이트의 안내 문구를 끝까지 읽어 주세요.",
  },
  {
    title: "숙소는 위치와 교통을 먼저 살펴보세요",
    body: "역이나 정류장에서 얼마나 걸리는지 지도로 확인하면 이동 시간을 아낄 수 있어요.",
  },
] as const;

type OutboundUrls = { flight: string | null; hotel: string | null };

function validUrl(value: string | undefined | null): string | null {
  const parsed = outboundUrlSchema.safeParse(value ?? "");
  return parsed.success ? parsed.data : null;
}

/** 관리자가 설정한 주소를 먼저 쓰고, 없으면 환경변수를 쓴다. 둘 다 HTTPS가 아니면 null. */
async function loadOutboundUrls(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>> | null,
): Promise<OutboundUrls> {
  let flight: string | null = null;
  let hotel: string | null = null;
  if (supabase) {
    const { data } = await supabase
      .from("outbound_link_setting")
      .select("link_key, url");
    for (const row of data ?? []) {
      if (row.link_key === "FLIGHT") flight = validUrl(row.url);
      if (row.link_key === "HOTEL") hotel = validUrl(row.url);
    }
  }
  return {
    flight: flight ?? validUrl(process.env.FLIGHT_OUTBOUND_URL),
    hotel: hotel ?? validUrl(process.env.HOTEL_OUTBOUND_URL),
  };
}

/** 로그인 여부와 성인 확인 여부로 동행 작성 폼의 상태를 정한다. */
async function loadViewer(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>> | null,
): Promise<MateViewer> {
  if (!supabase) return "GUEST";
  const user = await getSessionUser();
  if (!user) return "GUEST";
  if (!user.email_confirmed_at) return "NOT_ADULT";
  const { data } = await supabase
    .from("user_profile")
    .select("is_adult, status")
    .eq("user_id", user.id)
    .maybeSingle();
  return data?.is_adult && data.status === "ACTIVE" ? "READY" : "NOT_ADULT";
}

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="mx-auto w-full max-w-[1200px] px-5 py-10 md:py-16"
    >
      <header className="mb-6 flex flex-col gap-1">
        <h2 id={id} className="text-display-md text-ink md:text-display-lg">
          {title}
        </h2>
        {description ? (
          <p className="text-body-md text-body">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

export default async function TravelToolsPage() {
  // Supabase 환경변수가 없거나 연결할 수 없어도 페이지는 열린다(동행 탭은 로그인 안내로 대체).
  let supabase: Awaited<ReturnType<typeof createSupabaseServerClient>> | null =
    null;
  try {
    supabase = await createSupabaseServerClient();
  } catch {
    supabase = null;
  }

  const [urls, viewer] = await Promise.all([
    loadOutboundUrls(supabase).catch((): OutboundUrls => ({
      flight: validUrl(process.env.FLIGHT_OUTBOUND_URL),
      hotel: validUrl(process.env.HOTEL_OUTBOUND_URL),
    })),
    loadViewer(supabase).catch((): MateViewer => "GUEST"),
  ]);

  return (
    <>
      <section aria-labelledby="tools-intro" className="bg-surface-soft">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-5 py-14 md:py-20">
          <div className="flex max-w-2xl flex-col gap-3">
            <h1
              id="tools-intro"
              className="text-display-lg text-ink md:text-display-xl"
            >
              여행 조건부터 정리하고 이동하세요
            </h1>
            <p className="text-body-lg text-body">
              항공편과 숙소 조건을 정리해 외부 사이트로 이동하거나, 같은
              일정으로 떠날 동행 모집글을 올려 보세요.
            </p>
          </div>
          <ol className="grid grid-cols-1 gap-base md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="flex flex-col gap-2 rounded-md bg-canvas p-lg"
              >
                <span className="text-caption text-coral">{index + 1}단계</span>
                <h2 className="text-title-md text-ink">{step.title}</h2>
                <p className="text-body-sm text-body">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Section id="tools-tabs" title="항공편 · 숙소 · 동행 구하기">
        <Suspense
          fallback={<div className="h-96 rounded-md bg-surface-soft" />}
        >
          <TabSwitcher
            panels={{
              flight: (
                <div className="flex flex-col gap-4">
                  <h3 className="text-title-md text-ink">
                    여행 조건을 입력해 주세요
                  </h3>
                  <FlightForm outboundUrl={urls.flight} />
                </div>
              ),
              hotel: (
                <div className="flex flex-col gap-4">
                  <h3 className="text-title-md text-ink">
                    여행 조건을 입력해 주세요
                  </h3>
                  <HotelForm outboundUrl={urls.hotel} />
                </div>
              ),
              mate: (
                <div className="flex flex-col gap-4">
                  <h3 className="text-title-md text-ink">
                    함께 떠날 동행을 모집해 보세요
                  </h3>
                  <MateComposer viewer={viewer} />
                </div>
              ),
            }}
          />
        </Suspense>
      </Section>

      <div className="bg-surface-soft">
        <Section id="tools-tips" title="더 편하게 찾는 팁">
          <ul className="grid grid-cols-1 gap-base md:grid-cols-3">
            {TIPS.map((tip) => (
              <li
                key={tip.title}
                className="flex flex-col gap-2 rounded-md border border-hairline bg-canvas p-lg"
              >
                <h3 className="text-title-md text-ink">{tip.title}</h3>
                <p className="text-body-sm text-body">{tip.body}</p>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <div className="mx-auto w-full max-w-[1200px] px-5 py-10 md:py-16">
        <CtaBanner
          title="이미 올라온 동행글도 살펴보세요"
          description="내 일정과 맞는 동행이 있는지 먼저 확인하고, 처음 만나기 전에는 안전수칙을 꼭 읽어 주세요."
          actions={[
            { label: "동행글 보러 가기", href: "/mates" },
            { label: "동행 안전수칙 읽기", href: "/safety-guidelines" },
          ]}
        />
      </div>
    </>
  );
}
