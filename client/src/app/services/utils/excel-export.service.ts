import { Injectable } from '@angular/core';

import { CommonDialogsService } from '../../services/utils/common-dialogs/common-dialogs.service';

import * as XLSX from 'xlsx';
import { getXLSXCellObject } from '../../services/utils/utils';


export interface SheetData {
  name: string;
  headerData: { [key: string]: any };
  colsConfig: ColConfig[];
  bodyData: any[][];
  settings: {
    enableFilter: boolean;
  };
}


export interface ColConfig {
  colInfo: XLSX.ColInfo;
  textWrap?: boolean;
  hyperlink?: boolean;
}

export interface ExportArgs {
  moduleLabel: string;
  fileName: string;
  sheets: SheetData[];
}


export interface ExportResult {
  status: 'success' | 'error';
  error?: string;
}


@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {


  constructor(
    private commonDialogsService: CommonDialogsService,
  ) { }


  public async export(args: ExportArgs): Promise<ExportResult> {

    try {

      const wb = XLSX.utils.book_new();

      for (const sheet of args.sheets) {

        let sheetData: any[][] = [];

        // Empty line
        sheetData.push([]);

        Object.keys(sheet.headerData).forEach(key => {
          sheetData.push(
            [key, sheet.headerData[key]]
          );
        });

        // Empty line
        sheetData.push([]);

        sheetData = [...sheetData, ...sheet.bodyData];


        const ws = XLSX.utils.aoa_to_sheet(sheetData);

        // Add cols info
        ws['!cols'] = sheet.colsConfig.map(i => i.colInfo);

        // Add autofilter
        if (sheet.settings.enableFilter) {
          const autofilterRow = Object.keys(sheet.headerData).length + 3;
          const autofilterEndCol = sheet.bodyData.length > 0
            ? XLSX.utils.encode_col(sheet.bodyData[0].length - 1)
            : 'A';

          const ref = `A${autofilterRow}:${autofilterEndCol}${autofilterRow}`;
          ws['!autofilter'] = { ref };
        }

        XLSX.utils.book_append_sheet(wb, ws, sheet.name);
      }


      XLSX.writeFile(wb, args.fileName, {
        cellStyles: true
      });

      await this.commonDialogsService.showNotificationDialog(
        'info',
        'Data exported',
        args.moduleLabel,
        'The data was exported successfully to file: ' + args.fileName
      );

      return { status: 'success' };

    } catch (e) {

      await this.commonDialogsService.showNotificationDialog(
        'error',
        'Exporting error',
        args.moduleLabel,
        'Encountered an error while exporting the data.'
      );

      return {
        status: 'success',
        error: e.message
      };
    }
  }
}
