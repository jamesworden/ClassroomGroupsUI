import {
  HostListener,
  inject,
  Injectable,
  Renderer2,
  RendererFactory2,
  signal,
} from '@angular/core';
import { Cell } from 'app/models/cell';

@Injectable({
  providedIn: 'root',
})
export class CellSelectionService {
  readonly #rendererFactory2 = inject(RendererFactory2);

  private readonly _selectedCell = signal<Cell | undefined>(undefined);
  public readonly selectedCell = this._selectedCell.asReadonly();

  private readonly _editCellValue = signal<string | undefined>(undefined);
  public readonly editCellValue = this._editCellValue.asReadonly();

  private renderer: Renderer2;

  constructor() {
    this.renderer = this.#rendererFactory2.createRenderer(null, null);
    this.renderer.listen('document', 'click', (event) => this.onClick(event));
    this.renderer.listen('document', 'dblclick', (event) =>
      this.onDoubleClick(event)
    );
    this.renderer.listen('document', 'keypress', (event) =>
      this.onKeyPress(event)
    );
  }

  private onClick(event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    if (!target) {
      this._selectedCell.set(undefined);
      return;
    }
    const fieldId = target.getAttribute('field-id');
    if (!fieldId) {
      this._selectedCell.set(undefined);
      return;
    }
    const studentId = target.getAttribute('student-id') || undefined;
    this._selectedCell.set({
      fieldId,
      studentId,
    });
  }

  private onDoubleClick(event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    if (!target) {
      this._selectedCell.set(undefined);
      return;
    }
    const fieldId = target.getAttribute('field-id');
    if (!fieldId) {
      this._selectedCell.set(undefined);
      return;
    }
    const studentId = target.getAttribute('student-id') || undefined;
    this._selectedCell.set({
      fieldId,
      studentId,
      isEditing: true,
    });
  }

  private onKeyPress({ key }: KeyboardEvent) {
    const selectedCell = this._selectedCell();
    if (!selectedCell || selectedCell.isEditing) {
      return;
    }

    // TODO: When key is 'enter', set the editing value to that of whatever was last persisted.

    if (key.length > 1) {
      return;
    }

    this._editCellValue.set(key);
    this._selectedCell.set({
      ...selectedCell,
      isEditing: true,
    });
  }

  unselectCell() {
    this._selectedCell.set(undefined);
    this._editCellValue.set(undefined);
  }

  public setEditCellValue(value: string) {
    this._editCellValue.set(value);
  }
}
