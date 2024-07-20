import { createAction, props } from '@ngrx/store';
import { ClassroomColumn, ClassroomField } from '../../models/classroom.models';

export const viewClassroom = createAction(
  '[Classroom] View Classroom',
  props<{ classroomId: string }>()
);

export const addClassroom = createAction(
  '[Classroom] Add Classroom',
  props<{ classroomLabel: string }>()
);

export const deleteClassroom = createAction(
  '[Classroom] Delete Classroom',
  props<{ classroomId: string }>()
);

export const viewConfiguration = createAction(
  '[Classroom] View Configuration',
  props<{ configurationId: string }>()
);

export const addConfiguration = createAction(
  '[Classroom] Add Configuration',
  props<{ configurationLabel: string; classroomId: string }>()
);

export const updateClassroomDescription = createAction(
  '[Classroom] Update Classroom Description',
  props<{ description: string; classroomId: string }>()
);

export const updateClassroomLabel = createAction(
  '[Classroom] Update Classroom Label',
  props<{ label: string; classroomId: string }>()
);

export const updateConfigurationDescription = createAction(
  '[Classroom] Update Configuration Description',
  props<{ description: string; classroomId: string; configurationId: string }>()
);

export const updateConfigurationLabel = createAction(
  '[Classroom] Update Configuration Label',
  props<{ label: string; classroomId: string; configurationId: string }>()
);

export const deleteConfiguration = createAction(
  '[Classroom] Delete Configuration',
  props<{ classroomId: string; configurationId: string }>()
);

export const updateColumns = createAction(
  '[Classroom] Update Columns',
  props<{
    classroomId: string;
    configurationId: string;
    columns: ClassroomColumn[];
  }>()
);

export const createColumn = createAction(
  '[Classroom] Create Column',
  props<{
    classroomId: string;
    configurationId: string;
    column: ClassroomColumn;
    field: ClassroomField;
  }>()
);
