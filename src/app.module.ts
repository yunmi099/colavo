import { Module } from '@nestjs/common';
import { TimeslotService } from './domains/timeslot/domain/services/timeslot.service';
import { FilterTimeslot } from './out/filterTimeslot';
import { TimeslotController } from './in/controllers/timeslot.controller';

@Module({
  controllers: [TimeslotController],
  providers: [
    TimeslotService,
    { provide: 'TimeslotOutAdapter', useClass: FilterTimeslot },
  ],
})
export class AppModule {}
