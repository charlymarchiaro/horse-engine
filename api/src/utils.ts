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