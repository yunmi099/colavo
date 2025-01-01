import { Workhour } from '../../../src/domains/timeslot/domain/entity/workhour';
import { Timeslot } from '../../../src/domains/timeslot/domain/entity/timeslot';

describe('Workhour Entity', () => {
  it('should correctly calculate open and close timestamps', () => {
    const workhour = new Workhour(1, false, 36000, 72000); // Open: 10:00, Close: 20:00
    const dayStart = 1620517200; // 2021-05-09 00:00:00 UTC

    // Reflect를 사용하여 private 속성에 접근
    const openInterval = Reflect.get(workhour, 'open_interval');
    const closeInterval = Reflect.get(workhour, 'close_interval');

    const openTimestamp = dayStart + openInterval;
    const closeTimestamp = dayStart + closeInterval;

    expect(openTimestamp).toBe(dayStart + 36000);
    expect(closeTimestamp).toBe(dayStart + 72000);
  });

  it('should correctly identify if a day is a day off', () => {
    const workhour = new Workhour(1, true, 36000, 72000); // Day off
    expect(workhour.isDayOff()).toBe(true);
  });

  it('should correctly identify if it is the workhour for the given day', () => {
    const workhour = new Workhour(1, false, 36000, 72000); // Weekday: Monday
    expect(workhour.isForDay(1)).toBe(true); // Matches Monday
    expect(workhour.isForDay(2)).toBe(false); // Does not match Tuesday
  });

  it('should not include timeslot outside of workhours', () => {
    const workhour = new Workhour(1, false, 36000, 72000); // Open: 10:00, Close: 20:00
    const dayStart = 1620517200; // 2021-05-09 00:00:00 UTC
    const timeslot = new Timeslot(dayStart + 7200, dayStart + 18000); // 02:00 - 05:00 (Outside workhours)

    expect(workhour.isSlotWithin(timeslot)).toBe(false);
  });

  it('should handle edge case where timeslot starts before opening and ends within workhours', () => {
    const workhour = new Workhour(1, false, 36000, 72000); // Open: 10:00, Close: 20:00
    const dayStart = 1620517200; // 2021-05-09 00:00:00 UTC
    const timeslot = new Timeslot(dayStart + 30000, dayStart + 50000); // 08:20 - 13:20

    expect(workhour.isSlotWithin(timeslot)).toBe(false); // Not entirely within workhours
  });

  it('should handle edge case where timeslot ends after closing but starts within workhours', () => {
    const workhour = new Workhour(1, false, 36000, 72000); // Open: 10:00, Close: 20:00
    const dayStart = 1620517200; // 2021-05-09 00:00:00 UTC
    const timeslot = new Timeslot(dayStart + 60000, dayStart + 80000); // 16:40 - 22:13

    expect(workhour.isSlotWithin(timeslot)).toBe(false); // Not entirely within workhours
  });
});
