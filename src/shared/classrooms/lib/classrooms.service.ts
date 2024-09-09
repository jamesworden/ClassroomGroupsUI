import { computed, inject, Injectable, signal } from '@angular/core';
import {
  ClassroomDetail,
  ConfigurationDetail,
  CreatedClassroomResponse,
  CreatedConfigurationResponse,
  DeletedClassroomResponse,
} from './models';

import { HttpClient } from '@angular/common/http';

interface ClassroomsState {
  classroomDetails: ClassroomDetail[];
  configurationDetails: ConfigurationDetail[];
  classroomsLoading: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ClassroomsService {
  readonly #httpClient = inject(HttpClient);

  private readonly _state = signal<ClassroomsState>({
    classroomDetails: [],
    configurationDetails: [],
    classroomsLoading: false,
  });

  public readonly classroomDetails = computed(
    () => this._state().classroomDetails
  );

  public readonly classroomDetail = (classroomId?: string) =>
    computed(() => this.classroomDetails().find((c) => c.id === classroomId));

  public readonly configurationDetail = (configurationId?: string) =>
    computed(() =>
      this._state().configurationDetails.find((c) => c.id === configurationId)
    );

  public readonly classroomsLoading = computed(
    () => this._state().classroomsLoading
  );

  public patchState(
    strategy: (state: ClassroomsState) => Partial<ClassroomsState>
  ) {
    const state = this._state();
    this._state.set({
      ...state,
      ...strategy(state),
    });
  }

  public getClassroomDetails() {
    this.patchState(() => ({
      classroomsLoading: true,
    }));
    return this.#httpClient
      .get<ClassroomDetail[]>('/api/v1/classrooms/classroom-details', {
        withCredentials: true,
      })
      .subscribe((classroomDetails) => {
        console.log('[Classrooms]', classroomDetails);
        this.patchState(() => ({
          classroomDetails,
          classroomsLoading: false,
        }));
      });
  }

  public getConfigurationDetail(classroomId: string, configurationId: string) {
    return this.#httpClient
      .get<ConfigurationDetail[]>(
        `/api/v1/classrooms/${classroomId}/configuration-detail/${configurationId}`,
        {
          withCredentials: true,
        }
      )
      .subscribe((configurationDetails) => {
        console.log('[Classrooms]', configurationDetails);
        this.patchState(() => ({
          configurationDetails,
        }));
      });
  }

  public createClassroom(label: string, description?: string) {
    this.patchState(() => ({
      classroomsLoading: true,
    }));
    return this.#httpClient
      .post<CreatedClassroomResponse>(
        `/api/v1/classrooms`,
        {
          label,
          description,
        },
        {
          withCredentials: true,
        }
      )
      .subscribe(({ createdClassroomDetail }) => {
        console.log('[Created Classroom Detail]', createdClassroomDetail);
        this.patchState((state) => ({
          classroomDetails: [...state.classroomDetails, createdClassroomDetail],
          classroomsLoading: false,
        }));
      });
  }

  public deleteClassroom(classroomId: string) {
    this.patchState(() => ({
      classroomsLoading: true,
    }));
    return this.#httpClient
      .delete<DeletedClassroomResponse>(`/api/v1/classrooms/${classroomId}`, {
        withCredentials: true,
      })
      .subscribe(({ deletedClassroom }) => {
        this.patchState((state) => ({
          classroomDetails: [
            ...state.classroomDetails.filter(
              (c) => c.id !== deletedClassroom.id
            ),
          ],
          classroomsLoading: false,
        }));
      });
  }

  public createConfiguration(classroomId: string, label: string) {
    return this.#httpClient
      .post<CreatedConfigurationResponse>(
        `/api/v1/classrooms/${classroomId}/configurations`,
        {
          label,
        },
        {
          withCredentials: true,
        }
      )
      .subscribe(({ createdConfigurationDetail }) => {
        console.log(
          '[Created Configuration Detail]',
          createdConfigurationDetail
        );
        this.patchState((state) => ({
          configurationDetails: [
            ...state.configurationDetails,
            createdConfigurationDetail,
          ],
        }));
      });
  }
}
