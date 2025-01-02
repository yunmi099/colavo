import { DateTime } from 'luxon';

export const convertToUnixTimestamp = (dateString: string): number => {
  // 날짜 형식 검증
  if (!/^\d{8}$/.test(dateString)) {
    throw new Error('Invalid date format. Expected YYYYMMDD.');
  }

  // "YYYYMMDD" 형식의 문자열을 파싱하여 KST 시간대로 설정
  const date = DateTime.fromFormat(dateString, 'yyyyMMdd', {
    zone: 'Asia/Seoul',
  });

  // 유효한 날짜인지 확인
  if (!date.isValid) {
    throw new Error('Invalid date.');
  }

  // Unix 타임스탬프 반환 (초 단위)
  const unixTimestamp = date.toSeconds();
  return unixTimestamp;
};

export const addDaysToTimestamp = (timestamp: number, days: number): number => {
  return timestamp + days * 86400;
};
