import { createReducer, on } from '@ngrx/store';
import { getClassrooms, showClassroom } from './classrooms.actions';
import {
  Classroom,
  ClassroomConfigurationColumnSort,
} from './classroom.models';

export const initialState: {
  classrooms: Classroom[];
  shownClassroomId?: string;
} = {
  classrooms: [
    {
      id: '15392ca9-3143-4f97-8a9b-a2983c803eb0',
      label: 'Classroom 1',
      description: 'This classroom has great students.',
      configurations: [
        {
          columns: [
            {
              enabled: true,
              id: '6a77ca7a-42b3-45db-b929-fd5bc004d1e7',
              label: 'First Name',
              sort: ClassroomConfigurationColumnSort.NONE,
            },
            {
              enabled: true,
              id: 'd63e23ba-4958-48fc-a304-349d094a4a61',
              label: 'Last Name',
              sort: ClassroomConfigurationColumnSort.NONE,
            },
          ],
          id: 'f3ee16c4-68a9-41c1-8780-ac367a1df4d9',
          label: 'Configuration 1',
        },
      ],
      students: [
        {
          '6a77ca7a-42b3-45db-b929-fd5bc004d1e7': 'Jane',
          'd63e23ba-4958-48fc-a304-349d094a4a61': 'Doe',
        },
        {
          '6a77ca7a-42b3-45db-b929-fd5bc004d1e7': 'John',
          'd63e23ba-4958-48fc-a304-349d094a4a61': 'Smith',
        },
      ],
    },
  ],
};

export const classroomsReducer = createReducer(
  initialState,
  on(getClassrooms, (state) => {
    // TODO: Fetch and parse classroom data from localstorage
    state.shownClassroomId = state.classrooms[0]?.id;
    return state;
  }),
  on(showClassroom, (state, { classroomId: shownClassroomId }) => ({
    ...state,
    shownClassroomId,
  }))
);
