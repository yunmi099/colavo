import { RequestBody } from 'src/in/request/requestBody';

export class TimeslotParameter {
  start_day_identifier: string;
  timezone_identifier: string;
  service_duration: number;
  days?: number = 1;
  timeslot_interval?: number = 1800; // Default: 30 minutes
  is_ignore_schedule?: boolean = false;
  is_ignore_workhour?: boolean = false;
  constructor(partial: Partial<RequestBody>) {
    Object.assign(this, partial);
  }
}
