import { RequestBodyDto } from '../../domain/dto/request-body.dto';
import { DayTimetableDto } from '../../domain/dto/date-timatable.dto';

export interface TimeslotInAdapter {
  getTimeSlots(requestBody: RequestBodyDto): Promise<DayTimetableDto[]>;
}
