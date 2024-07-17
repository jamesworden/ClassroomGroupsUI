import { createReducer, on } from '@ngrx/store';
import { getClassrooms } from './classrooms.actions';
import {
  Classroom,
  ClassroomConfigurationColumnSort,
} from './classroom.models';

export const initialState: Classroom[] = [
  {
    key: 0,
    label: 'Classroom 1',
    description: 'This classroom has great students.',
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
