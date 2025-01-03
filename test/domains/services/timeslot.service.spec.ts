import { Test, TestingModule } from '@nestjs/testing';
import { TimeslotService } from '../../../src/domains/timeslot/domain/services/timeslot.service';
import { TimeslotOutAdapter } from '../../../src/domains/timeslot/out/adapter/timeslotOutAdapter';
import { TimeslotParameter } from '../../../src/domains/timeslot/domain/dto/timeslot-parameter.dto';
import { Timeslot } from '../../../src/domains/timeslot/domain/entity/timeslot';
import { getDayInTimezone } from 'src/domains/common/utils/time.util';
import { DateTime } from 'luxon';

jest.mock('src/domains/common/utils/time.util');

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

  beforeEach(() => {
    (getDayInTimezone as jest.Mock).mockImplementation(
      (start_day_identifier, timezone_identifier) => {
        const mockDateMapping: Record<string, DateTime> = {
          '20210509': DateTime.fromSeconds(1620518400, {
            zone: timezone_identifier,
          }),
          '20210510': DateTime.fromSeconds(1620604800, {
            zone: timezone_identifier,
          }),
          '20210511': DateTime.fromSeconds(1620691200, {
            zone: timezone_identifier,
          }),
        };
        return mockDateMapping[start_day_identifier];
      },
    );
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
        console.log('Mock filterSlotsByWorkhour called with:', {
          dayOfWeek,
          slots,
        });

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

    expect(result).toHaveLength(2);
    expect(result[0].timeslots).toEqual(mockTimeslotsDay1);
    expect(result[1].timeslots).toEqual(mockTimeslotsDay2);
  });
});
