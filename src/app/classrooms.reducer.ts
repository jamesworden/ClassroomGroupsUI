import { createReducer, on } from '@ngrx/store';
import { getClassrooms } from './classrooms.actions';

export interface Classroom {
  label: string;
  key: number;
  configurations: ClassroomConfiguration[];
  students: Student[];
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

export const initialState: Classroom[] = [
  {
    key: 0,
    label: 'Classroom 1',
    configurations: [
      {
        columns: [
          {
            enabled: true,
            key: 0,
            label: 'First Name',
            sort: ClassroomConfigurationColumnSort.NONE,
          },
          {
            enabled: true,
            key: 1,
            label: 'Last Name',
            sort: ClassroomConfigurationColumnSort.NONE,
          },
        ],
        key: 0,
        label: 'Configuration 1',
      },
    ],
    students: [
      {
        0: 'Jane',
        1: 'Doe',
      },
      {
        0: 'John',
        1: 'Smith',
      },
    ],
  },
];

export const classroomsReducer = createReducer(
  initialState,
  on(getClassrooms, (state) => {
    // TODO: Fetch and parse classroom data from localstorage
    return state;
  })
);
