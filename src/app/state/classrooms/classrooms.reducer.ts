import { createReducer, on } from '@ngrx/store';
import {
  Classroom,
  ClassroomConfigurationColumnSort,
  ClassroomConfigurationColumnType,
} from '../../models/classroom.models';
import {
  addClassroom,
  addConfiguration,
  createColumn,
  deleteClassroom,
  deleteConfiguration,
  updateClassroomDescription,
  updateClassroomLabel,
  updateColumns,
  updateConfigurationDescription,
  updateConfigurationLabel,
  viewClassroom,
  viewConfiguration,
} from './classrooms.actions';
import { generateUniqueId } from '../../logic/generate-unique-id';

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
              type: ClassroomConfigurationColumnType.TEXT,
            },
            {
              enabled: true,
              id: 'd63e23ba-4958-48fc-a304-349d094a4a61',
              label: 'Last Name',
              sort: ClassroomConfigurationColumnSort.NONE,
              type: ClassroomConfigurationColumnType.TEXT,
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

const updateClassroomProperty = (
  state: ClassroomsState,
  classroomId: string,
  updateFn: (classroom: Classroom) => Classroom
) => {
  return {
    ...state,
    classrooms: state.classrooms.map((classroom) =>
      classroom.id === classroomId ? updateFn(classroom) : classroom
    ),
  };
};

const updateConfigurationProperty = (
  state: ClassroomsState,
  classroomId: string,
  configurationId: string,
  updateFn: (configuration: any) => any
) => {
  return updateClassroomProperty(state, classroomId, (classroom) => ({
    ...classroom,
    configurations: classroom.configurations.map((configuration) =>
      configuration.id === configurationId
        ? updateFn(configuration)
        : configuration
    ),
  }));
};

export const classroomsReducer = createReducer(
  initialState,
  on(viewClassroom, (state, { classroomId }) => ({
    ...state,
    viewingClassroomId: classroomId,
    viewingConfigurationId:
      state.classrooms.find(({ id }) => classroomId === id)?.configurations[0]
        ?.id ?? '',
  })),
  on(addClassroom, (state, { classroomLabel }) => ({
    ...state,
    classrooms: [
      ...state.classrooms,
      {
        id: generateUniqueId(),
        label: classroomLabel,
        description: '',
        configurations: [
          {
            columns: [],
            id: generateUniqueId(),
            label: classroomLabel,
          },
        ],
        students: [],
      },
    ],
  })),
  on(viewConfiguration, (state, { configurationId }) => ({
    ...state,
    viewingConfigurationId: configurationId,
  })),
  on(addConfiguration, (state, { configurationLabel, classroomId }) =>
    updateClassroomProperty(state, classroomId, (classroom) => ({
      ...classroom,
      configurations: [
        ...classroom.configurations,
        {
          columns: [],
          id: generateUniqueId(),
          label: configurationLabel,
        },
      ],
    }))
  ),
  on(deleteClassroom, (state, { classroomId }) => {
    const updatedClassrooms = state.classrooms.filter(
      ({ id }) => id !== classroomId
    );
    return {
      ...state,
      classrooms: updatedClassrooms,
      viewingClassroomId: updatedClassrooms[0]?.id ?? '',
      viewingConfigurationId: updatedClassrooms[0]?.configurations[0]?.id ?? '',
    };
  }),
  on(updateClassroomDescription, (state, { classroomId, description }) =>
    updateClassroomProperty(state, classroomId, (classroom) => ({
      ...classroom,
      description,
    }))
  ),
  on(updateClassroomLabel, (state, { classroomId, label }) =>
    updateClassroomProperty(state, classroomId, (classroom) => ({
      ...classroom,
      label,
    }))
  ),
  on(
    updateConfigurationDescription,
    (state, { classroomId, configurationId, description }) =>
      updateConfigurationProperty(
        state,
        classroomId,
        configurationId,
        (configuration) => ({
          ...configuration,
          description,
        })
      )
  ),
  on(
    updateConfigurationLabel,
    (state, { classroomId, configurationId, label }) =>
      updateConfigurationProperty(
        state,
        classroomId,
        configurationId,
        (configuration) => ({
          ...configuration,
          label,
        })
      )
  ),
  on(deleteConfiguration, (state, { classroomId, configurationId }) =>
    updateClassroomProperty(state, classroomId, (classroom) => ({
      ...classroom,
      configurations: classroom.configurations.filter(
        ({ id }) => id !== configurationId
      ),
    }))
  ),
  on(updateColumns, (state, { classroomId, configurationId, columns }) =>
    updateConfigurationProperty(
      state,
      classroomId,
      configurationId,
      (configuration) => ({
        ...configuration,
        columns,
      })
    )
  ),
  on(createColumn, (state, { classroomId, configurationId, column }) =>
    updateConfigurationProperty(
      state,
      classroomId,
      configurationId,
      (configuration) => ({
        ...configuration,
        columns: [...configuration.columns, column],
      })
    )
  )
);
