import { Controller, Post, Body } from '@nestjs/common';
import { TimeslotService } from '../../domains/timeslot/domain/services/timeslot.service';
import { RequestBodyDto } from '../../domains/timeslot/domain/dto/request-body.dto';
import { DayTimetable } from 'src/domains/timeslot/domain/dto/date-timatable.dto';
import { TimeslotInAdapter } from 'src/domains/timeslot/in/adapter/timeslotInadapter';

@Controller('getTimeSlots')
export class TimeslotController implements TimeslotInAdapter {
  constructor(private readonly timeslotService: TimeslotService) {}

  /**
   * TimeslotInAdapter에서 정의한 메서드 구현
   */
  @Post()
  async getTimeSlots(
    @Body() requestBody: RequestBodyDto,
  ): Promise<DayTimetable[]> {
    return await this.timeslotService.generateTimeSlots(requestBody);
  }
}
