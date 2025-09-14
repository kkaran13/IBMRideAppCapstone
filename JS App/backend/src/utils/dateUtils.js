import dayjs from "dayjs";

export function splitDateRanges(startDate, endDate, chunkDays = 7) {
  let ranges = [];
  let start = dayjs(startDate);
  let end = dayjs(endDate);

  while (start.isBefore(end)) {
    let next = start.add(chunkDays, "day");
    ranges.push({
      start: start.toDate(),
      end: next.isBefore(end) ? next.toDate() : end.toDate(),
    });
    start = next;
  }
  return ranges;
}