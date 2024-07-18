import { createAction, props } from '@ngrx/store';

export const viewClassroom = createAction(
  '[Classroom] View Classroom',
  props<{ classroomId: string }>()
);

export const addClassroom = createAction(
  '[Classroom] Add Classroom',
  props<{ classroomLabel: string }>()
);
