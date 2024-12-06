import { FieldType } from '@shared/classrooms';

export interface Cell {
  fieldId: string;
  studentId?: string;
  isEditing?: boolean;
}

export interface CellDetails {
  type: FieldType;
  rowIndex: number;
  columnIndex: number;
  groupIndex: number;
}
