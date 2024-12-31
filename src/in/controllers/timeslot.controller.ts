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
  /**
   * TimeslotInAdapter에서 정의한 메서드 구현
   */

  @Post()
  async getTimeSlots(@Body() requestBody: RequestBody): Promise<ResponseBody> {
    const timeslots: DayTimetableDto[] =
      await this.timeslotService.generateTimeSlots(
        new TimeslotParameter(requestBody),
      );
    return timeslots;
  }
}
