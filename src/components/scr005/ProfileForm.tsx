"use client";

import { useCallback, useEffect, useId, useState, type FormEvent } from "react";
import { focusRingClass, touchTargetClass } from "@/components/ui/FocusRing";
import { DESTINATION_THEMES } from "@/data/destinations.schema";
import { showToast } from "@/hooks/useToast";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { profileUpdateSchema } from "@/lib/validation/profile.schema";

type Profile = {
  nickname: string;
  age_band: string | null;
  gender: string | null;
  travel_styles: string[];
  bio: string | null;
  is_adult: boolean;
  adult_verified_at: string | null;
};

type Load =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; profile: Profile | null };

const AGE_BANDS = [
  { value: "20S", label: "20대" },
  { value: "30S", label: "30대" },
  { value: "40S", label: "40대" },
  { value: "50S", label: "50대" },
  { value: "60_PLUS", label: "60대 이상" },
] as const;

const GENDERS = [
  { value: "", label: "선택 안 함" },
  { value: "FEMALE", label: "여성" },
  { value: "MALE", label: "남성" },
  { value: "OTHER", label: "기타" },
  { value: "UNDISCLOSED", label: "밝히지 않음" },
] as const;

const field = `${touchTargetClass} ${focusRingClass} rounded-sm border border-hairline bg-canvas px-3 text-body-md text-ink`;

/**
 * 프로필 보기와 수정. 닉네임·연령대·여행 스타일은 필수, 성별·자기소개는 선택이다.
 * 성인 확인은 "만 19세 이상" 여부와 확인 시각만 저장하고 정확한 생년월일은 받지 않는다.
 */
