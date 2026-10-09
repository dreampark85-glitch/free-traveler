"use client";

import {
  TravelConditionForm,
  todayString,
  type DateErrors,
} from "./FlightForm";

/**
 * 숙소 입력값도 서버, DB, 외부 URL 쿼리, 로그, 분석 이벤트로 보내지 않는다.
 * 국가→지역 종속 선택, 요약, 비전달 고지, 외부 이동 로직은 항공 폼과 같은 공통 폼을 재사용한다.
 */

/**
 * 숙소 날짜 검증: 체크인은 오늘 이후여야 하고, 체크아웃은 체크인보다 늦어야 한다
 * (같은 날 체크인·체크아웃은 허용하지 않는다).
 */
export function validateHotelDates(
  checkIn: string,
  checkOut: string,
  today: string = todayString(),
): DateErrors {
  const errors: DateErrors = {};
  if (!checkIn) errors.start = "체크인 날짜를 입력해 주세요.";
  else if (checkIn < today) errors.start = "체크인은 오늘 이후여야 해요.";
  if (!checkOut) errors.end = "체크아웃 날짜를 입력해 주세요.";
  else if (checkIn && checkOut <= checkIn) {
    errors.end = "체크아웃은 체크인보다 늦어야 해요.";
  }
  return errors;
}

type HotelFormProps = {
  /** 서버가 읽어 검증한 HOTEL_OUTBOUND_URL. 없으면 이동을 막고 오류를 보여준다. */
  outboundUrl: string | null;
};

export default function HotelForm({ outboundUrl }: HotelFormProps) {
  return (
    <TravelConditionForm
      kind="숙소"
      startLabel="체크인"
      endLabel="체크아웃"
      validate={(start, end) => validateHotelDates(start, end)}
      outboundUrl={outboundUrl}
      outboundLabel="숙소 검색 사이트로 이동"
    />
  );
}
