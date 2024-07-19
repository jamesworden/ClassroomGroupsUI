import { createReducer, on } from '@ngrx/store';
import {
  Classroom,
  ClassroomConfigurationColumnSort,
} from '../../models/classroom.models';
import {
  addClassroom,
  addConfiguration,
  deleteClassroom,
  deleteConfiguration,
  updateClassroomDescription,
  updateClassroomLabel,
  updateConfigurationDescription,
  updateConfigurationLabel,
  viewClassroom,
  viewConfiguration,
} from './classrooms.actions';

export interface ClassroomsState {
  classrooms: Classroom[];
  viewingClassroomId: string;
  viewingConfigurationId: string;
}

const initialState: ClassroomsState = {
  classrooms: [
    {
      id: '15392ca9-3143-4f97-8a9b-a2983c803eb0',
      label: '4th Period English',
      description: 'Historical fiction for young adults',
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
          label: 'Group project 7.18.24',
          description: 'The Great Gatsby homework assignment',
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
  viewingClassroomId: '15392ca9-3143-4f97-8a9b-a2983c803eb0',
  viewingConfigurationId: 'f3ee16c4-68a9-41c1-8780-ac367a1df4d9',
};

export const classroomsReducer = createReducer(
  initialState,
  on(viewClassroom, (state, { classroomId: viewingClassroomId }) => ({
    ...state,
    viewingClassroomId,
    viewingConfigurationId:
      state.classrooms.find(({ id }) => viewingClassroomId === id)
        ?.configurations[0].id ?? '',
  })),
  on(addClassroom, (state, { classroomLabel: label }) => {
    const newState = JSON.parse(JSON.stringify(state)) as ClassroomsState;

    newState.classrooms.push({
      configurations: [
        {
          columns: [],
          id: generateUniqueId(),
          label,
        },
      ],
      id: generateUniqueId(),
      label,
      students: [],
      description: '',
    });

    return newState;
  }),
  on(
    viewConfiguration,
    (state, { configurationId: viewingConfigurationId }) => ({
      ...state,
      viewingConfigurationId,
    })
  ),
  on(addConfiguration, (state, { configurationLabel: label, classroomId }) => {
    const newState = JSON.parse(JSON.stringify(state)) as ClassroomsState;

    const classroom = newState.classrooms.find(({ id }) => id === classroomId);
    if (!classroom) {
      return state;
    }

    classroom.configurations.push({
      columns: [],
      id: generateUniqueId(),
      label,
    });

    return newState;
  }),
  on(deleteClassroom, (state, { classroomId }) => {
    const newState = JSON.parse(JSON.stringify(state)) as ClassroomsState;

    newState.classrooms = newState.classrooms.filter(
      ({ id }) => classroomId !== id
    );
    // TODO: Move select first classroom into the dispatching of a new action?
    newState.viewingClassroomId = newState.classrooms[0].id;
    newState.viewingConfigurationId =
      newState.classrooms[0].configurations[0].id;

    return newState;
  }),
  on(updateClassroomDescription, (state, { classroomId, description }) => {
    const newState = JSON.parse(JSON.stringify(state)) as ClassroomsState;

    const classroom = newState.classrooms.find(({ id }) => id === classroomId);
    if (!classroom) {
      return state;
    }

    classroom.description = description;

    return newState;
  }),
  on(updateClassroomLabel, (state, { classroomId, label }) => {
    const newState = JSON.parse(JSON.stringify(state)) as ClassroomsState;

    const classroom = newState.classrooms.find(({ id }) => id === classroomId);
    if (!classroom) {
      return state;
    }

    classroom.label = label;

    return newState;
  }),
  on(
    updateConfigurationDescription,
    (state, { classroomId, description, configurationId }) => {
      const newState = JSON.parse(JSON.stringify(state)) as ClassroomsState;

      const classroom = newState.classrooms.find(
        ({ id }) => id === classroomId
      );
      if (!classroom) {
        return state;
      }

      const configuration = classroom.configurations.find(
        ({ id }) => id === configurationId
      );
      if (!configuration) {
        return state;
      }

      configuration.description = description;

      return newState;
    }
  ),
  on(
    updateConfigurationLabel,
    (state, { classroomId, label, configurationId }) => {
      const newState = JSON.parse(JSON.stringify(state)) as ClassroomsState;

      const classroom = newState.classrooms.find(
        ({ id }) => id === classroomId
      );
      if (!classroom) {
        return state;
      }

      const configuration = classroom.configurations.find(
        ({ id }) => id === configurationId
      );
      if (!configuration) {
        return state;
      }

      configuration.label = label;

      return newState;
    }
  ),
  on(deleteConfiguration, (state, { classroomId, configurationId }) => {
    const newState = JSON.parse(JSON.stringify(state)) as ClassroomsState;

    const classroom = newState.classrooms.find(({ id }) => classroomId === id);
    if (!classroom) {
      return state;
    }

    classroom.configurations = classroom.configurations.filter(
      ({ id }) => id !== configurationId
    );

    newState.viewingConfigurationId = classroom.configurations[0].id;

    return newState;
  })
);

function generateUniqueId() {
  return `${new Date().getTime() * Math.random()}`;
}
