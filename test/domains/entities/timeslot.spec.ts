import { Timeslot } from '../../../src/domains/timeslot/domain/entity/timeslot';

describe('Timeslot Entity', () => {
  it('should correctly return begin and end times', () => {
    const timeslot = new Timeslot(1620517200, 1620520800);

    expect(timeslot.getBeginAt()).toBe(1620517200);
    expect(timeslot.getEndAt()).toBe(1620520800);
  });

  it('should throw an error for invalid timeslots', () => {
    expect(() => new Timeslot(1620520800, 1620517200)).toThrowError(
      'Invalid timeslot: end_at must be after begin_at',
    );
  });

  it('should correctly identify if within range', () => {
    const timeslot = new Timeslot(1620517200, 1620520800);

    expect(timeslot.isWithinRange(1620510000, 1620530000)).toBe(true);
    expect(timeslot.isWithinRange(1620521000, 1620530000)).toBe(false);
  });

  it('should correctly identify overlapping ranges', () => {
    const timeslot = new Timeslot(1620517200, 1620520800);

    expect(timeslot.isOverlappingWith(1620518000, 1620521000)).toBe(true);
    expect(timeslot.isOverlappingWith(1620521000, 1620522000)).toBe(false);
  });

  it('should generate daily timeslots', () => {
    const dayStart = 1620517200; // 2021-05-09 00:00:00 UTC
    const duration = 3600; // 1 hour
    const interval = 1800; // 30 minutes

    const timeslots = Timeslot.createDailyTimeslots(
      dayStart,
      duration,
      interval,
    );

    expect(timeslots.length).toBeGreaterThan(0);
    expect(timeslots[0].getBeginAt()).toBe(dayStart);
    expect(timeslots[0].getEndAt()).toBe(dayStart + duration);
  });
});
