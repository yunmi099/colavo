import { Timeslot } from './timeslot';

export class Workhour {
  constructor(
    private readonly weekday: number,
    private readonly is_day_off: boolean,
    private readonly open_interval: number,
    private readonly close_interval: number,
  ) {}

  /**
   * 해당 요일인지 확인
   * @param dayOfWeek - 비교할 요일
   */
  isForDay(dayOfWeek: number): boolean {
    return this.weekday === dayOfWeek;
  }

  /**
   * 휴무일인지 확인
   */
  isDayOff(): boolean {
    return this.is_day_off;
  }

  /**
   * 타임슬롯이 Workhour의 영업 시간 내에 포함되는지 확인
   * @param timeslot - 비교할 타임슬롯
   */
  isSlotWithin(timeslot: Timeslot): boolean {
    const dayStart = timeslot.getBeginAt() - (timeslot.getBeginAt() % 86400); // 하루 시작 시간
    const openTimestamp = dayStart + this.open_interval;
    const closeTimestamp = dayStart + this.close_interval;

    return (
      timeslot.getBeginAt() >= openTimestamp && // 시작 시간이 영업 시간 시작 이후
      timeslot.getEndAt() <= closeTimestamp // 종료 시간이 영업 시간 종료 이전
    );
  }
  /**
   * JSON 데이터를 기반으로 Workhour 인스턴스 생성
   */
  static fromJson(data: any): Workhour {
    return new Workhour(
      data.weekday,
      data.is_day_off,
      data.open_interval,
      data.close_interval,
    );
  }
}
