import { FilterTimeslot } from 'src/out/filterTimeslot';
import { Timeslot } from 'src/domains/timeslot/domain/entity/timeslot';
import { Workhour } from 'src/domains/timeslot/domain/entity/workhour';
import { Event } from 'src/domains/timeslot/domain/entity/event';

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));

describe('FilterTimeslot', () => {
  let filterTimeslot: FilterTimeslot;

  const mockEventsJson = JSON.stringify([
    { created_at: 1, updated_at: 2, begin_at: 1620520200, end_at: 1620523800 },
  ]);
  const mockWorkhoursJson = JSON.stringify([
    {
      weekday: 1,
      is_day_off: false,
      open_interval: 36000, // 10:00
      close_interval: 72000, // 20:00
    },
  ]);

  beforeEach(() => {
    // Mock fs module
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    fs.readFileSync.mockImplementation((filePath: string) => {
      if (filePath.includes('events.json')) return mockEventsJson;
      if (filePath.includes('workhours.json')) return mockWorkhoursJson;
      throw new Error('File not found');
    });

    filterTimeslot = new FilterTimeslot();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loadEvents', () => {
    it('should load events from the JSON file', async () => {
      const events = await filterTimeslot.loadEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(Event);
      expect(events[0].isOverlappingWithTimeslot).toBeDefined();
    });
  });

  describe('loadWorkhours', () => {
    it('should load workhours from the JSON file', async () => {
      const workhours = await filterTimeslot.loadWorkhours();
      expect(workhours).toHaveLength(1);
      expect(workhours[0]).toBeInstanceOf(Workhour);
      expect(workhours[0].isSlotWithin).toBeDefined();
    });
  });

  describe('filterSlotsByEvents', () => {
    it('should filter out timeslots that overlap with events', () => {
      const timeslots = [
        new Timeslot(1620520200, 1620523800), // Overlaps with event
        new Timeslot(1620525000, 1620528600), // Does not overlap
      ];

      const filteredSlots = filterTimeslot.filterSlotsByEvents(timeslots);

      expect(filteredSlots).toHaveLength(1);
      expect(filteredSlots[0].getBeginAt()).toBe(1620525000);
      expect(filteredSlots[0].getEndAt()).toBe(1620528600);
    });
  });

  describe('filterSlotsByWorkhour', () => {
    it('should return no timeslots if the day is a day off', () => {
      // Mock workhour as a day off
      filterTimeslot['workhours'] = [
        new Workhour(1, true, 36000, 72000), // Monday, day off
      ];

      const timeslots = [
        new Timeslot(1620520200, 1620523800),
        new Timeslot(1620525000, 1620528600),
      ];

      const { slots, is_day_off } = filterTimeslot.filterSlotsByWorkhour(
        timeslots,
        1, // Monday
      );

      expect(is_day_off).toBe(true);
      expect(slots).toHaveLength(0);
    });

    it('should filter out timeslots outside of workhours', () => {
      const dayStart = 1620518400; // 하루 시작 시간 00:00

      const timeslots = [
        new Timeslot(dayStart + 36000, dayStart + 72000), // 10:00 ~ 20:00 (영업 시간 내)
        new Timeslot(dayStart + 35000, dayStart + 40000), // 09:43 ~ 10:06 (영업 시간 밖)
      ];

      const { slots, is_day_off } = filterTimeslot.filterSlotsByWorkhour(
        timeslots,
        1, // Monday
      );

      expect(is_day_off).toBe(false);
      expect(slots).toHaveLength(1);
      expect(slots[0].getBeginAt()).toBe(dayStart + 36000); // 10:00
      expect(slots[0].getEndAt()).toBe(dayStart + 72000); // 20:00
    });
  });
});
