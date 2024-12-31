import { RequestBodyDto } from '../../domain/dto/request-body.dto';
import { DayTimetable } from '../../domain/dto/date-timatable.dto';

export interface TimeslotInAdapter {
  getTimeSlots(requestBody: RequestBodyDto): Promise<DayTimetable[]>;
}
