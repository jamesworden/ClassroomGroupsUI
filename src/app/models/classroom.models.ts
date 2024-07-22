export interface Classroom {
  label: string;
  id: string;
  configurations: ClassroomConfig[];
  students: Student[];
  description?: string;
  fields: ClassroomField[];
}

export interface ClassroomConfig {
  label: string;
  description?: string;
  id: string;
  columns: ClassroomColumn[];
  groups: ClassroomGroup[];
}

export interface ClassroomField {
  label: string;
  id: string;
  type: ClassroomFieldType;
}

export interface ClassroomColumn {
  id: string;
  enabled: boolean;
  sort: ClassroomColumnSort;
  fieldId: string;
}

export interface ClassroomGroup {
  id: string;
  label: string;
}

export enum ClassroomFieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
}

export enum ClassroomColumnSort {
  ASCENDING = 'ASCENDING',
  DESCENDING = 'DESCENDING',
  NONE = 'NONE',
}

export interface Student {
  id: string;
  groupId: string;
  row: {
    [fieldId: string]: number | string;
  };
}
