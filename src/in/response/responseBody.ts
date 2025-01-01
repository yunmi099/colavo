export type ResponseBody = DayTimetable[];

export interface DayTimetable {
  start_of_day: number; // Unixstamp seconds
  day_modifier: number;
  is_day_off: boolean;
  timeslots: Timeslot[];
}

export interface Timeslot {
  begin_at: number; // Unixstamp seconds
  end_at: number; // Unixstamp seconds
}
