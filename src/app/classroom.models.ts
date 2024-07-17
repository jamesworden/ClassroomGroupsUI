export interface Classroom {
  label: string;
  key: number;
  configurations: ClassroomConfiguration[];
  students: Student[];
  description?: string;
}

export interface ClassroomConfiguration {
  label: string;
  description?: string;
  key: number;
  columns: ClassroomConfigurationColumn[];
}

export interface ClassroomConfigurationColumn {
  label: string;
  key: number;
  enabled: boolean;
  sort: ClassroomConfigurationColumnSort;
}

export enum ClassroomConfigurationColumnSort {
  ASCENDING = 'ASCENDING',
  DESCENDING = 'DESCENDING',
  NONE = 'NONE',
}

export interface Student {
  [fieldKey: number]: number | string;
}
