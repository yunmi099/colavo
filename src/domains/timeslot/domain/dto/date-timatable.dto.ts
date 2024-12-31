// src/application/dto/day-timetable.dto.ts
import { Timeslot } from '../entity/timeslot';

export class DayTimetable {
  constructor(
    public start_of_day: number,
    public day_modifier: number,
    public is_day_off: boolean,
    public timeslots: Timeslot[],
  ) {}
}
