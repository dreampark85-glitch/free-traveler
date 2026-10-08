/**
 * 해외 15개국 안전정보 커버리지 검증 (REQ-FUNC-046/047/048/052, REQ-NF-027).
 * 여행지 데이터의 해외 국가 코드와 안전정보 국가 코드를 비교해 diff 0을 확인한다.
 * 실행: node scripts/validate_safety_coverage.ts
 */
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

type Loose = Record<string, unknown>;
const load = async (rel: string): Promise<Loose> =>
  (await import(pathToFileURL(resolve(rel)).href)) as Loose;

const errors: string[] = [];
const isStr = (v: unknown): v is string =>
  typeof v === "string" && v.trim() !== "";

const dest = (await load("src/data/destinations.ts")).destinations as Loose[];
const safetyMod = await load("src/data/country-safety.ts");
const list = safetyMod.countrySafety as Loose[];
const sectionKeys = (safetyMod.SAFETY_CATEGORIES as string[]).filter(
  (k) => k !== "emergency",
);

const overseas = new Set(
  dest.filter((d) => d.scope === "OVERSEAS").map((d) => String(d.countryCode)),
);
const covered = new Set(list.map((c) => String(c.countryCode)));
for (const code of overseas)
  if (!covered.has(code)) errors.push(`안전정보 누락 국가: ${code}`);
for (const code of covered)
  if (!overseas.has(code)) errors.push(`여행지에 없는 안전정보 국가: ${code}`);
if (covered.size !== list.length) errors.push("안전정보 국가 코드 중복");
if (covered.size < 15) errors.push(`안전정보 ${covered.size}개국 < 15`);

for (const c of list) {
  const id = String(c.countryCode);
  const fail = (m: string) => errors.push(`[${id}] ${m}`);
  const sections = c.sections as Record<string, unknown> | undefined;
  for (const k of sectionKeys)
    if (!isStr(sections?.[k])) fail(`${k} 본문 누락`);
  const contacts = c.emergencyContacts as Loose[] | undefined;
  if (
    !contacts?.length ||
    contacts.some((e) => !isStr(e.label) || !isStr(e.phone))
  )
    fail("긴급연락처 누락");
  if (!contacts?.some((e) => String(e.phone).includes("3210-0404")))
    fail("영사콜센터 연락처 누락");
  for (const k of ["sourceName", "editor", "advisoryLevel"])
    if (!isStr(c[k])) fail(`${k} 누락`);
  if (!isStr(c.sourceUrl) || !/^https:\/\//.test(String(c.sourceUrl)))
    fail("공식 출처 sourceUrl(https) 없이 게시할 수 없음");
  const v = c.verifiedAt;
  if (v !== null && !(isStr(v) && /^\d{4}-\d{2}-\d{2}$/.test(v)))
    fail("verifiedAt은 YYYY-MM-DD 또는 null");
  const scope = c.scope as
    { scopeType?: string; scopeText?: string } | undefined;
  if (scope?.scopeType !== "COUNTRY" && scope?.scopeType !== "REGION")
    fail("scopeType 오류");
  if (scope?.scopeType === "REGION" && !isStr(scope.scopeText))
    fail("REGION은 scopeText 필수");
}

if (errors.length > 0) {
  console.error(`SAFETY_COVERAGE_FAIL — 오류 ${errors.length}건`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
const unverified = list.filter((c) => c.verifiedAt === null).length;
console.log(
  `SAFETY_COVERAGE_PASS — 해외 ${overseas.size}개국 diff 0 (출처 대조 전 ${unverified}개국)`,
);
