export class Timeslot {
  constructor(
    public begin_at: number,
    public end_at: number,
  ) {
    if (end_at <= begin_at) {
      throw new Error('Invalid timeslot: end_at must be after begin_at');
    }
  }

  /**
   * 정적 메서드: 하루의 타임슬롯을 생성
   * @param dayStart - Unix timestamp (0시 시작)
   * @param duration - 서비스 제공 시간 (초)
   * @param interval - 타임슬롯 간격 (초)
   */
  static createDailyTimeslots(
    dayStart: number,
    duration: number,
    interval: number,
  ): Timeslot[] {
    const timeslots: Timeslot[] = [];
    const dayEnd = dayStart + 24 * 3600; // 하루의 끝 (다음날 0시)

    for (let time = dayStart; time + duration <= dayEnd; time += interval) {
      timeslots.push(new Timeslot(time, time + duration));
    }

    return timeslots;
  }
}
