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
  const d1 = new Date(getYYYYMMDD(date1));
  const d2 = new Date(getYYYYMMDD(date2));

  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24));
}


export function getYYYYMMDD(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000)
    .toISOString().split('T')[0];
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
