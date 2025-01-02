import { Inject, Injectable } from '@nestjs/common';
import { TimeslotParameter } from '../dto/timeslot-parameter.dto';
import { DayTimetableDto } from '../dto/date-timatable.dto';
import { TimeslotOutAdapter } from '../../out/adapter/timeslotOutAdapter';
import { Timeslot } from '../entity/timeslot';
import { DateTime } from 'luxon';

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

    // 날짜 형식 검증
    if (!/^\d{8}$/.test(start_day_identifier)) {
      throw new Error('Invalid date format. Expected YYYYMMDD.');
    }

    // "YYYYMMDD" 형식의 문자열을 "YYYY-MM-DD"로 변환
    const formattedDate = `${start_day_identifier.slice(0, 4)}-${start_day_identifier.slice(4, 6)}-${start_day_identifier.slice(6, 8)}`;

    // 주어진 시간대의 시작 날짜와 시간 생성
    const startDateTime = DateTime.fromISO(formattedDate, {
      zone: timezone_identifier,
    }).startOf('day');

    const results: DayTimetableDto[] = [];

    for (let i = 0; i < days; i++) {
      const currentDayStart = startDateTime.plus({ days: i });
      const currentDayEnd = currentDayStart.plus({ days: 1 });

      // 하루의 시작과 끝을 Unix 타임스탬프(초 단위)로 변환
      const dayStartUnix = currentDayStart.toSeconds();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const dayEndUnix = currentDayEnd.toSeconds();

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
            currentDayStart.weekday,
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
}
