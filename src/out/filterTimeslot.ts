import { TimeslotOutAdapter } from 'src/domains/timeslot/out/adapter/timeslotOutAdapter';
import { Timeslot } from 'src/domains/timeslot/domain/entity/timeslot';
import { Workhour } from 'src/domains/timeslot/domain/entity/workhour';
import { Event } from 'src/domains/timeslot/domain/entity/event';
import * as fs from 'fs';
import * as path from 'path';

export class FilterTimeslot implements TimeslotOutAdapter {
  private events: Event[] = [];
  private workhours: Workhour[] = [];

  constructor() {
    const eventsFilePath = path.join(process.cwd(), 'src/out/events.json');
    const workhoursFilePath = path.join(
      process.cwd(),
      'src/out/workhours.json',
    );

    this.events = this.loadEventsFromFile(eventsFilePath);
    this.workhours = this.loadWorkhoursFromFile(workhoursFilePath);
  }

  private loadEventsFromFile(filePath: string): Event[] {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      return parsed
        .filter((event: any) => event.begin_at < event.end_at) // 유효성 검사
        .map((event: any) => Event.fromJson(event));
    } catch (err) {
      console.error(`Error loading events from ${filePath}`, err);
      return [];
    }
  }

  private loadWorkhoursFromFile(filePath: string): Workhour[] {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      return parsed
        .filter(
          (wh: any) =>
            wh.open_interval < wh.close_interval &&
            wh.weekday >= 1 &&
            wh.weekday <= 7,
        ) // 유효성 검사
        .map((wh: any) => Workhour.fromJson(wh));
    } catch (err) {
      console.error(`Error loading workhours from ${filePath}`, err);
      return [];
    }
  }

  async loadEvents(): Promise<Event[]> {
    return this.events;
  }

  async loadWorkhours(): Promise<Workhour[]> {
    return this.workhours;
  }

  filterSlotsByEvents(slots: Timeslot[]): Timeslot[] {
    return slots.filter((slot) => {
      const isOverlapped = this.events.some((event) =>
        event.isOverlappingWithTimeslot(slot),
      );
      return !isOverlapped;
    });
  }
  filterSlotsByWorkhour(
    slots: Timeslot[],
    dayOfWeek: number,
  ): { slots: Timeslot[]; is_day_off: boolean } {
    const workhour = this.workhours.find((wh) => wh.isForDay(dayOfWeek));

    console.log('Found Workhour:', workhour);

    if (!workhour) {
      return { slots, is_day_off: false };
    }

    if (workhour.isDayOff()) {
      return { slots: [], is_day_off: true };
    }

    const filteredSlots = slots.filter((slot) => {
      const within = workhour.isSlotWithin(slot);
      return within;
    });

    return { slots: filteredSlots, is_day_off: false };
  }
}
