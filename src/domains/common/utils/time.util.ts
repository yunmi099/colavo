import { DateTime } from 'luxon';

export const convertToUnixTimestamp = (
  start_day_identifier: string,
  timezone_identifier: string,
): DateTime => {
  // 날짜 형식 검증
  if (!/^\d{8}$/.test(start_day_identifier)) {
    throw new Error('Invalid date format. Expected YYYYMMDD.');
  }

  // "YYYYMMDD" 형식의 문자열을 "YYYY-MM-DD"로 변환
  const formattedDate = `${start_day_identifier.slice(0, 4)}-${start_day_identifier.slice(4, 6)}-${start_day_identifier.slice(6, 8)}`;

  return DateTime.fromISO(formattedDate, {
    zone: timezone_identifier,
  }).startOf('day');
};

export const addDaysToTimestamp = (timestamp: number, days: number): number => {
  return timestamp + days * 86400;
};
