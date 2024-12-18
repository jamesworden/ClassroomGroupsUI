import {
  computed,
  inject,
  Injectable,
  isDevMode,
  Signal,
  signal,
} from '@angular/core';
import {
  Classroom,
  ClassroomDetail,
  ColumnDetail,
  Configuration,
  ConfigurationDetail,
  CreateColumnResponse,
  CreatedClassroomResponse,
  CreatedConfigurationResponse,
  CreateGroupResponse,
  CreateStudentResponse,
  DeletedClassroomResponse,
  DeletedConfigurationResponse,
  DeleteColumnResponse,
  DeleteGroupResponse,
  DeleteStudentResponse,
  FieldDetail,
  FieldType,
  GetClassroomDetailsResponse,
  GetConfigurationDetailResponse,
  GetConfigurationsResponse,
  GroupDetail,
  MoveColumnResponse,
  MoveStudentResponse,
  PatchClassroomResponse,
  PatchConfigurationResponse,
  PatchFieldResponse,
  PatchGroupResponse,
  SortGroupsResponse,
  StudentField,
  UpsertStudentFieldResponse,
} from './models';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  finalize,
  map,
  of,
  take,
  tap,
} from 'rxjs';
import { getConfigurationFromDetail } from './logic/get-model-from-detail';
import { MatSnackBar } from '@angular/material/snack-bar';
import { create } from 'mutative';
import { MoveStudentDetail } from './models/move-student-detail';
import { MoveColumnDetail } from './models/move-column-detail';
import { warnOnValueMismatch } from './logic/warn-on-value-mismatch';

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

  public readonly configuration = (
    classroomId?: string,
    configurationId?: string
  ) =>
    computed(() =>
      this.configurations(classroomId)()?.find((c) => c.id == configurationId)
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
        ? this._state().loadingConfigurationDetailIds.has(configurationId)
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

  public readonly listGroupDetails = (configurationId?: string) =>
    computed(() =>
      this.groupDetails(configurationId)().filter(
        (g) =>
          g.id !== this.configurationDetail(configurationId)()?.defaultGroupId
      )
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

  public readonly configurationIds = (classroomId?: string) =>
    computed(() => this.configurations(classroomId)().map(({ id }) => id));

  public readonly defaultGroup = (configurationId?: string) =>
    computed(() => {
      const configurationDetail = this.configurationDetail(configurationId)();
      return configurationDetail?.groupDetails.find(
        (g) => g.id === configurationDetail.defaultGroupId
      );
    });

  public readonly studentsInConfiguration = (configurationId?: string) =>
    computed(
      () =>
        this.configurationDetail(configurationId)()?.groupDetails?.flatMap(
          (g) => g.studentDetails
        ) || []
    );
}

interface ClassroomsState {
  classroomDetails: ClassroomDetail[];
  configurationDetails: ConfigurationDetail[];
  configurations: Configuration[];
  classroomsLoading: boolean;
  configurationsLoading: boolean;
  loadingConfigurationDetailIds: Set<string>;
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
    loadingConfigurationDetailIds: new Set<string>(),
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
      draft.loadingConfigurationDetailIds.add(configurationId);
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
            const existingDetail = draft.configurationDetails.find(
              (c) => c.id === configurationDetail.id
            );

            isDevMode() &&
              existingDetail &&
              warnOnValueMismatch(existingDetail, configurationDetail);

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
            draft.loadingConfigurationDetailIds.delete(configurationId);
          });
        }),
        take(1)
      )
      .subscribe();
  }

  public createClassroom(label?: string, description?: string) {
    this.patchState((draft) => {
      draft.classroomsLoading = true;
    });
    const classroomDetail$ = this.#httpClient
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
          this.#matSnackBar.open('Error creating classroom', undefined, {
            duration: 3000,
          });
          return of(null);
        }),
        finalize(() => {
          this.patchState((draft) => {
            draft.classroomsLoading = false;
          });
        }),
        map((res) => res?.createdClassroomDetail),
        take(1)
      );
    const value$ = new BehaviorSubject<ClassroomDetail | undefined>(undefined);
    classroomDetail$.subscribe((classroomDetail) =>
      value$.next(classroomDetail)
    );
    return value$.asObservable();
  }

  public deleteClassroom(classroomId: string) {
    this.patchState((draft) => {
      draft.classroomsLoading = true;
      draft.updatingClassroomIds.add(classroomId);
    });
    const deletedClassroom$ = this.#httpClient
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
            draft.updatingClassroomIds.delete(classroomId);
          });
        }),
        map((res) => res?.deletedClassroom),
        take(1)
      );
    const value$ = new BehaviorSubject<Classroom | undefined>(undefined);
    deletedClassroom$.subscribe((deletedClassroom) =>
      value$.next(deletedClassroom)
    );
    return value$.asObservable();
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
    configurationId: string,
    label: string,
    description: string,
    failureMessage = 'Error updating configuration'
  ) {
    const getUpdateStrategy =
      (configurationDetail: ConfigurationDetail) =>
      (draft: ClassroomsState) => {
        draft.configurationDetails = draft.configurationDetails.map((cd) =>
          cd.id === configurationId ? configurationDetail : cd
        );
        draft.configurations = draft.configurations.map((c) =>
          c.id === configurationId
            ? getConfigurationFromDetail(configurationDetail)
            : c
        );
      };
    this.patchState((draft) => {
      draft.updatingConfigurationIds.add(configurationId);
      const configurationDetail = this.getPatchedConfigurationDetail(
        draft,
        configurationId,
        label,
        description
      );
      getUpdateStrategy(configurationDetail)(draft);
    });
    return this.#httpClient
      .patch<PatchConfigurationResponse>(
        `/api/v1/classrooms/${classroomId}/configurations/${configurationId}`,
        {
          label,
          description,
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
          this.patchState(getUpdateStrategy(patchedConfigurationDetail));
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
            draft.updatingConfigurationIds.delete(configurationId);
          });
        }),
        take(1)
      )
      .subscribe();
  }

  public patchClassroom(
    classroomId: string,
    label: string,
    description: string,
    failureMessage = 'Error updating classroom'
  ) {
    const getUpdateStrategy =
      (classroomDetail: ClassroomDetail) => (draft: ClassroomsState) => {
        draft.classroomDetails = draft.classroomDetails.map((cd) =>
          cd.id === classroomDetail.id ? classroomDetail : cd
        );
      };
    this.patchState((draft) => {
      draft.updatingClassroomIds.add(classroomId);
      const classroomDetail = this.getPatchedClassroomDetail(
        draft,
        classroomId,
        label,
        description
      );
      getUpdateStrategy(classroomDetail)(draft);
    });
    return this.#httpClient
      .patch<PatchClassroomResponse>(
        `/api/v1/classrooms/${classroomId}`,
        {
          label,
          description,
        },
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(({ patchedClassroomDetail }) => {
          console.log('[Patched Classroom Detail]', patchedClassroomDetail);
          this.patchState(getUpdateStrategy(patchedClassroomDetail));
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
            draft.updatingClassroomIds.delete(classroomId);
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
    this.patchState((draft) => {
      draft.updatingConfigurationIds.add(configurationId);
    });
    return this.#httpClient
      .delete<DeleteGroupResponse>(
        `/api/v1/classrooms/${classroomId}/configurations/${configurationId}/groups/${groupId}`,
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(({ deletedGroup, updatedDefaultGroup }) => {
          console.log('[Deleted Group]', deletedGroup);
          this.patchState((draft) => {
            draft.configurationDetails.forEach((configurationDetail) => {
              if (configurationDetail.id === configurationId) {
                configurationDetail.groupDetails =
                  configurationDetail.groupDetails
                    .filter((g) => g.id !== deletedGroup.id)
                    .map((groupDetail) =>
                      groupDetail.id === updatedDefaultGroup.id
                        ? updatedDefaultGroup
                        : groupDetail
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
        finalize(() => {
          this.patchState((draft) => {
            draft.updatingConfigurationIds.delete(configurationId);
          });
        }),
        take(1)
      )
      .subscribe();
  }

  public createStudent(
    classroomId: string,
    configurationId: string,
    groupId?: string
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
              configurationDetail.groupDetails.forEach((groupDetail) => {
                if (
                  groupDetail.id ===
                  (groupId || configurationDetail.defaultGroupId)
                ) {
                  groupDetail.studentDetails.push(createdStudentDetail);
                }
              });
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
    label: string,
    failureMessage = 'Error updating group'
  ) {
    const getUpdateStrategy =
      (groupDetail: GroupDetail) => (draft: ClassroomsState) => {
        draft.configurationDetails.forEach((configurationDetail) => {
          if (configurationDetail.id === configurationId) {
            configurationDetail.groupDetails =
              configurationDetail.groupDetails.map((g) => {
                if (g.id === groupDetail.id) {
                  return groupDetail;
                }
                return g;
              });
          }
        });
      };
    this.patchState((draft) => {
      draft.updatingConfigurationIds.add(configurationId);
      const groupDetail = this.getPatchedGroupDetail(
        draft,
        classroomId,
        configurationId,
        groupId,
        label
      );
      getUpdateStrategy(groupDetail)(draft);
    });
    return this.#httpClient
      .patch<PatchGroupResponse>(
        `/api/v1/classrooms/${classroomId}/configurations/${configurationId}/groups/${groupId}`,
        {
          label,
        },
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(({ updatedGroupDetail }) => {
          console.log('[Patched Group]', updatedGroupDetail);
          this.patchState(getUpdateStrategy(updatedGroupDetail));
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
    const deletedConfiguration$ = this.#httpClient
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
        map((res) => res?.deletedConfiguration),
        take(1)
      );
    const value$ = new BehaviorSubject<Configuration | undefined>(undefined);
    deletedConfiguration$.subscribe((classroomDetail) =>
      value$.next(classroomDetail)
    );
    return value$.asObservable();
  }

  public createColumn(
    classroomId: string,
    configurationId: string,
    label: string,
    type: FieldType
  ) {
    this.patchState((draft) => {
      draft.updatingClassroomIds.add(classroomId);
    });
    return this.#httpClient
      .post<CreateColumnResponse>(
        `/api/v1/classrooms/${classroomId}/configurations/${configurationId}/columns`,
        {
          label,
          type,
        },
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(({ createdColumnDetail, createdFieldDetail }) => {
          console.log('[Created Column]', createdColumnDetail);
          console.log('[Created Field]', createdFieldDetail);
          this.patchState((draft) => {
            draft.configurationDetails.forEach((configurationDetail) => {
              if (configurationDetail.classroomId === classroomId) {
                configurationDetail.columnDetails.push(createdColumnDetail);
              }
            });
            draft.classroomDetails.forEach((classroomDetail) => {
              if (classroomDetail.id === classroomId) {
                classroomDetail.fieldDetails.push(createdFieldDetail);
              }
            });
          });
          this.#matSnackBar.open('Column created', undefined, {
            duration: 3000,
          });
        }),
        catchError((error) => {
          console.log('[Create Column Failed]', error);
          this.#matSnackBar.open('Error creating column', undefined, {
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

  public upsertStudentField(classroomId: string, studentField: StudentField) {
    const getUpdateStrategy = (value: string) => (draft: ClassroomsState) => {
      draft.configurationDetails.forEach((configurationDetail) => {
        configurationDetail.groupDetails.forEach((groupDetail) => {
          groupDetail.studentDetails.forEach((studentDetail) => {
            if (studentDetail.id === studentField.studentId) {
              studentDetail.fieldIdsToValues[studentField.fieldId] = value;
            }
          });
        });
      });
    };
    this.patchState((draft) => {
      draft.updatingClassroomIds.add(classroomId);
      getUpdateStrategy(studentField.value)(draft);
    });
    return this.#httpClient
      .put<UpsertStudentFieldResponse>(
        `/api/v1/classrooms/${classroomId}/students/${studentField.studentId}/fields/${studentField.fieldId}`,
        { value: studentField.value },
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(({ upsertedValue }) => {
          console.log('[Upserted Value]', upsertedValue);
          this.patchState(getUpdateStrategy(upsertedValue));
        }),
        catchError((error) => {
          console.log('[Upsert Student Field Failed]', error);
          this.#matSnackBar.open('Error upserting student field', undefined, {
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

  public deleteStudent(classroomId: string, studentId: string) {
    this.patchState((draft) => {
      draft.updatingClassroomIds.add(classroomId);
    });
    this.#httpClient
      .delete<DeleteStudentResponse>(
        `/api/v1/classrooms/${classroomId}/students/${studentId}`,
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(({ deletedStudent, updatedGroupDetails }) => {
          console.log('[Deleted Student]', deletedStudent);
          console.log('[Updated Groups]', updatedGroupDetails);
          this.patchState((draft) => {
            draft.configurationDetails.forEach((configuration) => {
              configuration.groupDetails = configuration.groupDetails.map(
                (groupDetail) => {
                  for (const updatedGroup of updatedGroupDetails) {
                    if (updatedGroup.id === groupDetail.id) {
                      return updatedGroup;
                    }
                  }
                  return groupDetail;
                }
              );
            });
          });
          this.#matSnackBar.open('Deleted student', undefined, {
            duration: 3000,
          });
        }),
        catchError((error) => {
          console.log('[Delete Student Failed]', error);
          this.#matSnackBar.open('Error deleting student', undefined, {
            duration: 3000,
          });
          return of(null);
        }),
        finalize(() => {
          this.patchState((draft) => {
            draft.updatingClassroomIds.delete(classroomId);
          });
        }),
        map((res) => res?.deletedStudent),
        take(1)
      )
      .subscribe();
  }

  public deleteColumn(
    classroomId: string,
    configurationId: string,
    columnId: string
  ) {
    this.patchState((draft) => {
      draft.updatingClassroomIds.add(classroomId);
    });
    this.#httpClient
      .delete<DeleteColumnResponse>(
        `/api/v1/classrooms/${classroomId}/configurations/${configurationId}/columns/${columnId}`,
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(
          ({ deletedColumn, deletedField, configurationIdsColumnDetails }) => {
            console.log('[Deleted Column]', deletedColumn);
            console.log('[Deleted Field]', deletedField);
            console.log(
              '[Configuration Ids To Column Details]',
              configurationIdsColumnDetails
            );

            this.patchState((draft) => {
              draft.classroomDetails.forEach((c) => {
                c.fieldDetails = c.fieldDetails.filter(
                  (f) => f.id !== deletedField.id
                );
              });
              draft.configurationDetails.forEach((c) => {
                c.columnDetails = configurationIdsColumnDetails[c.id];
                c.groupDetails.forEach((g) => {
                  g.studentDetails.forEach((s) => {
                    delete s.fieldIdsToValues[deletedField.id];
                  });
                });
              });
            });
            this.#matSnackBar.open('Deleted column', undefined, {
              duration: 3000,
            });
          }
        ),
        catchError((error) => {
          console.log('[Delete Column Failed]', error);
          this.#matSnackBar.open('Error deleting column', undefined, {
            duration: 3000,
          });
          return of(null);
        }),
        finalize(() => {
          this.patchState((draft) => {
            draft.updatingClassroomIds.delete(classroomId);
          });
        }),
        map((res) => res?.deletedColumn),
        take(1)
      )
      .subscribe();
  }

  sortGroups(
    classroomId: string,
    configurationId: string,
    sortedGroupIds: string[]
  ) {
    return this.#httpClient
      .post<SortGroupsResponse>(
        `/api/v1/classrooms/${classroomId}/configurations/${configurationId}/sort-groups`,
        {
          sortedGroupIds,
        },
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(({ sortedGroupDetails }) => {
          console.log('[Sorted Groups]', sortedGroupDetails);
          this.patchState((draft) => {
            draft.configurationDetails.forEach((detail) => {
              if (detail.id === configurationId) {
                detail.groupDetails = sortedGroupDetails;
              }
            });
          });
        }),
        catchError((error) => {
          console.log('[Sort Groups Failed]', error);
          this.#matSnackBar.open('Error sorting groups', undefined, {
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

  moveStudent(
    classroomId: string,
    configurationId: string,
    moveStudentDetail: MoveStudentDetail
  ) {
    return this.#httpClient
      .post<MoveStudentResponse>(
        `/api/v1/classrooms/${classroomId}/configurations/${configurationId}/move-student`,
        {
          moveStudentDetail,
        },
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(({ updatedGroupDetails }) => {
          console.log('[Updated Group Details]', updatedGroupDetails);
          this.patchState((draft) => {
            draft.configurationDetails.forEach((detail) => {
              if (detail.id === configurationId) {
                detail.groupDetails = detail.groupDetails.map((groupDetail) => {
                  for (const updatedGroupDetail of updatedGroupDetails) {
                    if (groupDetail.id === updatedGroupDetail.id) {
                      return updatedGroupDetail;
                    }
                  }
                  return groupDetail;
                });
              }
            });
          });
        }),
        catchError((error) => {
          console.log('[Move Student Failed]', error);
          this.#matSnackBar.open('Error moving student', undefined, {
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

  moveColumn(
    classroomId: string,
    configurationId: string,
    moveColumnDetail: MoveColumnDetail
  ) {
    return this.#httpClient
      .post<MoveColumnResponse>(
        `/api/v1/classrooms/${classroomId}/configurations/${configurationId}/move-column`,
        {
          moveColumnDetail,
        },
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(({ updatedColumnDetails }) => {
          console.log('[Updated Column Details]', updatedColumnDetails);
          this.patchState((draft) => {
            draft.configurationDetails.forEach((detail) => {
              if (detail.id === configurationId) {
                detail.columnDetails = updatedColumnDetails;
              }
            });
          });
        }),
        catchError((error) => {
          console.log('[Move Column Failed]', error);
          this.#matSnackBar.open('Error moving column', undefined, {
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

  patchField(
    classroomId: string,
    fieldId: string,
    label: string,
    failureMessage = 'Error updating column'
  ) {
    const getUpdateStrategy =
      (fieldDetail: FieldDetail) => (draft: ClassroomsState) => {
        draft.configurationDetails.forEach((configurationDetail) => {
          configurationDetail.columnDetails =
            configurationDetail.columnDetails.map((c) => {
              if (c.fieldId === fieldDetail.id) {
                c.label = fieldDetail.label;
              }
              return c;
            });
        });
        draft.classroomDetails.forEach((c) => {
          c.fieldDetails = c.fieldDetails.map((f) => {
            if (f.id === fieldDetail.id) {
              return fieldDetail;
            }
            return f;
          });
        });
      };
    this.patchState((draft) => {
      draft.updatingClassroomIds.add(classroomId);
      const fieldDetail = this.getPatchedFieldDetail(
        draft,
        classroomId,
        fieldId,
        label
      );
      getUpdateStrategy(fieldDetail)(draft);
    });
    return this.#httpClient
      .patch<PatchFieldResponse>(
        `/api/v1/classrooms/${classroomId}/fields/${fieldId}`,
        {
          label,
        },
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(({ updatedFieldDetail }) => {
          console.log('[Patched Field]', updatedFieldDetail);
          this.patchState(getUpdateStrategy(updatedFieldDetail));
        }),
        catchError((error) => {
          console.log('[Patch Field Failed]', error);
          this.#matSnackBar.open(failureMessage, undefined, {
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

  getPatchedConfigurationDetail(
    draft: ClassroomsState,
    configurationId: string,
    label: string,
    description: string
  ): ConfigurationDetail {
    const existingDetail = draft.configurationDetails.find(
      (c) => c.id === configurationId
    );
    if (!existingDetail) {
      throw new Error(
        `Could not find existing configuration with id ${configurationId}`
      );
    }
    return {
      ...existingDetail,
      label,
      description,
    };
  }

  getPatchedClassroomDetail(
    draft: ClassroomsState,
    classroomId: string,
    label: string,
    description: string
  ): ClassroomDetail {
    const existingDetail = draft.classroomDetails.find(
      (c) => c.id === classroomId
    );
    if (!existingDetail) {
      throw new Error(
        `Could not find existing classroom with id ${classroomId}`
      );
    }
    return {
      ...existingDetail,
      label,
      description,
    };
  }

  getPatchedGroupDetail(
    draft: ClassroomsState,
    classroomId: string,
    configurationId: string,
    groupId: string,
    label: string
  ): GroupDetail {
    const existingDetail = draft.configurationDetails
      .find((c) => c.classroomId === classroomId && c.id === configurationId)
      ?.groupDetails.find((g) => g.id === groupId);
    if (!existingDetail) {
      throw new Error(`Could not find existing group with id ${groupId}`);
    }
    return {
      ...existingDetail,
      label,
    };
  }

  getPatchedColumnDetail(
    draft: ClassroomsState,
    classroomId: string,
    configurationId: string,
    columnId: string,
    label: string
  ): ColumnDetail {
    const existingDetail = draft.configurationDetails
      .find((c) => c.classroomId === classroomId && c.id === configurationId)
      ?.columnDetails.find((c) => c.id === columnId);
    if (!existingDetail) {
      throw new Error(`Could not find existing group with id ${columnId}`);
    }
    return {
      ...existingDetail,
      label,
    };
  }

  getPatchedFieldDetail(
    draft: ClassroomsState,
    classroomId: string,
    fieldId: string,
    label: string
  ): FieldDetail {
    const existingDetail = draft.classroomDetails
      .find((c) => c.id === classroomId)
      ?.fieldDetails.find((f) => f.id === fieldId);
    if (!existingDetail) {
      throw new Error(`Could not find existing group with id ${fieldId}`);
    }
    return {
      ...existingDetail,
      label,
    };
  }
}
