import * as XLSX from 'xlsx';

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
  const d1 = new Date(getYyyyMmDd(date1));
  const d2 = new Date(getYyyyMmDd(date2));

  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24));
}


export function getYyyyMmDd(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000)
    .toISOString().split('T')[0];
}


export function getISOStringDatePart(date: Date) {
  return date.toISOString().split('T')[0];
}


export function convertYyyyMmDdToUtc(dateStr: string): Date {
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  const result = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  return result;
}


export function convertDateToUtc(date: Date): Date {
  const result = convertYyyyMmDdToUtc(getISOStringDatePart(date));
  return result;
}


export function convertDateToDdMmYyyy(date: Date, separator: string = '/'): string {
  const dateStr = getISOStringDatePart(date);
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  const result = `${day}${separator}${month}${separator}${year}`;
  return result;
}


export function secondsToHMS(secs: number) {
  const hours = Math.floor(secs / 3600);
  secs %= 3600;
  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);

  const hoursStr = String(hours).padStart(1, '0');
  const minutesStr = String(minutes).padStart(2, '0');
  const secondsStr = String(seconds).padStart(2, '0');
  return hoursStr + ':' + minutesStr + ':' + secondsStr;
}


// Pid Tag
export function generatePidTag(): string {
  return `${new Date().getTime()}-${Math.floor(100000 + Math.random() * 900000)}`;
}


export function clone(object: any): any {
  return JSON.parse(JSON.stringify(object));
}


export function normalizeString(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Filter to get distinct array elements
// Usage: var unique = a.filter(onlyUnique);
// https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates?answertab=votes#tab-top
export function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}


export function arrayEquals(
  a1: (string | number | boolean)[],
  a2: (string | number | boolean)[]
): boolean {
  if (!a1 || !a2) {
    return false;
  }

  if (a1.length !== a2.length) {
    return false;
  }

  for (let i = 0; i < a1.length; i++) {
    if (a1[i] !== a2[i]) {
      return false;
    }
  }
  return true;
}


// Replace multiple strings with multiple other strings
// https://stackoverflow.com/questions/15604140/replace-multiple-strings-with-multiple-other-strings
export function replaceAll(str: string, mapObj: { [value: string]: string }): string {

  if (!mapObj || Object.keys(mapObj).length === 0) {
    return str;
  }

  const re = new RegExp(Object.keys(mapObj).join('|'), 'gi');

  return str.replace(re, function (matched) {
    return mapObj[matched];
  });
}


// XLSX
export function getXLSXCellObject(
  ws: XLSX.WorkSheet,
  rowId: number,
  colId: number
): XLSX.CellObject {
  const cell = XLSX.utils.encode_cell({ c: colId, r: rowId });
  return ws[cell];
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