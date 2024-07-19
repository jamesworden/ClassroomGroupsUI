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
  groups: ClassroomConfigurationGroup[];
}

export interface ClassroomConfigurationColumn {
  label: string;
  id: string;
  enabled: boolean;
  sort: ClassroomConfigurationColumnSort;
  type: ClassroomConfigurationColumnType;
}

export interface ClassroomConfigurationGroup {
  id: string;
  label: string;
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
  groupId: string;
  row: {
    [columnId: string]: number | string;
  };
}
