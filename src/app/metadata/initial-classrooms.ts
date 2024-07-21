import {
  Classroom,
  ClassroomColumnSort,
  ClassroomFieldType,
} from '../models/classroom.models';

export const INITIAL_CLASSROOMS: Classroom[] = [
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
];
