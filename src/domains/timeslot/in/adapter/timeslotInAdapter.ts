import { TimeslotParameter } from '../../domain/dto/timeslot-parameter.dto';
import { DayTimetableDto } from '../../domain/dto/date-timatable.dto';

export interface TimeslotInAdapter {
  getTimeSlots(requestBody: TimeslotParameter): Promise<DayTimetableDto[]>;
}
