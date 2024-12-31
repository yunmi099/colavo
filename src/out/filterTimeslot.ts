import { TimeslotOutAdapter } from 'src/domains/timeslot/out/adapter/timeslotOutAdapter';
import { Timeslot } from 'src/domains/timeslot/domain/entity/timeslot';
import * as fs from 'fs';
import * as path from 'path';

export class FilterTimeslot implements TimeslotOutAdapter {
  private events: any[] = [];
  private workhours: any[] = [];

  constructor() {
    const eventsFilePath = path.join(process.cwd(), 'src/out/events.json');
    const workhoursFilePath = path.join(
      process.cwd(),
      'src/out/workhours.json',
    );

    try {
      const eventsData = fs.readFileSync(eventsFilePath, 'utf8');
      this.events = JSON.parse(eventsData);
    } catch (err) {
      console.error('Error loading events.json', err);
    }

    try {
      const workhoursData = fs.readFileSync(workhoursFilePath, 'utf8');
      this.workhours = JSON.parse(workhoursData);
    } catch (err) {
      console.error('Error loading workhours.json', err);
    }
  }

  async loadEvents(): Promise<any[]> {
    return this.events;
  }

  async loadWorkhours(): Promise<any[]> {
    return this.workhours;
  }

  filterSlotsByEvents(slots: Timeslot[]): Timeslot[] {
    return slots.filter((slot) => {
      const isOverlapped = this.events.some((event) => {
        return !(
          event.end_at <= slot.begin_at || event.begin_at >= slot.end_at
        );
      });
      return !isOverlapped;
    });
  }

  filterSlotsByWorkhour(
    slots: Timeslot[],
    dayOfWeek: number,
  ): { slots: Timeslot[]; is_day_off: boolean } {
    const workhour = this.workhours.find((wh) => wh.weekday === dayOfWeek);

    if (!workhour) {
      return { slots, is_day_off: false };
    }

    if (workhour.is_day_off) {
      return { slots: [], is_day_off: true };
    }

    const dayStart = slots[0].begin_at - (slots[0].begin_at % 86400);
    const openTimestamp = dayStart + workhour.open_interval;
    const closeTimestamp = dayStart + workhour.close_interval;

    const filteredSlots = slots.filter(
      (slot) => slot.begin_at >= openTimestamp && slot.end_at <= closeTimestamp,
    );

    return { slots: filteredSlots, is_day_off: false };
  }
}
