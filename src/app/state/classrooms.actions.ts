import { createAction, props } from '@ngrx/store';

export const getClassrooms = createAction('[Classrooms] Get Classrooms');

export const showClassroom = createAction(
  '[Classrooms] Show Classroom',
  props<{ classroomId: string }>()
);

export const viewClassroom = createAction(
  '[Classroom] View Classroom',
  props<{ classroomId: string }>()
);
