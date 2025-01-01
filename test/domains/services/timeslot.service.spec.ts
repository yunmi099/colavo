import { Test, TestingModule } from '@nestjs/testing';
import { TimeslotService } from '../../../src/domains/timeslot/domain/services/timeslot.service';
import { TimeslotOutAdapter } from '../../../src/domains/timeslot/out/adapter/timeslotOutAdapter';
import { TimeslotParameter } from '../../../src/domains/timeslot/domain/dto/timeslot-parameter.dto';
import { Timeslot } from '../../../src/domains/timeslot/domain/entity/timeslot';
import { convertToUnixTimestamp } from 'src/domains/common/utils/time.util';

describe('TimeslotService', () => {
  let service: TimeslotService;
  let outAdapterMock: jest.Mocked<TimeslotOutAdapter>;

  beforeEach(async () => {
    outAdapterMock = {
      filterSlotsByEvents: jest.fn(),
      filterSlotsByWorkhour: jest.fn(),
      loadEvents: jest.fn(),
      loadWorkhours: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeslotService,
        {
          provide: 'TimeslotOutAdapter',
          useValue: outAdapterMock,
        },
      ],
    }).compile();

    service = module.get<TimeslotService>(TimeslotService);
  });

  describe.each([
    {
      date: '20210509',
      dayOfWeek: 0,
      expectedTimeslots: [
        { begin_at: 1620518400, end_at: 1620522000 },
        { begin_at: 1620520200, end_at: 1620523800 },
      ],
      is_day_off: false,
    },
    {
      date: '20210510',
      dayOfWeek: 1,
      expectedTimeslots: [
        { begin_at: 1620604800, end_at: 1620608400 },
        { begin_at: 1620606600, end_at: 1620610200 },
      ],
      is_day_off: false,
    },
    {
      date: '20210511',
      dayOfWeek: 2,
      expectedTimeslots: [],
      is_day_off: true,
    },
  ])(
    'TimeslotService - $date',
    ({ date, dayOfWeek, expectedTimeslots, is_day_off }) => {
      it(`should return correct timeslots for ${date}`, async () => {
        const parameter = new TimeslotParameter({
          start_day_identifier: date,
          timezone_identifier: 'Asia/Seoul',
          service_duration: 3600,
          days: 1,
          timeslot_interval: 1800,
          is_ignore_schedule: false,
          is_ignore_workhour: false,
        });

        const mockTimeslots = expectedTimeslots.map(
          (slot) => new Timeslot(slot.begin_at, slot.end_at),
        );

        outAdapterMock.filterSlotsByEvents.mockImplementation((slots) => slots);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        outAdapterMock.filterSlotsByWorkhour.mockImplementation((slots) => {
          if (dayOfWeek === 0 || dayOfWeek === 1) {
            return { slots: mockTimeslots, is_day_off: false };
          }
          return { slots: [], is_day_off: true };
        });

        const expectedStartOfDay = convertToUnixTimestamp(`${date}`);

        const result = await service.generateTimeSlots(parameter);

        expect(result).toEqual([
          {
            start_of_day: expectedStartOfDay,
            day_modifier: 0,
            is_day_off,
            timeslots: expectedTimeslots,
          },
        ]);
      });
    },
  );

  it('should generate timeslots with is_ignore_schedule = true', async () => {
    const parameter = new TimeslotParameter({
      start_day_identifier: '20210509',
      timezone_identifier: 'Asia/Seoul',
      service_duration: 3600,
      days: 1,
      timeslot_interval: 1800,
      is_ignore_schedule: true,
      is_ignore_workhour: false,
    });

    const mockTimeslots = [
      new Timeslot(1620518400, 1620522000),
      new Timeslot(1620520200, 1620523800),
    ];

    // Mock 반환값 정의
    outAdapterMock.filterSlotsByWorkhour.mockReturnValue({
      slots: mockTimeslots,
      is_day_off: false,
    });

    const result = await service.generateTimeSlots(parameter);

    // 결과 비교
    expect(result).toEqual([
      {
        start_of_day: 1620518400,
        day_modifier: 0,
        is_day_off: false,
        timeslots: [
          { begin_at: 1620518400, end_at: 1620522000 },
          { begin_at: 1620520200, end_at: 1620523800 },
        ],
      },
    ]);

    // 호출 검증
    expect(outAdapterMock.filterSlotsByEvents).not.toHaveBeenCalled();
    expect(outAdapterMock.filterSlotsByWorkhour).toHaveBeenCalledWith(
      expect.any(Array),
      expect.any(Number), // dayOfWeek
    );
  });

  it('should generate timeslots with is_ignore_workhour = true', async () => {
    const parameter = new TimeslotParameter({
      start_day_identifier: '20210509',
      timezone_identifier: 'Asia/Seoul',
      service_duration: 3600,
      days: 1,
      timeslot_interval: 1800,
      is_ignore_schedule: false,
      is_ignore_workhour: true,
    });

    const mockTimeslots = [
      new Timeslot(1620518400, 1620522000),
      new Timeslot(1620520200, 1620523800),
    ];

    outAdapterMock.filterSlotsByEvents.mockReturnValue(mockTimeslots);

    const result = await service.generateTimeSlots(parameter);

    expect(result).toEqual([
      {
        start_of_day: 1620518400,
        day_modifier: 0,
        is_day_off: false,
        timeslots: [
          { begin_at: 1620518400, end_at: 1620522000 },
          { begin_at: 1620520200, end_at: 1620523800 },
        ],
      },
    ]);

    expect(outAdapterMock.filterSlotsByEvents).toHaveBeenCalledWith(
      expect.any(Array),
    );
    expect(outAdapterMock.filterSlotsByWorkhour).not.toHaveBeenCalled();
  });

  it('should handle multiple days', async () => {
    const parameter = new TimeslotParameter({
      start_day_identifier: '20210509',
      timezone_identifier: 'Asia/Seoul',
      service_duration: 3600,
      days: 2,
      timeslot_interval: 1800,
      is_ignore_schedule: false,
      is_ignore_workhour: false,
    });

    const mockTimeslotsDay1 = [
      new Timeslot(1620518400, 1620522000),
      new Timeslot(1620520200, 1620523800),
    ];

    const mockTimeslotsDay2 = [
      new Timeslot(1620604800, 1620608400),
      new Timeslot(1620606600, 1620610200),
    ];

    outAdapterMock.filterSlotsByEvents.mockImplementation((slots) => slots);
    outAdapterMock.filterSlotsByWorkhour.mockImplementation(
      (slots, dayOfWeek) => {
        if (dayOfWeek === 1) {
          return { slots: mockTimeslotsDay1, is_day_off: false };
        }
        if (dayOfWeek === 2) {
          return { slots: mockTimeslotsDay2, is_day_off: false };
        }
        return { slots: [], is_day_off: true };
      },
    );

    const result = await service.generateTimeSlots(parameter);

    expect(result).toEqual([
      {
        start_of_day: 1620518400,
        day_modifier: 0,
        is_day_off: false,
        timeslots: [
          { begin_at: 1620518400, end_at: 1620522000 },
          { begin_at: 1620520200, end_at: 1620523800 },
        ],
      },
      {
        start_of_day: 1620604800,
        day_modifier: 1,
        is_day_off: false,
        timeslots: [
          { begin_at: 1620604800, end_at: 1620608400 },
          { begin_at: 1620606600, end_at: 1620610200 },
        ],
      },
    ]);
  });
});
