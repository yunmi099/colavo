import { Timeslot } from './timeslot';

export class Event {
  constructor(
    private readonly created_at: number,
    private readonly updated_at: number,
    private readonly begin_at: number,
    private readonly end_at: number,
  ) {}

  static fromJson(data: any): Event {
    return new Event(
      data.created_at,
      data.updated_at,
      data.begin_at,
      data.end_at,
    );
  }

  isOverlappingWithTimeslot(timeslot: Timeslot): boolean {
    return timeslot.isOverlappingWith(this.begin_at, this.end_at);
  }
}