export default function ProfileForm({ userId }: { userId: string }) {
  const uid = useId();
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  const [nickname, setNickname] = useState("");
  const [ageBand, setAgeBand] = useState("");
  const [gender, setGender] = useState("");
  const [styles, setStyles] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [adultChecked, setAdultChecked] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const fetchProfile = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("user_profile")
      .select(
        "nickname, age_band, gender, travel_styles, bio, is_adult, adult_verified_at",
      )
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data as Profile | null;
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    fetchProfile()
      .then((profile) => {
        if (cancelled) return;
        if (profile) {
          setNickname(profile.nickname);
          setAgeBand(profile.age_band ?? "");
          setGender(profile.gender ?? "");
          setStyles(profile.travel_styles);
          setBio(profile.bio ?? "");
        }
        setLoad({ status: "ready", profile });
      })
      .catch(() => {
        if (!cancelled) setLoad({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [fetchProfile, attempt]);

  if (load.status === "loading") {
    return (
      <div aria-busy="true" className="flex flex-col gap-3">
        <div className="h-8 w-1/3 rounded-sm bg-surface-soft" />
        <div className="h-40 rounded-md bg-surface-soft" />
      </div>
    );
  }

  if (load.status === "error") {
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-2 rounded-md bg-danger-bg px-4 py-4 text-danger"
      >
        <p className="text-body-md">
          <span aria-hidden="true">⚠ </span>
          프로필을 불러오지 못했어요.
        </p>
        <button
          type="button"
          onClick={() => {
            setLoad({ status: "loading" });
            setAttempt((n) => n + 1);
          }}
          className={`${touchTargetClass} ${focusRingClass} rounded-sm border border-danger px-4 text-button`}
        >
          다시 시도
        </button>
      </div>
    );
  }

  const existing = load.profile;
  const adult = existing?.is_adult ?? false;

  function toggleStyle(style: string) {
    setStyles((current) =>
      current.includes(style)
        ? current.filter((s) => s !== style)
        : [...current, style],
    );
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    const parsed = profileUpdateSchema.safeParse({
      nickname,
      ageBand: ageBand || undefined,
      gender: gender || undefined,
      travelStyles: styles,
      bio: bio.trim() || undefined,
    });
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((i) => i.message));
      return;
    }
    setErrors([]);
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const values = {
        nickname: parsed.data.nickname,
        age_band: parsed.data.ageBand,
        gender: parsed.data.gender ?? null,
        travel_styles: parsed.data.travelStyles,
        bio: parsed.data.bio ?? null,
      };
      const { error } = existing
        ? await supabase
            .from("user_profile")
            .update(values)
            .eq("user_id", userId)
        : await supabase
            .from("user_profile")
            .insert({ user_id: userId, ...values });
      if (error) {
        setErrors([
          error.code === "23505"
            ? "이미 사용 중인 닉네임이에요. 다른 닉네임을 입력해 주세요."
            : "프로필을 저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.",
        ]);
        return;
      }
      showToast("프로필을 저장했어요");
      setLoad({ status: "loading" });
      setAttempt((n) => n + 1);
    } finally {
      setBusy(false);
    }
  }

  async function confirmAdult() {
    setBusy(true);
    setErrors([]);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("user_profile")
        .update({ is_adult: true, adult_verified_at: new Date().toISOString() })
        .eq("user_id", userId);
      if (error) {
        setErrors([
          "성인 확인을 저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.",
        ]);
        return;
      }
      showToast("성인 확인을 마쳤어요");
      setLoad({ status: "loading" });
      setAttempt((n) => n + 1);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <section aria-label="프로필 요약" className="flex flex-col gap-3">
        <h3 className="text-title-md text-ink">내 프로필</h3>
        <p className="text-body-md text-ink">
          {existing?.nickname ?? "아직 프로필이 없어요"}
        </p>
        <p
          className={`w-fit rounded-full px-3 py-1 text-caption ${
            adult ? "bg-success-bg text-success" : "bg-warning-bg text-warning"
          }`}
        >
          <span aria-hidden="true">{adult ? "✓ " : "⚠ "}</span>
          {adult ? "성인 확인 완료" : "성인 확인 필요"}
        </p>
        {adult && existing?.adult_verified_at ? (
          <p className="text-body-sm text-muted">
            확인일{" "}
            {new Date(existing.adult_verified_at).toLocaleDateString("ko-KR")}
          </p>
        ) : null}

        {!adult && existing ? (
          <div className="flex flex-col gap-2 rounded-md bg-surface-soft px-4 py-4">
            <p className="text-body-sm text-body">
              동행 글을 쓰고 참가 요청을 보내려면 만 19세 이상 확인이 필요해요.
              정확한 생년월일은 받지 않고, 확인한 사실과 시각만 저장해요.
            </p>
            <label className="flex items-start gap-2 text-body-sm text-ink">
              <input
                type="checkbox"
                checked={adultChecked}
                onChange={(e) => setAdultChecked(e.target.checked)}
                className={`${focusRingClass} mt-0.5 size-5 accent-coral`}
              />
              만 19세 이상임을 확인합니다.
            </label>
            <button
              type="button"
              disabled={!adultChecked || busy}
              onClick={confirmAdult}
              className={`${touchTargetClass} ${focusRingClass} w-fit rounded-sm bg-coral px-4 text-button text-on-coral hover:bg-coral-hover disabled:opacity-60`}
            >
              성인 확인하기
            </button>
          </div>
        ) : null}
        {!existing ? (
          <p className="text-body-sm text-body">
            오른쪽에서 프로필을 먼저 저장하면 성인 확인을 진행할 수 있어요.
          </p>
        ) : null}
      </section>

      <form
        onSubmit={save}
        noValidate
        aria-label="프로필 수정"
        className="flex flex-col gap-4"
      >
        <h3 className="text-title-md text-ink">
          {existing ? "프로필 수정" : "프로필 만들기"}
        </h3>

        {errors.length > 0 ? (
          <div
            role="alert"
            className="rounded-md bg-danger-bg px-4 py-3 text-body-md text-danger"
          >
            <ul className="list-disc pl-5">
              {errors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor={`${uid}-nick`} className="text-title-sm text-ink">
              닉네임
            </label>
            <input
              id={`${uid}-nick`}
              value={nickname}
              maxLength={30}
              onChange={(e) => setNickname(e.target.value)}
              className={field}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor={`${uid}-age`} className="text-title-sm text-ink">
              연령대
            </label>
            <select
              id={`${uid}-age`}
              value={ageBand}
              onChange={(e) => setAgeBand(e.target.value)}
              className={field}
            >
              <option value="">연령대를 선택하세요</option>
              {AGE_BANDS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor={`${uid}-gender`} className="text-title-sm text-ink">
              성별 (선택)
            </label>
            <select
              id={`${uid}-gender`}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={field}
            >
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-title-sm text-ink">여행 스타일</legend>
          <ul className="flex flex-wrap gap-2">
            {DESTINATION_THEMES.map((theme) => {
              const active = styles.includes(theme);
              return (
                <li key={theme}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleStyle(theme)}
                    className={`${touchTargetClass} ${focusRingClass} rounded-full px-4 text-body-md ${
                      active
                        ? "bg-coral text-on-coral"
                        : "bg-surface-strong text-body hover:text-coral"
                    }`}
                  >
                    {theme}
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>

        <div className="flex flex-col gap-1">
          <label htmlFor={`${uid}-bio`} className="text-title-sm text-ink">
            자기소개 (선택)
          </label>
          <textarea
            id={`${uid}-bio`}
            rows={4}
            maxLength={500}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className={`${field} py-2`}
          />
          <p className="text-body-sm text-muted">
            다른 사용자에게 공개돼요. 연락처는 적지 마세요. ({bio.length}/500)
          </p>
        </div>

        <button
          type="submit"
          disabled={busy}
          className={`${touchTargetClass} ${focusRingClass} w-fit rounded-sm bg-coral px-6 py-3 text-button text-on-coral hover:bg-coral-hover disabled:opacity-60`}
        >
          {busy ? "저장 중..." : "프로필 저장"}
        </button>
      </form>
    </div>
  );
}
