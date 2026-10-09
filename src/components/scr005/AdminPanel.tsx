"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState, type FormEvent } from "react";
import { focusRingClass, touchTargetClass } from "@/components/ui/FocusRing";
import { showToast } from "@/hooks/useToast";
import { outboundUrlSchema } from "@/lib/validation/outbound-link.schema";

/**
 * 관리자 패널. 신고 처리 현황과 외부 URL 설정, 정확히 2개 Section만 둔다.
 * 통계·KPI·감사 로그 같은 대시보드 요소는 두지 않는다.
 * 이 컴포넌트는 관리자에게만 렌더링해야 하며, API와 RLS가 서버에서 다시 막는다.
 */
export default function AdminPanel() {
  return (
    <div className="flex flex-col gap-12">
      <ReportSection />
      <OutboundUrlSection />
    </div>
  );
}

const btn = `${touchTargetClass} ${focusRingClass} rounded-sm px-4 text-button`;

// ---- ① 신고 처리 현황 ---------------------------------------------------------------------

type ReportStatus = "OPEN" | "RESOLVED" | "DISMISSED";

type Report = {
  id: string;
  targetType: "POST" | "USER";
  targetId: string;
  reasonCode: string;
  description: string | null;
  status: ReportStatus;
  createdAt: string;
};

const STATUS_FILTERS: { value: ReportStatus; label: string }[] = [
  { value: "OPEN", label: "접수" },
  { value: "RESOLVED", label: "처리 완료" },
  { value: "DISMISSED", label: "기각" },
];

const REASON_LABEL: Record<string, string> = {
  SPAM: "스팸·광고",
  CONTACT_EXPOSURE: "연락처 노출",
  HARASSMENT: "괴롭힘·부적절한 언행",
  FRAUD: "사기 의심",
  OTHER: "기타",
};

type ReportState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; items: Report[] };

