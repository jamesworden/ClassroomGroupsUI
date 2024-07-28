export interface Classroom {
  label: string;
  id: string;
  description?: string;
}

export interface Configuration {
  label: string;
  description?: string;
  id: string;
  classroomId: string;
}

export interface Field {
  label: string;
  id: string;
  type: FieldType;
  classroomId: string;
}

export interface Column {
  id: string;
  enabled: boolean;
  sort: ColumnSort;
  fieldId: string;
  configurationId: string;
  ordinal: number;
}

export interface Group {
  id: string;
  configurationId: string;
  label: string;
  ordinal: number;
}

export enum FieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
}

export enum ColumnSort {
  ASCENDING = 'ASCENDING',
  DESCENDING = 'DESCENDING',
  NONE = 'NONE',
}

export interface Student {
  id: string;
  classroomId: string;
}

export interface StudentField {
  studentId: string;
  fieldId: string;
  value: number | string;
}

export interface StudentGroup {
  id: string;
  studentId: string;
  groupId: string;
  ordinal: number;
}
