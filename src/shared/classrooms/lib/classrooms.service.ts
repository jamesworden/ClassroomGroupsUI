import { computed, inject, Injectable, signal } from '@angular/core';
import {
  ClassroomDetail,
  Configuration,
  ConfigurationDetail,
  CreatedClassroomResponse,
  CreatedConfigurationResponse,
  DeletedClassroomResponse,
  GetClassroomDetailsResponse,
  GetConfigurationDetailResponse,
  GetConfigurationsResponse,
} from './models';

import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

interface ClassroomsState {
  classroomDetails: ClassroomDetail[];
  configurationDetails: ConfigurationDetail[];
  configurations: Configuration[];
  classroomsLoading: boolean;
  configurationsLoading: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ClassroomsService {
  readonly #httpClient = inject(HttpClient);

  private readonly _state = signal<ClassroomsState>({
    classroomDetails: [],
    configurationDetails: [],
    configurations: [],
    classroomsLoading: false,
    configurationsLoading: false,
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

  public readonly configurationDetails = (classroomId?: string) =>
    computed(() =>
      this._state().configurationDetails.filter(
        (c) => c.classroomId === classroomId
      )
    );

  public readonly configurations = (classroomId?: string) =>
    computed(() =>
      this._state().configurations.filter((c) => c.classroomId === classroomId)
    );

  public readonly classroomsLoading = computed(
    () => this._state().classroomsLoading
  );

  public readonly createdConfiguration$ = new Subject<void>();

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
      .get<GetClassroomDetailsResponse>(
        '/api/v1/classrooms/classroom-details',
        {
          withCredentials: true,
        }
      )
      .subscribe(({ classroomDetails }) => {
        console.log('[Get Classroom Details]', classroomDetails);
        this.patchState(() => ({
          classroomDetails,
          classroomsLoading: false,
        }));
      });
  }

  public getConfigurationDetail(classroomId: string, configurationId: string) {
    return this.#httpClient
      .get<GetConfigurationDetailResponse>(
        `/api/v1/classrooms/${classroomId}/configuration-detail/${configurationId}`,
        {
          withCredentials: true,
        }
      )
      .subscribe(({ configurationDetail }) => {
        console.log('[Get Configuration Detail]', configurationDetail);
        this.patchState((state) => ({
          configurationDetails: [
            ...state.configurationDetails.filter(
              (c) => c.id !== configurationDetail.id
            ),
            configurationDetail,
          ],
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
        console.log('[Deleted Classroom]', deletedClassroom);
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
          configurations: [
            ...state.configurations,
            getConfigurationFromDetail(createdConfigurationDetail),
          ],
        }));
        this.createdConfiguration$.next();
      });
  }

  public getConfigurations(classroomId: string) {
    console.log('get configurations');
    this.patchState(() => ({
      configurationsLoading: true,
    }));
    return this.#httpClient
      .get<GetConfigurationsResponse>(
        `/api/v1/classrooms/${classroomId}/configurations`,
        {
          withCredentials: true,
        }
      )
      .subscribe(({ configurations }) => {
        console.log('[Get Configurations]', configurations);
        this.patchState(() => ({
          configurations,
          configurationsLoading: false,
        }));
      });
  }
}

function getConfigurationFromDetail(
  detail: ConfigurationDetail
): Configuration {
  return {
    classroomId: detail.classroomId,
    id: detail.id,
    label: detail.label,
    description: detail.description,
  };
}
