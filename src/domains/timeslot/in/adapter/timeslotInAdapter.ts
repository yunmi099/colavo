import { DayTimetableDto } from '../../domain/dto/date-timatable.dto';
import { ResponseBody } from 'src/in/response/responseBody';
import { RequestBody } from 'src/in/request/requestBody';

export interface TimeslotInAdapter {
  mapToResponseBody(dto: DayTimetableDto[]): ResponseBody;
  getTimeSlots(requestBody: RequestBody): Promise<ResponseBody>;
}
