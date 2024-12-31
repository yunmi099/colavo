export const convertToUnixTimestamp = (dateString: string): number => {
  const year = parseInt(dateString.slice(0, 4));
  const month = parseInt(dateString.slice(4, 6)) - 1;
  const day = parseInt(dateString.slice(6, 8));
  return new Date(Date.UTC(year, month, day, 0, 0, 0)).getTime() / 1000;
};

export const addDaysToTimestamp = (timestamp: number, days: number): number => {
  return timestamp + days * 86400;
};
