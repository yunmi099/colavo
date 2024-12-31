import { Timeslot } from '../../domain/entity/timeslot';

export interface TimeslotOutAdapter {
  loadEvents(): Promise<any[]>;
  loadWorkhours(): Promise<any[]>;
  filterSlotsByEvents(slots: Timeslot[]): Timeslot[];
  filterSlotsByWorkhour(
    slots: Timeslot[],
    dayOfWeek: number,
  ): {
    slots: Timeslot[];
    is_day_off: boolean;
  };
}
