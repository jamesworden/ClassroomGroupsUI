import { createReducer, on } from '@ngrx/store';
import {
  Classroom,
  ClassroomColumnSort,
  ClassroomFieldType,
} from '../../models/classroom.models';
import {
  addClassroom,
  addConfiguration,
  createColumn,
  deleteClassroom,
  deleteConfiguration,
  toggleColumn,
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
              sort: ClassroomColumnSort.NONE,
              fieldId: 'first-name-field-id',
            },
            {
              enabled: true,
              id: 'd63e23ba-4958-48fc-a304-349d094a4a61',
              sort: ClassroomColumnSort.ASCENDING,
              fieldId: 'last-name-field-id',
            },
          ],
          id: 'f3ee16c4-68a9-41c1-8780-ac367a1df4d9',
          label: 'Group project 7.18.24',
          description: 'The Great Gatsby homework assignment',
          groups: [
            {
              id: 'd6e41cf2-9463-402d-9cac-cc47ba0318d6',
              label: 'Chapter 1',
            },
          ],
        },
      ],
      students: [
        {
          groupId: 'd6e41cf2-9463-402d-9cac-cc47ba0318d6',
          row: {
            '6a77ca7a-42b3-45db-b929-fd5bc004d1e7': 'Jane',
            'd63e23ba-4958-48fc-a304-349d094a4a61': 'Doe',
          },
        },
        {
          groupId: 'd6e41cf2-9463-402d-9cac-cc47ba0318d6',
          row: {
            '6a77ca7a-42b3-45db-b929-fd5bc004d1e7': 'John',
            'd63e23ba-4958-48fc-a304-349d094a4a61': 'Smith',
          },
        },
      ],
      fields: [
        {
          id: 'first-name-field-id',
          label: 'First Name',
          type: ClassroomFieldType.TEXT,
        },
        {
          id: 'last-name-field-id',
          label: 'Last Name',
          type: ClassroomFieldType.TEXT,
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
            groups: [],
          },
        ],
        students: [],
        fields: [],
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
          groups: [],
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
  on(createColumn, (state, { classroomId, configurationId, column, field }) => {
    state = updateClassroomProperty(state, classroomId, (classroom) => ({
      ...classroom,
      fields: [...classroom.fields, field],
    }));
    state = updateConfigurationProperty(
      state,
      classroomId,
      configurationId,
      (configuration) => ({
        ...configuration,
        columns: [...configuration.columns, column],
      })
    );
    return state;
  }),
  on(toggleColumn, (state, { classroomId, configurationId, columnId }) =>
    updateConfigurationProperty(
      state,
      classroomId,
      configurationId,
      (configuration) => ({
        ...configuration,
        columns: configuration.columns.map((column: any) => {
          const newCol = { ...column };
          if (newCol.id === columnId) {
            newCol.enabled = !newCol.enabled;
          }
          return newCol;
        }),
      })
    )
  )
);
