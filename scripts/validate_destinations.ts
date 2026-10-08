/**
 * 여행지 정적 데이터 검증 (REQ-FUNC-008, REQ-NF-026, REQ-NF-029).
 * 실행: node scripts/validate_destinations.ts
 */
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

type Loose = Record<string, unknown>;

async function load(rel: string): Promise<Loose> {
  return (await import(pathToFileURL(resolve(rel)).href)) as Loose;
}

const errors: string[] = [];
const fail = (id: string, msg: string) => errors.push(`[${id}] ${msg}`);

const schema = await load("src/data/destinations.schema.ts");
const data = await load("src/data/destinations.ts");
const list = data.destinations as Loose[];
const themes = schema.DESTINATION_THEMES as string[];
const num = (k: string) => schema[k] as number;

const isStr = (v: unknown): v is string =>
  typeof v === "string" && v.trim() !== "";
const isDate = (v: unknown) => isStr(v) && /^\d{4}-\d{2}-\d{2}$/.test(v);

const seen = new Set<string>();
for (const d of list) {
  const id = String(d.id);
  if (!isStr(d.id)) fail(id, "id 누락");
  if (seen.has(id)) fail(id, "id 중복");
  seen.add(id);

  if (d.scope !== "DOMESTIC" && d.scope !== "OVERSEAS") fail(id, "scope 오류");
  if (!isStr(d.countryCode) || !/^[A-Z]{2}$/.test(String(d.countryCode)))
    fail(id, "countryCode는 대문자 2자리여야 함");
  if (d.scope === "DOMESTIC" && d.countryCode !== "KR")
    fail(id, "국내 항목의 countryCode는 KR");
  if (d.scope === "OVERSEAS" && d.countryCode === "KR")
    fail(id, "해외 항목의 countryCode는 KR 불가");
  for (const k of ["country", "name", "summary", "transport", "sourceName"])
    if (!isStr(d[k])) fail(id, `${k} 누락`);
  if (!isStr(d.sourceUrl) || !/^https:\/\//.test(String(d.sourceUrl)))
    fail(id, "sourceUrl은 https URL이어야 함");
  if (!isDate(d.updatedAt)) fail(id, "updatedAt 형식 오류(YYYY-MM-DD)");
  if (d.reviewStatus !== "DRAFT" && d.reviewStatus !== "REVIEWED")
    fail(id, "reviewStatus 오류");

  const t = d.themes as string[];
  if (!Array.isArray(t) || t.length === 0 || t.some((x) => !themes.includes(x)))
    fail(id, "themes 오류");
  const seasons = d.bestSeasons as unknown[];
  if (!Array.isArray(seasons) || seasons.length === 0)
    fail(id, "bestSeasons 누락");
  const at = d.attractions as Loose[];
  if (
    !Array.isArray(at) ||
    at.length < num("MIN_ATTRACTIONS") ||
    at.some((a) => !isStr(a.name))
  )
    fail(id, `명소는 ${num("MIN_ATTRACTIONS")}개 이상`);
  const fd = d.foods as Loose[];
  if (
    !Array.isArray(fd) ||
    fd.length < num("MIN_FOODS") ||
    fd.some((f) => !isStr(f.name))
  )
    fail(id, `음식은 ${num("MIN_FOODS")}개 이상`);
  const et = d.etiquette as unknown[];
  if (!Array.isArray(et) || et.length === 0 || !et.every(isStr))
    fail(id, "etiquette 누락");

  const b = d.budgetPerDayKRW as { min?: number; max?: number } | undefined;
  if (!b || !(b.min! > 0) || !(b.max! >= b.min!))
    fail(id, "budgetPerDayKRW 오류");

  const it = d.itinerary as
    { oneDay?: string[]; threeDay?: string[][] } | undefined;
  if (!it?.oneDay?.length) fail(id, "1일 일정 누락");
  if (
    !it?.threeDay ||
    it.threeDay.length !== 3 ||
    it.threeDay.some((day) => !day.length)
  )
    fail(id, "3일 일정은 일차별로 모두 있어야 함");
  const names = new Set(at?.map((a) => a.name));
  for (const n of [...(it?.oneDay ?? []), ...(it?.threeDay?.flat() ?? [])])
    if (!names.has(n)) fail(id, `일정의 장소 "${n}"가 명소 목록에 없음`);

  if (d.image !== undefined) {
    const img = d.image as Loose;
    for (const k of ["src", "alt", "sourceUrl", "author", "licenseType"])
      if (!isStr(img[k])) fail(id, `image.${k} 누락`);
  }
}

const domestic = list.filter((d) => d.scope === "DOMESTIC");
const overseas = list.filter((d) => d.scope === "OVERSEAS");
const countries = new Set(overseas.map((d) => d.countryCode));
if (domestic.length < num("MIN_DOMESTIC"))
  errors.push(`국내 ${domestic.length}곳 < ${num("MIN_DOMESTIC")}`);
if (countries.size < num("MIN_OVERSEAS_COUNTRIES"))
  errors.push(`해외 ${countries.size}개국 < ${num("MIN_OVERSEAS_COUNTRIES")}`);
if (overseas.length < num("MIN_OVERSEAS_CITIES"))
  errors.push(`해외 ${overseas.length}개 도시 < ${num("MIN_OVERSEAS_CITIES")}`);

if (errors.length > 0) {
  console.error(`DESTINATIONS_FAIL — 오류 ${errors.length}건`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(
  `DESTINATIONS_PASS — 국내 ${domestic.length}곳, 해외 ${countries.size}개국 ${overseas.length}개 도시`,
);
