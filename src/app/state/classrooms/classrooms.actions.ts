import { createAction, props } from '@ngrx/store';

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