function ReportSection() {
  const [filter, setFilter] = useState<ReportStatus>("OPEN");
  const [state, setState] = useState<ReportState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/admin/reports?status=${filter}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("failed");
        return response.json() as Promise<{ items: Report[] }>;
      })
      .then((body) => setState({ status: "ready", items: body.items }))
      .catch((caught: unknown) => {
        if (caught instanceof DOMException && caught.name === "AbortError") {
          return;
        }
        setState({ status: "error" });
      });
    return () => controller.abort();
  }, [filter, attempt]);

  function reload() {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }

  async function changeStatus(id: string, next: ReportStatus) {
    setError(null);
    try {
      const response = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reportId: id, status: next }),
      });
      if (!response.ok) throw new Error("failed");
      showToast("신고 상태를 바꿨어요");
      reload();
    } catch {
      setError("상태를 바꾸지 못했어요. 잠시 뒤 다시 시도해 주세요.");
    }
  }

  return (
    <section aria-labelledby="admin-reports" className="flex flex-col gap-4">
      <h3 id="admin-reports" className="text-title-md text-ink">
        신고 처리 현황
      </h3>

      <div
        role="group"
        aria-label="신고 상태 필터"
        className="flex flex-wrap gap-2"
      >
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={filter === f.value}
            onClick={() => {
              setState({ status: "loading" });
              setFilter(f.value);
            }}
            className={`${touchTargetClass} ${focusRingClass} rounded-full px-4 text-title-sm ${
              filter === f.value
                ? "bg-coral text-on-coral"
                : "bg-surface-strong text-body hover:text-coral"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error ? (
        <p role="alert" className="text-body-sm text-danger">
          <span aria-hidden="true">⚠ </span>
          {error}
        </p>
      ) : null}

      {state.status === "loading" ? (
        <div aria-busy="true" className="flex flex-col gap-2">
          <div className="h-20 rounded-md bg-surface-soft" />
          <div className="h-20 rounded-md bg-surface-soft" />
        </div>
      ) : null}

      {state.status === "error" ? (
        <div
          role="alert"
          className="flex flex-col items-start gap-2 rounded-md bg-danger-bg px-4 py-4 text-danger"
        >
          <p className="text-body-md">
            <span aria-hidden="true">⚠ </span>
            신고 목록을 불러오지 못했어요.
          </p>
          <button
            type="button"
            onClick={reload}
            className={`${btn} border border-danger`}
          >
            다시 시도
          </button>
        </div>
      ) : null}

      {state.status === "ready" && state.items.length === 0 ? (
        <div className="rounded-md bg-surface-soft px-4 py-6">
          <p className="text-title-sm text-ink">
            이 상태의 신고가 아직 없어요.
          </p>
          <p className="mt-1 text-body-sm text-body">
            새 신고가 접수되면 &lsquo;접수&rsquo; 목록에 나타나고, 처리하면 다른
            상태 목록으로 옮겨져요.
          </p>
        </div>
      ) : null}

      {state.status === "ready" && state.items.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {state.items.map((report) => (
            <li
              key={report.id}
              className="flex flex-col gap-2 rounded-md border border-hairline bg-canvas p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-title-sm text-ink">
                  {REASON_LABEL[report.reasonCode] ?? report.reasonCode}
                </span>
                <span className="rounded-full bg-surface-strong px-2 py-0.5 text-caption text-body">
                  {STATUS_FILTERS.find((f) => f.value === report.status)?.label}
                </span>
                <span className="text-body-sm text-muted">
                  {new Date(report.createdAt).toLocaleString("ko-KR")}
                </span>
              </div>
              <p className="text-body-sm text-muted">
                대상: {report.targetType === "POST" ? "동행 글" : "사용자"}{" "}
                {report.targetType === "POST" ? (
                  <Link
                    href="/mates"
                    className={`${focusRingClass} rounded-sm text-info underline`}
                  >
                    {report.targetId.slice(0, 8)}
                  </Link>
                ) : (
                  report.targetId.slice(0, 8)
                )}
              </p>
              {report.description ? (
                <p className="whitespace-pre-wrap break-words text-body-md text-body">
                  {report.description}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {report.status !== "RESOLVED" ? (
                  <button
                    type="button"
                    onClick={() => changeStatus(report.id, "RESOLVED")}
                    className={`${btn} bg-coral text-on-coral hover:bg-coral-hover`}
                  >
                    처리 완료
                  </button>
                ) : null}
                {report.status !== "DISMISSED" ? (
                  <button
                    type="button"
                    onClick={() => changeStatus(report.id, "DISMISSED")}
                    className={`${btn} border border-hairline`}
                  >
                    기각
                  </button>
                ) : null}
                {report.status !== "OPEN" ? (
                  <button
                    type="button"
                    onClick={() => changeStatus(report.id, "OPEN")}
                    className={`${btn} border border-hairline`}
                  >
                    다시 접수
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

// ---- ② 외부 URL 설정 ----------------------------------------------------------------------

type UrlState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; flight: string; hotel: string };

function OutboundUrlSection() {
  const uid = useId();
  const [state, setState] = useState<UrlState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [flight, setFlight] = useState("");
  const [hotel, setHotel] = useState("");
  const [errors, setErrors] = useState<{ flight?: string; hotel?: string }>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/outbound-urls")
      .then((response) => {
        if (!response.ok) throw new Error("failed");
        return response.json() as Promise<{
          flight: string | null;
          hotel: string | null;
        }>;
      })
      .then((body) => {
        if (cancelled) return;
        setFlight(body.flight ?? "");
        setHotel(body.hotel ?? "");
        setState({
          status: "ready",
          flight: body.flight ?? "",
          hotel: body.hotel ?? "",
        });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const save = useCallback(
    async (linkKey: "FLIGHT" | "HOTEL", value: string) => {
      const field = linkKey === "FLIGHT" ? "flight" : "hotel";
      const parsed = outboundUrlSchema.safeParse(value);
      if (!parsed.success) {
        setErrors((e) => ({
          ...e,
          [field]:
            "HTTPS 주소만 저장할 수 있어요. https:// 로 시작하는 주소를 입력해 주세요.",
        }));
        return;
      }
      setErrors((e) => ({ ...e, [field]: undefined }));
      setBusy(true);
      try {
        const response = await fetch("/api/admin/outbound-urls", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ linkKey, url: parsed.data }),
        });
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: { message?: string };
          } | null;
          setErrors((e) => ({
            ...e,
            [field]: body?.error?.message ?? "주소를 저장하지 못했어요.",
          }));
          return;
        }
        showToast(
          linkKey === "FLIGHT"
            ? "항공 이동 주소를 저장했어요"
            : "숙소 이동 주소를 저장했어요",
        );
      } catch {
        setErrors((e) => ({
          ...e,
          [field]: "네트워크 연결을 확인한 뒤 다시 시도해 주세요.",
        }));
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  function onSubmit(event: FormEvent) {
    event.preventDefault();
  }

  const input = `${touchTargetClass} ${focusRingClass} w-full rounded-sm border bg-canvas px-3 text-body-md text-ink`;

  return (
    <section aria-labelledby="admin-urls" className="flex flex-col gap-4">
      <h3 id="admin-urls" className="text-title-md text-ink">
        외부 URL 설정
      </h3>
      <p className="text-body-sm text-muted">
        여행 준비 화면의 &lsquo;이동&rsquo; 버튼이 여는 항공·숙소 사이트
        주소예요. HTTPS 주소만 저장할 수 있고, 입력값을 주소에 붙이지 않고 새
        탭으로 열어요.
      </p>

      {state.status === "loading" ? (
        <div aria-busy="true" className="flex flex-col gap-2">
          <div className="h-16 rounded-md bg-surface-soft" />
          <div className="h-16 rounded-md bg-surface-soft" />
        </div>
      ) : null}

      {state.status === "error" ? (
        <div
          role="alert"
          className="flex flex-col items-start gap-2 rounded-md bg-danger-bg px-4 py-4 text-danger"
        >
          <p className="text-body-md">
            <span aria-hidden="true">⚠ </span>
            설정을 불러오지 못했어요.
          </p>
          <button
            type="button"
            onClick={() => {
              setState({ status: "loading" });
              setAttempt((n) => n + 1);
            }}
            className={`${btn} border border-danger`}
          >
            다시 시도
          </button>
        </div>
      ) : null}

      {state.status === "ready" ? (
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          {(
            [
              ["FLIGHT", "항공 검색 사이트 주소", flight, setFlight, "flight"],
              ["HOTEL", "숙소 검색 사이트 주소", hotel, setHotel, "hotel"],
            ] as const
          ).map(([key, label, value, setValue, field]) => (
            <div key={key} className="flex flex-col gap-1">
              <label
                htmlFor={`${uid}-${field}`}
                className="text-title-sm text-ink"
              >
                {label}
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id={`${uid}-${field}`}
                  type="url"
                  inputMode="url"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  aria-invalid={Boolean(errors[field])}
                  aria-describedby={`${uid}-${field}-help`}
                  className={`${input} ${errors[field] ? "border-danger" : "border-hairline"}`}
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => save(key, value)}
                  className={`${btn} shrink-0 bg-coral text-on-coral hover:bg-coral-hover disabled:opacity-60`}
                >
                  저장
                </button>
              </div>
              <p
                id={`${uid}-${field}-help`}
                role={errors[field] ? "alert" : undefined}
                className={`text-body-sm ${errors[field] ? "text-danger" : "text-muted"}`}
              >
                {errors[field] ??
                  "https:// 로 시작하는 일반 주소를 입력해 주세요."}
              </p>
            </div>
          ))}
        </form>
      ) : null}
    </section>
  );
}
