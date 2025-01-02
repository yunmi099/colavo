import { Inject, Injectable } from '@nestjs/common';
import { TimeslotParameter } from '../dto/timeslot-parameter.dto';
import { DayTimetableDto } from '../dto/date-timatable.dto';
import { TimeslotOutAdapter } from '../../out/adapter/timeslotOutAdapter';
import { Timeslot } from '../entity/timeslot';
import { convertToUnixTimestamp } from 'src/domains/common/utils/time.util';

@Injectable()
export class TimeslotService {
  constructor(
    @Inject('TimeslotOutAdapter')
    private readonly outAdapter: TimeslotOutAdapter,
  ) {}

  async generateTimeSlots(
    requestBody: TimeslotParameter,
  ): Promise<DayTimetableDto[]> {
    const {
      start_day_identifier,
      timezone_identifier,
      service_duration,
      days = 1,
      timeslot_interval = 1800,
      is_ignore_schedule = false,
      is_ignore_workhour = false,
    } = requestBody;

    // 주어진 시간대의 시작 날짜와 시간 생성
    const startDateTime = convertToUnixTimestamp(
      start_day_identifier,
      timezone_identifier,
    );

    const results: DayTimetableDto[] = [];

    for (let i = 0; i < days; i++) {
      const currentDayStart = startDateTime.plus({ days: i });

      // 하루의 시작과 끝을 Unix 타임스탬프(초 단위)로 변환
      const dayStartUnix = currentDayStart.toSeconds();

      // 요일 매핑 (Luxon weekday is 1 = Monday, 7 = Sunday)
      const dayOfWeek = this.getMappedDayOfWeek(currentDayStart.weekday);

      // [1] 기본 타임슬롯 생성
      let allSlots = Timeslot.createDailyTimeslots(
        dayStartUnix,
        service_duration,
        timeslot_interval,
      );

      // [2] 이벤트에 따른 필터링
      if (!is_ignore_schedule) {
        allSlots = this.outAdapter.filterSlotsByEvents(allSlots);
      }

      // [3] 워크아워에 따른 필터링
      let is_day_off = false;
      if (!is_ignore_workhour) {
        const { slots, is_day_off: dayOff } =
          this.outAdapter.filterSlotsByWorkhour(
            allSlots,
            dayOfWeek, // 매핑된 요일을 사용
          );
        allSlots = slots;
        is_day_off = dayOff;
      }

      results.push({
        start_of_day: dayStartUnix,
        day_modifier: i,
        is_day_off,
        timeslots: allSlots,
      });
    }

    return results;
  }

  // 요일을 요구사항에 맞게 매핑
  private getMappedDayOfWeek(weekday: number): number {
    const dayMapping: { [key: number]: number } = {
      7: 1, // Sunday -> 1
      1: 2, // Monday -> 2
      2: 3, // Tuesday -> 3
      3: 4, // Wednesday -> 4
      4: 5, // Thursday -> 5
      5: 6, // Friday -> 6
      6: 7, // Saturday -> 7
    };
    return dayMapping[weekday];
  }
}
