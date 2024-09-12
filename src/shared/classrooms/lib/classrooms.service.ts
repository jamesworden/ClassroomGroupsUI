import { computed, inject, Injectable, Signal, signal } from '@angular/core';
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
  PatchedConfigurationResponse,
} from './models';

import { HttpClient } from '@angular/common/http';
import { catchError, finalize, of, Subject, take, tap } from 'rxjs';
import { getConfigurationFromDetail } from './logic/get-model-from-detail';
import { MatSnackBar } from '@angular/material/snack-bar';

class ClassroomSelectors {
  constructor(private _state: Signal<ClassroomsState>) {}

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

  public readonly loadingConfigurationDetailIds = computed(
    () => this._state().loadingConfigurationDetailIds
  );

  public readonly configurationsLoading = computed(
    () => this._state().configurationsLoading
  );

  public readonly configurationLoading = (configurationId?: string) =>
    computed(() =>
      configurationId
        ? this._state().loadingConfigurationDetailIds.includes(configurationId)
        : false
    );
}

interface ClassroomsState {
  classroomDetails: ClassroomDetail[];
  configurationDetails: ConfigurationDetail[];
  configurations: Configuration[];
  classroomsLoading: boolean;
  configurationsLoading: boolean;
  loadingConfigurationDetailIds: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ClassroomsService {
  readonly #httpClient = inject(HttpClient);
  readonly #matSnackBar = inject(MatSnackBar);

  private readonly _state = signal<ClassroomsState>({
    classroomDetails: [],
    configurationDetails: [],
    configurations: [],
    classroomsLoading: false,
    configurationsLoading: false,
    loadingConfigurationDetailIds: [],
  });

  public readonly select = new ClassroomSelectors(this._state.asReadonly());

  private readonly _events = {
    createdConfiguration$: new Subject<void>(),
  };

  public readonly events = {
    createdConfiguration$: this._events.createdConfiguration$.asObservable(),
  };

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
      .pipe(
        tap(({ classroomDetails }) => {
          console.log('[Got Classroom Details]', classroomDetails);
          this.patchState(() => ({ classroomDetails }));
        }),
        catchError((error) => {
          console.log('[Get Classroom Details Failed]', error);
          this.#matSnackBar.open(
            'Error fetching classroom details',
            undefined,
            {
              duration: 3000,
            }
          );
          return of(null);
        }),
        finalize(() => {
          this.patchState(() => ({ classroomsLoading: false }));
        }),
        take(1)
      )
      .subscribe();
  }

  public getConfigurationDetail(classroomId: string, configurationId: string) {
    this.patchState((state) => ({
      loadingConfigurationDetailIds: [
        ...state.loadingConfigurationDetailIds,
        configurationId,
      ],
    }));
    return this.#httpClient
      .get<GetConfigurationDetailResponse>(
        `/api/v1/classrooms/${classroomId}/configuration-detail/${configurationId}`,
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(({ configurationDetail }) => {
          console.log('[Got Configuration Detail]', configurationDetail);
          this.patchState((state) => ({
            configurationDetails: [
              ...state.configurationDetails.filter(
                (c) => c.id !== configurationDetail.id
              ),
              configurationDetail,
            ],
          }));
        }),
        catchError((error) => {
          console.log('[Get Configuration Detail Failed]', error);
          this.#matSnackBar.open(
            'Error fetching configuration detail',
            undefined,
            {
              duration: 3000,
            }
          );
          return of(null);
        }),
        finalize(() => {
          this.patchState((state) => ({
            loadingConfigurationDetailIds:
              state.loadingConfigurationDetailIds.filter(
                (id) => id !== configurationId
              ),
          }));
        }),
        take(1)
      )
      .subscribe();
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
      .pipe(
        tap(({ createdClassroomDetail }) => {
          console.log('[Created Classroom Detail]', createdClassroomDetail);
          this.patchState((state) => ({
            classroomDetails: [
              ...state.classroomDetails,
              createdClassroomDetail,
            ],
            classroomsLoading: false,
          }));
          this.#matSnackBar.open('Classroom created', undefined, {
            duration: 3000,
          });
        }),
        catchError((error) => {
          console.log('[Create Classroom Failed]', error);
          return of(null);
        }),
        finalize(() => {
          this.patchState(() => ({
            classroomsLoading: false,
          }));
        }),
        take(1)
      )
      .subscribe();
  }

  public deleteClassroom(classroomId: string) {
    this.patchState(() => ({
      classroomsLoading: true,
    }));
    return this.#httpClient
      .delete<DeletedClassroomResponse>(`/api/v1/classrooms/${classroomId}`, {
        withCredentials: true,
      })
      .pipe(
        tap(({ deletedClassroom }) => {
          console.log('[Deleted Classroom]', deletedClassroom);
          this.patchState((state) => ({
            classroomDetails: [
              ...state.classroomDetails.filter(
                (c) => c.id !== deletedClassroom.id
              ),
            ],
            classroomsLoading: false,
          }));
          this.#matSnackBar.open('Classroom deleted', undefined, {
            duration: 3000,
          });
        }),
        catchError((error) => {
          console.log('[Delete Classroom Failed]', error);
          this.#matSnackBar.open('Error deleting classroom', undefined, {
            duration: 3000,
          });
          return of(null);
        }),
        finalize(() => {
          this.patchState(() => ({
            classroomsLoading: false,
          }));
        }),
        take(1)
      )
      .subscribe();
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
      .pipe(
        tap(({ createdConfigurationDetail }) => {
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
          this.#matSnackBar.open('Configuration created', undefined, {
            duration: 3000,
          });
          this._events.createdConfiguration$.next();
        }),
        catchError((error) => {
          console.log('[Create Configuration Failed]', error);
          this.#matSnackBar.open('Error creating configuration', undefined, {
            duration: 3000,
          });
          return of(null);
        }),
        take(1)
      )
      .subscribe();
  }

  public getConfigurations(classroomId: string) {
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
      .pipe(
        tap(({ configurations }) => {
          console.log('[Got Configurations]', configurations);
          this.patchState(() => ({
            configurations,
            configurationsLoading: false,
          }));
        }),
        catchError((error) => {
          console.log('[Get Configurations Failed]', error);
          this.#matSnackBar.open('Error fetching configurations', undefined, {
            duration: 3000,
          });
          return of(null);
        }),
        finalize(() => {
          this.patchState(() => ({
            configurationsLoading: false,
          }));
        }),
        take(1)
      )
      .subscribe();
  }

  public patchConfiguration(
    classroomId: string,
    configuration: Configuration,
    successMessage = 'Configuration updated',
    failureMessage = 'Error updating configuration'
  ) {
    return this.#httpClient
      .post<PatchedConfigurationResponse>(
        `/api/v1/classrooms/${classroomId}/configurations/${configuration.id}`,
        {
          configuration,
        },
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(({ patchedConfigurationDetail }) => {
          console.log(
            '[Patched Configuration Detail]',
            patchedConfigurationDetail
          );
          this.patchState((state) => ({
            configurationDetails: [
              ...state.configurationDetails.filter(
                (c) => c.id !== patchedConfigurationDetail.id
              ),
              patchedConfigurationDetail,
            ],
            configurations: [
              ...state.configurations.filter(
                (c) => c.id !== patchedConfigurationDetail.id
              ),
              getConfigurationFromDetail(patchedConfigurationDetail),
            ],
          }));
          this.#matSnackBar.open(successMessage, undefined, {
            duration: 3000,
          });
          this._events.createdConfiguration$.next();
        }),
        catchError((error) => {
          console.log('[Patch Configuration Failed]', error);
          this.#matSnackBar.open(failureMessage, undefined, {
            duration: 3000,
          });
          return of(null);
        }),
        take(1)
      )
      .subscribe();
  }
}
