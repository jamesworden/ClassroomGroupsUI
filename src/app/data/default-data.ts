import {
  Classroom,
  Column,
  ColumnSort,
  Configuration,
  Field,
  FieldType,
  Group,
  Student,
  StudentField,
  StudentGroup,
} from '../models/classroom.models';

export const DEFAULT_CLASSROOMS: Classroom[] = [
  {
    id: 'classroom-id',
    label: '4th Period English',
    description: 'Historical fiction for young adults',
  },
];

export const DEFAULT_STUDENTS: Student[] = [
  {
    id: 'jane-doe-id',
    classroomId: 'classroom-id',
  },
  {
    id: 'john-smith-id',
    classroomId: 'classroom-id',
  },
];

export const DEFAULT_CONFIGURATIONS: Configuration[] = [
  {
    id: 'configuration-id',
    label: 'Group project 7.18.24',
    description: 'The Great Gatsby homework assignment',
    classroomId: 'classroom-id',
  },
];

export const DEFAULT_COLUMNS: Column[] = [
  {
    enabled: true,
    id: 'first-name-column-id',
    sort: ColumnSort.NONE,
    fieldId: 'first-name-field-id',
    configurationId: 'configuration-id',
    ordinal: 0,
  },
  {
    enabled: true,
    id: 'last-name-column-id',
    sort: ColumnSort.ASCENDING,
    fieldId: 'last-name-field-id',
    configurationId: 'configuration-id',
    ordinal: 1,
  },
];

export const DEFAULT_FIELDS: Field[] = [
  {
    id: 'first-name-field-id',
    label: 'First Name',
    type: FieldType.TEXT,
    classroomId: 'classroom-id',
  },
  {
    id: 'last-name-field-id',
    label: 'Last Name',
    type: FieldType.TEXT,
    classroomId: 'classroom-id',
  },
];

export const DEFAULT_STUDENT_FIELDS: StudentField[] = [
  {
    studentId: 'jane-doe-id',
    fieldId: 'first-name-field-id',
    value: 'Jane',
  },
  {
    studentId: 'jane-doe-id',
    fieldId: 'last-name-field-id',
    value: 'Doe',
  },
  {
    studentId: 'john-smith-id',
    fieldId: 'first-name-field-id',
    value: 'John',
  },
  {
    studentId: 'john-smith-id',
    fieldId: 'last-name-field-id',
    value: 'Smith',
  },
];

export const DEFAULT_GROUPS: Group[] = [
  {
    id: 'group-id',
    configurationId: 'configuration-id',
    label: 'Chapter 1',
    ordinal: 0,
  },
];

export const DEFAULT_STUDENT_GROUPS: StudentGroup[] = [
  {
    id: 'student-group-1',
    groupId: 'group-id',
    studentId: 'jane-doe-id',
    ordinal: 0,
  },
  {
    id: 'student-group-2',
    groupId: 'group-id',
    studentId: 'john-smith-id',
    ordinal: 1,
  },
];
