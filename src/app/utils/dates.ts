/**
 * True when `endDate` parses to a valid instant that has already passed.
 * A missing or unparseable date is treated as "not past" (open-ended).
 */
export function isPast(endDate: string | null): boolean {
  if (!endDate) {
    return false;
  }
  const time = Date.parse(endDate);
  return !Number.isNaN(time) && time < Date.now();
}
