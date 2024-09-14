import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import {
  Classroom,
  ClassroomDetail,
  Configuration,
  ConfigurationDetail,
  CreatedClassroomResponse,
  CreatedConfigurationResponse,
  CreateGroupResponse,
  CreateStudentResponse,
  DeletedClassroomResponse,
  DeletedConfigurationResponse,
  DeleteGroupResponse,
  GetClassroomDetailsResponse,
  GetConfigurationDetailResponse,
  GetConfigurationsResponse,
  Group,
  PatchClassroomResponse,
  PatchConfigurationResponse,
  PatchGroupResponse,
} from './models';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, of, take, tap } from 'rxjs';
import { getConfigurationFromDetail } from './logic/get-model-from-detail';
import { MatSnackBar } from '@angular/material/snack-bar';
import { create } from 'mutative';

class ClassroomSelectors {
  constructor(private _state: Signal<ClassroomsState>) {}

  public readonly classroomDetails = computed(() =>
    this._state().classroomDetails.sort((a, b) =>
      a.label.localeCompare(b.label)
    )
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
      this._state()
        .configurations.filter((c) => c.classroomId === classroomId)
        .sort((a, b) => a.label.localeCompare(b.label))
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

  public readonly columnDetails = (configurationId?: string) =>
    computed(
      () => this.configurationDetail(configurationId)()?.columnDetails
    )() ?? [];

  public readonly groupDetails = (configurationId?: string) =>
    computed(
      () => this.configurationDetail(configurationId)()?.groupDetails ?? []
    );

  public readonly groupIds = (configurationId?: string) =>
    computed(() => this.groupDetails(configurationId)().map(({ id }) => id));

  public readonly configurationUpdating = (configurationId?: string) =>
    computed(() =>
      configurationId
        ? this._state().updatingConfigurationIds.has(configurationId)
        : false
    );

  public readonly classroomUpdating = (classroomId?: string) =>
    computed(() =>
      classroomId ? this._state().updatingClassroomIds.has(classroomId) : false
    );
}

interface ClassroomsState {
  classroomDetails: ClassroomDetail[];
  configurationDetails: ConfigurationDetail[];
  configurations: Configuration[];
  classroomsLoading: boolean;
  configurationsLoading: boolean;
  loadingConfigurationDetailIds: string[];
  updatingConfigurationIds: Set<string>;
  updatingClassroomIds: Set<string>;
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
    updatingConfigurationIds: new Set<string>(),
    updatingClassroomIds: new Set<string>(),
  });

  public readonly select = new ClassroomSelectors(this._state.asReadonly());

  public patchState(strategy: (draft: ClassroomsState) => void) {
    this._state.set(
      create(this._state(), (draft) => {
        strategy(draft);
      })
    );
  }

  public getClassroomDetails() {
    this.patchState((draft) => {
      draft.classroomsLoading = true;
    });
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
          this.patchState((draft) => {
            draft.classroomDetails = classroomDetails;
          });
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
          this.patchState((draft) => {
            draft.classroomsLoading = false;
          });
        }),
        take(1)
      )
      .subscribe();
  }

  public getConfigurationDetail(classroomId: string, configurationId: string) {
    this.patchState((draft) => {
      draft.loadingConfigurationDetailIds.push(configurationId);
    });
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
          this.patchState((draft) => {
            draft.configurationDetails = [
              ...draft.configurationDetails.filter(
                (c) => c.id !== configurationDetail.id
              ),
              configurationDetail,
            ];
          });
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
          this.patchState((draft) => {
            draft.loadingConfigurationDetailIds =
              draft.loadingConfigurationDetailIds.filter(
                (id) => id !== configurationId
              );
          });
        }),
        take(1)
      )
      .subscribe();
  }

  public createClassroom(label: string, description?: string) {
    this.patchState((draft) => {
      draft.classroomsLoading = true;
    });
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
          this.patchState((draft) => {
            draft.classroomDetails.push(createdClassroomDetail);
          });
          this.#matSnackBar.open('Classroom created', undefined, {
            duration: 3000,
          });
        }),
        catchError((error) => {
          console.log('[Create Classroom Failed]', error);
          return of(null);
        }),
        finalize(() => {
          this.patchState((draft) => {
            draft.classroomsLoading = false;
          });
        }),
        take(1)
      )
      .subscribe();
  }

  public deleteClassroom(classroomId: string) {
    this.patchState((draft) => {
      draft.classroomsLoading = true;
    });
    return this.#httpClient
      .delete<DeletedClassroomResponse>(`/api/v1/classrooms/${classroomId}`, {
        withCredentials: true,
      })
      .pipe(
        tap(({ deletedClassroom }) => {
          console.log('[Deleted Classroom]', deletedClassroom);
          this.patchState((draft) => {
            draft.classroomDetails = draft.classroomDetails.filter(
              ({ id }) => id !== deletedClassroom.id
            );
          });
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
          this.patchState((draft) => {
            draft.classroomsLoading = false;
          });
        }),
        take(1)
      )
      .subscribe();
  }

  public createConfiguration(classroomId: string, label: string) {
    this.patchState((draft) => {
      draft.updatingClassroomIds.add(classroomId);
    });
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
          this.patchState((draft) => {
            draft.configurationDetails.push(createdConfigurationDetail);
            draft.configurations.push(
              getConfigurationFromDetail(createdConfigurationDetail)
            );
          });
          this.#matSnackBar.open('Configuration created', undefined, {
            duration: 3000,
          });
        }),
        catchError((error) => {
          console.log('[Create Configuration Failed]', error);
          this.#matSnackBar.open('Error creating configuration', undefined, {
            duration: 3000,
          });
          return of(null);
        }),
        finalize(() => {
          this.patchState((draft) => {
            draft.updatingClassroomIds.delete(classroomId);
          });
        }),
        take(1)
      )
      .subscribe();
  }

  public getConfigurations(classroomId: string) {
    this.patchState((draft) => {
      draft.configurationsLoading = true;
    });
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
          this.patchState((draft) => {
            draft.configurations = configurations;
          });
        }),
        catchError((error) => {
          console.log('[Get Configurations Failed]', error);
          this.#matSnackBar.open('Error fetching configurations', undefined, {
            duration: 3000,
          });
          return of(null);
        }),
        finalize(() => {
          this.patchState((draft) => {
            draft.configurationsLoading = false;
          });
        }),
        take(1)
      )
      .subscribe();
  }

  public patchConfiguration(
    classroomId: string,
    configuration: Configuration,
    failureMessage = 'Error updating configuration'
  ) {
    this.patchState((draft) => {
      draft.updatingConfigurationIds.add(configuration.id);
    });
    return this.#httpClient
      .post<PatchConfigurationResponse>(
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
          this.patchState((draft) => {
            draft.configurationDetails = draft.configurationDetails.map((cd) =>
              cd.id === configuration.id ? patchedConfigurationDetail : cd
            );
            draft.configurations = draft.configurations.map((c) =>
              c.id === configuration.id
                ? getConfigurationFromDetail(patchedConfigurationDetail)
                : c
            );
          });
        }),
        catchError((error) => {
          console.log('[Patch Configuration Failed]', error);
          this.#matSnackBar.open(failureMessage, undefined, {
            duration: 3000,
          });
          return of(null);
        }),
        finalize(() => {
          this.patchState((draft) => {
            draft.updatingConfigurationIds.delete(configuration.id);
          });
        }),
        take(1)
      )
      .subscribe();
  }

  public patchClassroom(
    classroom: Classroom,
    failureMessage = 'Error updating classroom'
  ) {
    this.patchState((draft) => {
      draft.updatingClassroomIds.add(classroom.id);
    });
    return this.#httpClient
      .post<PatchClassroomResponse>(
        `/api/v1/classrooms/${classroom.id}`,
        {
          classroom,
        },
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(({ patchedClassroomDetail }) => {
          console.log('[Patched Classroom Detail]', patchedClassroomDetail);
          this.patchState((draft) => {
            draft.classroomDetails = draft.classroomDetails.map((cd) =>
              cd.id === patchedClassroomDetail.id ? patchedClassroomDetail : cd
            );
          });
        }),
        catchError((error) => {
          console.log('[Patch Classroom Failed]', error);
          this.#matSnackBar.open(failureMessage, undefined, {
            duration: 3000,
          });
          return of(null);
        }),
        finalize(() => {
          this.patchState((draft) => {
            draft.updatingClassroomIds.delete(classroom.id);
          });
        }),
        take(1)
      )
      .subscribe();
  }

  public createGroup(
    classroomId: string,
    configurationId: string,
    label?: string
  ) {
    this.patchState((draft) => {
      draft.updatingConfigurationIds.add(configurationId);
    });
    return this.#httpClient
      .post<CreateGroupResponse>(
        `/api/v1/classrooms/${classroomId}/configurations/${configurationId}/groups`,
        {
          label,
        },
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(({ createdGroupDetail }) => {
          console.log('[Create Group]', createdGroupDetail);
          this.patchState((draft) => {
            draft.configurationDetails.forEach((configurationDetail) => {
              if (configurationDetail.id === configurationId) {
                configurationDetail.groupDetails.push(createdGroupDetail);
              }
            });
          });
          this.#matSnackBar.open('Created group', undefined, {
            duration: 3000,
          });
        }),
        catchError((error) => {
          console.log('[Create Group Failed]', error);
          this.#matSnackBar.open('Error creating group', undefined, {
            duration: 3000,
          });
          return of(null);
        }),
        finalize(() => {
          this.patchState((draft) => {
            draft.updatingConfigurationIds.delete(configurationId);
          });
        }),
        take(1)
      )
      .subscribe();
  }

  public deleteGroup(
    classroomId: string,
    configurationId: string,
    groupId: string
  ) {
    return this.#httpClient
      .delete<DeleteGroupResponse>(
        `/api/v1/classrooms/${classroomId}/configurations/${configurationId}/groups/${groupId}`,
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(({ deletedGroup }) => {
          console.log('[Deleted Group]', deletedGroup);
          this.patchState((draft) => {
            draft.configurationDetails.forEach((configurationDetail) => {
              if (configurationDetail.id === configurationId) {
                configurationDetail.groupDetails =
                  configurationDetail.groupDetails.filter(
                    (g) => g.id !== deletedGroup.id
                  );
              }
            });
          });
          this.#matSnackBar.open('Deleted group', undefined, {
            duration: 3000,
          });
        }),
        catchError((error) => {
          console.log('[Delete Group Failed]', error);
          this.#matSnackBar.open('Error deleting group', undefined, {
            duration: 3000,
          });
          return of(null);
        }),
        take(1)
      )
      .subscribe();
  }

  public createStudent(
    classroomId: string,
    configurationId: string,
    groupId: string
  ) {
    this.patchState((draft) => {
      draft.updatingConfigurationIds.add(configurationId);
    });
    return this.#httpClient
      .post<CreateStudentResponse>(
        `/api/v1/classrooms/${classroomId}/students`,
        {
          configurationId,
          groupId,
        },
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(({ createdStudentDetail }) => {
          console.log('[Created Student]', createdStudentDetail);
          this.patchState((draft) => {
            draft.configurationDetails.forEach((configurationDetail) => {
              if (configurationDetail.id === configurationId) {
                configurationDetail.groupDetails.forEach((groupDetail) => {
                  if (groupDetail.id === groupId) {
                    groupDetail.studentDetails.push(createdStudentDetail);
                  }
                });
              }
            });
          });
          this.#matSnackBar.open('Created student', undefined, {
            duration: 3000,
          });
        }),
        catchError((error) => {
          console.log('[Create Student Failed]', error);
          this.#matSnackBar.open('Error creating student', undefined, {
            duration: 3000,
          });
          return of(null);
        }),
        finalize(() => {
          this.patchState((draft) => {
            draft.updatingConfigurationIds.delete(configurationId);
          });
        }),
        take(1)
      )
      .subscribe();
  }

  patchGroup(
    classroomId: string,
    configurationId: string,
    groupId: string,
    group: Group,
    failureMessage = 'Error updating group'
  ) {
    this.patchState((draft) => {
      draft.updatingConfigurationIds.add(configurationId);
    });
    return this.#httpClient
      .post<PatchGroupResponse>(
        `/api/v1/classrooms/${classroomId}/configurations/${configurationId}/groups/${groupId}`,
        {
          group,
        },
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(({ updatedGroupDetail }) => {
          console.log('[Patched Group]', updatedGroupDetail);
          this.patchState((draft) => {
            draft.configurationDetails.forEach((configurationDetail) => {
              if (configurationDetail.id === configurationId) {
                configurationDetail.groupDetails =
                  configurationDetail.groupDetails.map((g) => {
                    if (g.id === updatedGroupDetail.id) {
                      return updatedGroupDetail;
                    }
                    return g;
                  });
              }
            });
          });
        }),
        catchError((error) => {
          console.log('[Patch Group Failed]', error);
          this.#matSnackBar.open(failureMessage, undefined, {
            duration: 3000,
          });
          return of(null);
        }),
        finalize(() => {
          this.patchState((draft) => {
            draft.updatingConfigurationIds.delete(configurationId);
          });
        }),
        take(1)
      )
      .subscribe();
  }

  public deleteConfiguration(classroomId: string, configurationId: string) {
    this.patchState((draft) => {
      draft.updatingConfigurationIds.add(configurationId);
    });
    return this.#httpClient
      .delete<DeletedConfigurationResponse>(
        `/api/v1/classrooms/${classroomId}/configurations/${configurationId}`,
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(({ deletedConfiguration }) => {
          console.log('[Deleted Configuration]', deletedConfiguration);
          this.patchState((draft) => {
            draft.configurationDetails = draft.configurationDetails.filter(
              ({ id }) => id !== deletedConfiguration.id
            );
            draft.configurations = draft.configurations.filter(
              ({ id }) => id !== deletedConfiguration.id
            );
          });
          this.#matSnackBar.open('Configuration deleted', undefined, {
            duration: 3000,
          });
        }),
        catchError((error) => {
          console.log('[Delete Configuration Failed]', error);
          this.#matSnackBar.open('Error deleting configuration', undefined, {
            duration: 3000,
          });
          return of(null);
        }),
        finalize(() => {
          this.patchState((draft) => {
            draft.updatingConfigurationIds.delete(configurationId);
          });
        }),
        take(1)
      )
      .subscribe();
  }
}
