import { Controller, Post, Body } from '@nestjs/common';
import { TimeslotService } from '../../domains/timeslot/domain/services/timeslot.service';
import { TimeslotParameter } from '../../domains/timeslot/domain/dto/timeslot-parameter.dto';
import { DayTimetableDto } from 'src/domains/timeslot/domain/dto/date-timatable.dto';
import { TimeslotInAdapter } from 'src/domains/timeslot/in/adapter/timeslotInadapter';
import { RequestBody } from '../request/requestBody';
import { ResponseBody } from '../response/responseBody';

@Controller('getTimeSlots')
export class TimeslotController implements TimeslotInAdapter {
  constructor(private readonly timeslotService: TimeslotService) {}
  mapToResponseBody(dto: DayTimetableDto[]): ResponseBody {
    return dto.map((timeTable) => ({
      start_of_day: timeTable.start_of_day,
      day_modifier: timeTable.day_modifier,
      is_day_off: timeTable.is_day_off,
      timeslots: timeTable.timeslots.map((slot) => ({
        begin_at: slot.getBeginAt(),
        end_at: slot.getEndAt(),
      })),
    }));
  }
  /**
   * TimeslotInAdapter에서 정의한 메서드 구현
   */
  @Post()
  async getTimeSlots(@Body() requestBody: RequestBody): Promise<ResponseBody> {
    const dayTimetableDtos = await this.timeslotService.generateTimeSlots(
      new TimeslotParameter(requestBody),
    );

    return this.mapToResponseBody(dayTimetableDtos);
  }
}
