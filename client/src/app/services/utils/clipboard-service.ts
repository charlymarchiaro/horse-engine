// Import the core angular services.
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';


const MAX_LABEL_LENGTH = 30;


@Injectable({
  providedIn: 'root'
})
export class ClipboardService {

  private dom: Document;


  // I initialize the Clipboard service.
  // --
  // CAUTION: This service is tightly couped to the browser DOM (Document Object Model).
  // But, by injecting the "document" reference rather than trying to reference it
  // globally, we can at least pretend that we are trying to lower the tight coupling.
  constructor(
    @Inject(DOCUMENT) dom: Document,
    private snackBar: MatSnackBar,
  ) {
    this.dom = dom;
  }

  // ---
  // PUBLIC METHODS.
  // ---

  // I copy the given value to the user's system clipboard. Returns a promise that
  // resolves to the given value on success or rejects with the raised Error.
  public copy(value: string, label?: string): Promise<string> {

    const promise = new Promise<string>(
      (resolve, reject): void => {

        let textarea = null;

        try {

          // In order to execute the "Copy" command, we actually have to have
          // a "selection" in the currently rendered document. As such, we're
          // going to inject a Textarea element and .select() it in order to
          // force a selection.
          // --
          // NOTE: This Textarea is being rendered off-screen.
          textarea = this.dom.createElement('textarea');
          textarea.style.height = '0px';
          textarea.style.left = '-100px';
          textarea.style.opacity = '0';
          textarea.style.position = 'fixed';
          textarea.style.top = '-100px';
          textarea.style.width = '0px';

          this.dom.body.appendChild(textarea);

          // Set and select the value (creating an active Selection range).
          textarea.value = value;
          textarea.select();

          // Ask the browser to copy the current selection to the clipboard.
          this.dom.execCommand('copy');

          resolve(value);

        } finally {

          // Cleanup - remove the Textarea from the DOM if it was injected.
          if (textarea && textarea.parentNode) {

            textarea.parentNode.removeChild(textarea);

          }

          let text;

          if (!!label) {

            text = (label.length > MAX_LABEL_LENGTH) ? label.substr(0, MAX_LABEL_LENGTH) + '...' : label;

          } else {

            text = (value.length > MAX_LABEL_LENGTH) ? value.substr(0, MAX_LABEL_LENGTH) + '...' : value;
          }

          this.snackBar.open(
            `Copiado:　${text}`,
            'Cerrar',
            { duration: 3000 }
          );

        }

      }
    );

    return (promise);

  }


  public copyTable(data: any, label: string): Promise<string> {

    const promise = new Promise<string>(
      (resolve, reject): void => {

        let table = null;
        const rows = data.length;
        const cols = data[0].length;

        try {

          table = this.dom.createElement('table');
          table.id = '__copyToClipboardTable';
          table.style.height = '0px';
          table.style.left = '-100px';
          table.style.position = 'fixed';
          table.style.top = '-100px';
          table.style.width = '0px';
          table.setAttribute('style', 'border: 1px solid #bbbbbb; border-collapse: collapse;');

          for (let r = 0; r < rows; r++) {

            const row = table.insertRow(r);

            for (let c = 0; c < cols; c++) {

              const cell = row.insertCell(c);

              cell.innerHTML = data[r][c];
              cell.setAttribute('style', 'border: 1px solid #bbbbbb; font:Arial; font-size:11px; padding:5px;');
            }
          }
          this.dom.body.appendChild(table);
          this.selectElementContents(document.getElementById('__copyToClipboardTable'));

          this.dom.execCommand('copy');

          resolve(data);

        } finally {
          if (table && table.parentNode) {
            table.parentNode.removeChild(table);
          }

          const text = (label.length > MAX_LABEL_LENGTH) ? label.substr(0, MAX_LABEL_LENGTH) + '...' : label;

          this.snackBar.open(
            `Copiado: ${text}`,
            'Cerrar',
            { duration: 3000 }
          );
        }
      }
    );
    return (promise);
  }


  public copyTableAsCsv(data: any, label: string): Promise<string> {
    const rows = data.length;
    const cols = data[0].length;
    let parsedData = '';
    const colSeparator = String.fromCharCode(parseInt('09', 16));
    const rowSeparator = String.fromCharCode(parseInt('0D', 16)) + String.fromCharCode(parseInt('0A', 16));

    try {

      for (let r = 0; r < rows; r++) {

        let row = '';

        for (let c = 0; c < cols; c++) {

          if (c !== 0) {
            row += colSeparator;
          }

          row += data[r][c];
        }

        row += rowSeparator;
        parsedData += row;
      }

    } catch (e) {

      console.log(e);
      return null;
    }

    return this.copy(parsedData, label);
  }


  private selectElementContents(el) {

    if (document.createRange && window.getSelection) {

      const range = document.createRange();
      const sel = window.getSelection();
      sel.removeAllRanges();

      try {
        range.selectNodeContents(el);
        sel.addRange(range);

      } catch (e) {

        range.selectNode(el);
        sel.addRange(range);
      }
    }
  }
}
