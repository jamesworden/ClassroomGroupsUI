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
  /**
   * TODO: Move to classroom! Wait... I want the fields themselves to be on a per classroom basis, but I want the sort and order to be on a per configuration basis!
   */
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
