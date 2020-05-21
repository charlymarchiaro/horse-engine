import { Injectable } from '@angular/core';

import { CommonDialogsService } from '../../services/utils/common-dialogs/common-dialogs.service';

import * as XLSX from 'xlsx';


export interface SheetData {
  name: string;
  data: any[][];
}


export interface ExportArgs {
  moduleLabel: string;
  fileName: string;
  data: SheetData[];
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

      args.data.forEach(sheet => {

        const ws = XLSX.utils.aoa_to_sheet(sheet.data);

        XLSX.utils.book_append_sheet(wb, ws, sheet.name);
      });

      XLSX.writeFile(wb, args.fileName, {
        cellStyles: true
      });

      await this.commonDialogsService.showNotificationDialog(
        'info',
        'Archivo generado',
        args.moduleLabel,
        'El archivo fue generado con éxito: ' + args.fileName
      );

      return { status: 'success' };

    } catch (e) {

      await this.commonDialogsService.showNotificationDialog(
        'error',
        'Error de exportación',
        args.moduleLabel,
        'Se produjo un error al exportar los datos.'
      );

      return {
        status: 'success',
        error: e.message
      };
    }
  }
}
