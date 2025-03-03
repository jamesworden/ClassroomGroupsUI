export interface Classroom {
  label: string;
  id: string;
  description?: string;
}

export interface Configuration {
  label: string;
  description: string;
  id: string;
  classroomId: string;
  defaultGroupId: string;
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
  isLocked: boolean;
}

export enum FieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  EMAIL = 'EMAIL',
  DATE = 'DATE',
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
  value: string;
}

export interface StudentGroup {
  id: string;
  studentId: string;
  groupId: string;
  ordinal: number;
}

export interface ClassroomDetail {
  id: string;
  accountId: string;
  label: string;
  description: string;
  fieldDetails: FieldDetail[];
}

export interface FieldDetail {
  id: string;
  classroomId: string;
  label: string;
  type: FieldType;
}

export interface ConfigurationDetail {
  id: string;
  classroomId: string;
  label: string;
  description: string;
  groupDetails: GroupDetail[];
  columnDetails: ColumnDetail[];
  defaultGroupId: string;
}

export interface ColumnDetail {
  id: string;
  configurationId: string;
  fieldId: string;
  ordinal: number;
  sort: ColumnSort;
  enabled: boolean;
  type: FieldType;
  label: string;
}

export interface GroupDetail {
  id: string;
  configurationId: string;
  ordinal: number;
  label: string;
  studentDetails: StudentDetail[];
  isLocked: boolean;
}

export interface StudentDetail {
  id: string;
  groupId: string;
  ordinal: number;
  fieldIdsToValues: {
    [id: string]: string;
  };
}

export enum StudentGroupingStrategy {
  MixedAbilities,
  SimilarAbilities,
}

export interface ImportClassroomRequest {
  label: string;
  fields: {
    label: string;
    type: FieldType;
  }[];
  students: Record<string, string>[];
}
