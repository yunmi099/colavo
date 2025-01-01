import { Timeslot } from '../../../src/domains/timeslot/domain/entity/timeslot';
import { Event } from '../../../src/domains/timeslot/domain/entity/event';

describe('Event Entity', () => {
  it('should correctly identify overlapping timeslots', () => {
    const event = new Event(1620510000, 1620513600, 1620517200, 1620520800);
    const timeslot = new Timeslot(1620518000, 1620519000);

    expect(event.isOverlappingWithTimeslot(timeslot)).toBe(true);
  });

  it('should correctly identify non-overlapping timeslots', () => {
    const event = new Event(1620510000, 1620513600, 1620517200, 1620520800);
    const timeslot = new Timeslot(1620521000, 1620522000);

    expect(event.isOverlappingWithTimeslot(timeslot)).toBe(false);
  });

  it('should create an Event from JSON', () => {
    const jsonData = {
      created_at: 1620510000,
      updated_at: 1620513600,
      begin_at: 1620517200,
      end_at: 1620520800,
    };

    const event = Event.fromJson(jsonData);

    expect(event).toBeInstanceOf(Event);
    expect(
      event.isOverlappingWithTimeslot(new Timeslot(1620518000, 1620519000)),
    ).toBe(true);
  });
});
