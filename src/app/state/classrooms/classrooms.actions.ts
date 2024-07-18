import { createAction, props } from '@ngrx/store';

export const viewClassroom = createAction(
  '[Classroom] View Classroom',
  props<{ classroomId: string }>()
);
