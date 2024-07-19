export interface Classroom {
  label: string;
  id: string;
  configurations: ClassroomConfiguration[];
  students: Student[];
  description?: string;
}

export interface ClassroomConfiguration {
  label: string;
  description?: string;
  id: string;
  columns: ClassroomConfigurationColumn[];
}

export interface ClassroomConfigurationColumn {
  label: string;
  id: string;
  enabled: boolean;
  sort: ClassroomConfigurationColumnSort;
  type: ClassroomConfigurationColumnType;
}

export enum ClassroomConfigurationColumnType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
}

export enum ClassroomConfigurationColumnSort {
  ASCENDING = 'ASCENDING',
  DESCENDING = 'DESCENDING',
  NONE = 'NONE',
}

export interface Student {
  [columnId: string]: number | string;
}
