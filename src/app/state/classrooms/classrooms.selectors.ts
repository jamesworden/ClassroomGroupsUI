import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ClassroomsState } from './classrooms.reducer';
import { Classroom } from '../../models/classroom.models';

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

export const selectClassroom = (classroomId: string) =>
  createSelector(selectClassrooms, (classrooms: Classroom[]) =>
    classrooms.find(({ id }) => classroomId === id)
  );

export const selectConfigurations = (classroomId: string) =>
  createSelector(
    selectClassroom(classroomId),
    (classroom: Classroom | undefined) => classroom?.configurations ?? []
  );

export const selectViewingConfigurationId = createSelector(
  selectClassroomsState,
  (state: ClassroomsState) => state.viewingConfigurationId
);
