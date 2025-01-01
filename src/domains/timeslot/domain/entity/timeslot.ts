export class Timeslot {
  constructor(
    private readonly begin_at: number,
    private readonly end_at: number,
  ) {
    if (end_at <= begin_at) {
      throw new Error('Invalid timeslot: end_at must be after begin_at');
    }
  }

  /**
   * 시작 시간 반환
   */
  getBeginAt(): number {
    return this.begin_at;
  }

  /**
   * 종료 시간 반환
   */
  getEndAt(): number {
    return this.end_at;
  }

  /**
   * 주어진 시간 범위 내에 포함되는지 확인
   */
  isWithinRange(start: number, end: number): boolean {
    return this.begin_at >= start && this.end_at <= end;
  }

  /**
   * 주어진 시간 범위와 겹치는지 확인
   * @param start - 비교할 시작 시간
   * @param end - 비교할 종료 시간
   */
  isOverlappingWith(start: number, end: number): boolean {
    return !(this.end_at <= start || this.begin_at >= end);
  }

  /**
   * 하루의 타임슬롯 생성
   */
  static createDailyTimeslots(
    dayStart: number,
    duration: number,
    interval: number,
  ): Timeslot[] {
    const timeslots: Timeslot[] = [];
    const dayEnd = dayStart + 24 * 3600;

    for (let time = dayStart; time + duration <= dayEnd; time += interval) {
      timeslots.push(new Timeslot(time, time + duration));
    }

    return timeslots;
  }
}
