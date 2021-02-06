/**
 * Add days to the specified date
 * https://stackoverflow.com/a/19691491
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}


export function getDatePart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}


export function getDateDiffMilisec(date1: Date, date2: Date): number {
  return date2.getTime() - date1.getTime();
}


export function getDateDiffDays(date1: Date, date2: Date) {
  const d1 = new Date(getYYYYMMDD(date1));
  const d2 = new Date(getYYYYMMDD(date2));

  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24));
}


export function getYYYYMMDD(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000)
    .toISOString().split('T')[0]
}


/**
 * Get modulo: (value % length). Works for negative values as well.
 * https://web.archive.org/web/20090717035140if_/javascript.about.com/od/problemsolving/a/modulobug.htm
 */
export function repeatValue(value: number, length: number): number {

  return ((value % length) + length) % length;
}

/**
 * https://www.sitepoint.com/delay-sleep-pause-wait/
 */
export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


/**
 * Arrays and lists
 */

export function intRange(i1: number, i2: number, incl: boolean = false): number[] {
  const range: number[] = [];
  for (let i = i1; i < (incl ? i2 + 1 : i2); i++) {
    range.push(i);
  }
  return range;
}


export function repeatArray<T>(length: number, value: T): T[] {
  const values: T[] = [];
  for (let i = 0; i < length; i++) {
    values.push(value);
  }
  return values;
}

/**
 * https://stackoverflow.com/a/9229821/12908217
 */
export function uniq<T>(a: Iterable<T>): T[] {
  return Array.from(new Set<T>(a));
}