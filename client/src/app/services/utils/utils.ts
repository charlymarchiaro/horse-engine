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



// XLSX
export function getXLSXCellObject(
  ws: XLSX.WorkSheet,
  rowId: number,
  colId: number
): XLSX.CellObject {
  const cell = XLSX.utils.encode_cell({ c: colId, r: rowId });
  return ws[cell];
}
