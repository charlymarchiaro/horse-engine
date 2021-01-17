/**
 * [Angular Material: DatePicker] Set Custom Date in (DD-MM-YYYY) format
 * https://medium.com/@amandeepkochhar/angular-material-datepicker-set-custom-date-in-dd-mm-yyyy-format-5c0f4340e57
 */

import { NativeDateAdapter } from '@angular/material';
import { MatDateFormats } from '@angular/material/core';
import { formatDate } from '@angular/common';
import { Injectable } from "@angular/core";


@Injectable()
export class AppDateAdapter extends NativeDateAdapter {

  format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      return formatDate(date, 'dd-MMM-yyyy', this.locale);
    } else {
      return date.toDateString();
    }
  }
}

export const APP_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: { month: 'short', year: 'numeric', day: 'numeric' },
  },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'numeric' },
    dateA11yLabel: {
      year: 'numeric', month: 'long', day: 'numeric'
    },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  }
};
