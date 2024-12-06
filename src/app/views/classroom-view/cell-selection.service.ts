import {
  HostListener,
  inject,
  Injectable,
  Renderer2,
  RendererFactory2,
  signal,
} from '@angular/core';
import { FieldType } from '@shared/classrooms';
import { Cell, CellDetails } from 'app/models/cell';

@Injectable({
  providedIn: 'root',
})
export class CellSelectionService {
  readonly #rendererFactory2 = inject(RendererFactory2);

  private readonly _selectedCell = signal<Cell | undefined>(undefined);
  public readonly selectedCell = this._selectedCell.asReadonly();

  private readonly _editCellValue = signal<string | undefined>(undefined);
  public readonly editCellValue = this._editCellValue.asReadonly();

  private readonly _editCellDetails = signal<CellDetails | undefined>(
    undefined
  );

  private renderer: Renderer2;

  constructor() {
    this.renderer = this.#rendererFactory2.createRenderer(null, null);
    this.renderer.listen('document', 'click', (event) => this.onClick(event));
    this.renderer.listen('document', 'dblclick', (event) =>
      this.onDoubleClick(event)
    );
    this.renderer.listen('document', 'keydown', (event) =>
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

  private onKeyPress(event: KeyboardEvent) {
    const { key } = event;

    const selectedCell = this._selectedCell();
    if (!selectedCell || selectedCell.isEditing) {
      return;
    }

    if (key === 'Enter' && !selectedCell.isEditing) {
      this._selectedCell.set({
        ...selectedCell,
        isEditing: true,
      });
    }

    if (key === 'Tab' && selectedCell) {
      event.preventDefault();
      this.selectRightCell();
      return;
    }

    const validCharacters = /^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>_\-+=]*$/;
    if (!validCharacters.test(key) || key.length > 1) {
      return;
    }

    const cellDetails = this._editCellDetails();
    if (cellDetails && !isValidInput(key, cellDetails.type)) {
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
    this._editCellDetails.set(undefined);
  }

  public setEditCellValue(value: string) {
    this._editCellValue.set(value);
  }

  public setEditCellDetails(details: CellDetails | undefined) {
    this._editCellDetails.set(details);
  }

  public selectRightCell() {
    const details = this._editCellDetails();
    if (!details) {
      return;
    }

    const { groupIndex, rowIndex, columnIndex } = details;
    const nextColumnIndex = columnIndex + 1;

    const rightCellElement = document.querySelector(
      `span[column-index="${nextColumnIndex}"][group-index="${groupIndex}"][row-index="${rowIndex}"]`
    );
    if (!rightCellElement) {
      return;
    }

    const studentId = rightCellElement.getAttribute('student-id') || undefined;
    const fieldId = rightCellElement.getAttribute('field-id');
    if (fieldId) {
      this.setEditCellDetails({
        ...details,
        columnIndex: nextColumnIndex,
      });
      this._selectedCell.set({
        fieldId,
        studentId,
        isEditing: false,
      });
    }
  }
}

function isValidInput(value: string, type: FieldType) {
  if (type === FieldType.TEXT) {
    return true;
  }

  if (type === FieldType.NUMBER) {
    return !isNaN(Number(value)) && value.trim() !== '';
  }

  return false;
}
