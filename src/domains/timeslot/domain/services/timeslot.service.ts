import { Inject, Injectable } from '@nestjs/common';
import { RequestBodyDto } from '../dto/request-body.dto';
import { DayTimetable } from '../dto/date-timatable.dto';
import { TimeslotOutAdapter } from '../../out/adapter/timeslotOutAdapter';
import {
  convertToUnixTimestamp,
  addDaysToTimestamp,
} from '../../../common/utils/time.util';
import { Timeslot } from '../entity/timeslot';

@Injectable()
export class TimeslotService {
  constructor(
    @Inject('TimeslotOutAdapter')
    private readonly outAdapter: TimeslotOutAdapter,
  ) {}

  async generateTimeSlots(
    requestBody: RequestBodyDto,
  ): Promise<DayTimetable[]> {
    const {
      start_day_identifier,
      timezone_identifier,
      service_duration,
      days = 1,
      timeslot_interval = 1800,
      is_ignore_schedule = false,
      is_ignore_workhour = false,
    } = requestBody;

    const startDayTimestamp = convertToUnixTimestamp(start_day_identifier);
    const results: DayTimetable[] = [];

    for (let i = 0; i < days; i++) {
      const currentDayTimestamp = addDaysToTimestamp(startDayTimestamp, i);
      const dayOfWeek = this.getDayOfWeek(
        currentDayTimestamp,
        timezone_identifier,
      );

      // [1] 기본 타임슬롯 생성
      let allSlots = Timeslot.createDailyTimeslots(
        currentDayTimestamp,
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
          this.outAdapter.filterSlotsByWorkhour(allSlots, dayOfWeek);
        allSlots = slots;
        is_day_off = dayOff;
      }

      results.push({
        start_of_day: currentDayTimestamp,
        day_modifier: i,
        is_day_off,
        timeslots: allSlots,
      });
    }

    return results;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getDayOfWeek(timestamp: number, timezone: string): number {
    const dateObj = new Date(timestamp * 1000);
    const day = dateObj.getUTCDay();
    return day === 0 ? 1 : day + 1;
  }
}
