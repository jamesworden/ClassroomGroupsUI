import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ClassroomsState } from './classrooms.reducer';

const selectClassroomsState =
  createFeatureSelector<ClassroomsState>('classrooms');

export const selectClassrooms = createSelector(
  selectClassroomsState,
  (state: ClassroomsState) => state.classrooms
);

export const selectViewingClassroomId = createSelector(
  selectClassroomsState,
  (state: ClassroomsState) => state.viewingClassroomId
);
