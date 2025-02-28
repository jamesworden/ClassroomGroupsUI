import { computed, inject, Injectable } from '@angular/core';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { YesNoDialogComponent, YesNoDialogInputs } from '@app/components';
import { ConfigurationViewMode } from '@app/models';
import {
  ClassroomDetail,
  ClassroomsService,
  ColumnDetail,
  Configuration,
  GroupDetail,
} from '@shared/classrooms';
import { combineLatest, Subject } from 'rxjs';
import {
  CreateEditColumnDialogComponent,
  CreateEditColumnDialogInputs,
  CreateEditColumnDialogOutputs,
} from './create-edit-column-dialog/create-edit-column-dialog.component';
import { CreateEditConfigurationDialogComponent } from './create-edit-configuration-dialog/create-edit-configuration-dialog.component';
import {
  CreateEditGroupDialogComponent,
  CreateEditGroupDialogInputs,
  CreateEditGroupDialogOutputs,
} from './create-edit-group-dialog/create-edit-group-dialog.component';
import { AccountsService } from '@shared/accounts';

@Injectable({
  providedIn: 'root',
})
export class ClassroomPageService {
  readonly #matDialog = inject(MatDialog);
  readonly #classroomsService = inject(ClassroomsService);
  readonly #router = inject(Router);
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #accountsService = inject(AccountsService);

  private readonly queryParams = toSignal(this.#activatedRoute.params, {
    initialValue: {
      classroomId: null,
      configurationId: null,
      configurationViewMode: ConfigurationViewMode,
    },
  });

  public readonly classroomId = computed(
    () => this.queryParams().classroomId as string
  );
  public readonly configurationId = computed(
    () => this.queryParams().configurationId as string
  );
  public readonly configurationViewMode = computed(
    () => this.queryParams().configurationViewMode as ConfigurationViewMode
  );

  private readonly configurations = computed(() =>
    this.#classroomsService.select.configurations(this.classroomId())()
  );
  private readonly configurationIds = computed(() =>
    this.#classroomsService.select.configurationIds(this.classroomId())()
  );
  private readonly classroomId$ = toObservable(this.classroomId);
  private readonly configurationId$ = toObservable(this.configurationId);
  private readonly configurations$ = toObservable(this.configurations);

  public readonly scrollToBottom$ = new Subject<void>();

  public readonly reachedColumnLimit = computed(
    () =>
      this.#classroomsService.select.columnDetails(this.configurationId())
        .length >= this.#accountsService.select.maxFieldsPerClassroom()
  );
  public readonly reachedGroupLimit = computed(
    () =>
      this.#classroomsService.select.listGroupDetails(this.configurationId())
        .length >= this.#accountsService.select.maxFieldsPerClassroom()
  );
  public readonly reachedStudentLimit = computed(
    () =>
      this.#classroomsService.select.studentsInConfiguration(
        this.configurationId()
      ).length >= this.#accountsService.select.maxFieldsPerClassroom()
  );
  public readonly reachedClassroomLimit = computed(
    () =>
      this.#classroomsService.select.columnDetails(this.configurationId())
        .length >= this.#accountsService.select.maxFieldsPerClassroom()
  );

  constructor() {
    this.classroomId$
      .pipe(takeUntilDestroyed())
      .subscribe((classroomId) =>
        classroomId
          ? this.#classroomsService.getConfigurations(classroomId)
          : this.#router.navigate(['/classrooms'])
      );
    this.configurations$
      .pipe(takeUntilDestroyed())
      .subscribe(([firstConfiguration]) => {
        const classroomId = this.classroomId();
        const configurationId = this.configurationId();
        if (classroomId && firstConfiguration && !configurationId) {
          this.#router.navigate([
            `/classrooms/${classroomId}/configurations/${firstConfiguration.id}/${ConfigurationViewMode.Edit}`,
          ]);
        }
      });
    combineLatest([this.classroomId$, this.configurationId$])
      .pipe(takeUntilDestroyed())
      .subscribe(([classroomId, configurationId]) => {
        if (classroomId && configurationId) {
          this.#classroomsService.getConfigurationDetail(
            classroomId,
            configurationId
          );
        }
      });
  }

  public selectFirstConfiguration() {
    const [firstConfigurationId] = this.configurationIds();
    if (firstConfigurationId) {
      this.selectConfiguration(firstConfigurationId);
    }
  }

  public setConfigurationViewMode(
    configurationViewMode: ConfigurationViewMode
  ) {
    this.#router.navigate([
      'classrooms',
      this.classroomId(),
      'configurations',
      this.configurationId(),
      configurationViewMode,
    ]);
  }

  public selectConfiguration(configurationId: string) {
    this.#router.navigate([
      `/classrooms/${this.classroomId()}/configurations/${configurationId}/${this.configurationViewMode()}`,
    ]);
  }

  public openDeleteConfigurationDialog(configuration: Configuration) {
    this.#matDialog
      .open(YesNoDialogComponent, {
        restoreFocus: false,
        data: <YesNoDialogInputs>{
          title: 'Delete configuration',
          subtitle: `Are you sure you want to delete configuration '${
            configuration.label
          }' and all of its data?`,
        },
      })
      .afterClosed()
      .subscribe((success) => {
        if (success) {
          this.#classroomsService
            .deleteConfiguration(configuration.classroomId, configuration.id)
            .subscribe(() => this.selectFirstConfiguration());
        }
      });
  }

  public openDeleteClassroomDialog({ label, id }: ClassroomDetail) {
    this.#matDialog
      .open(YesNoDialogComponent, {
        restoreFocus: false,
        data: <YesNoDialogInputs>{
          title: 'Delete classroom',
          subtitle: `Are you sure you want to delete classroom '${
            label
          }' and all of its data?`,
        },
      })
      .afterClosed()
      .subscribe((success) => {
        if (success) {
          this.#classroomsService.deleteClassroom(id).subscribe(() => {
            this.#router.navigate(['/classrooms']);
          });
        }
      });
  }

  public openCreateConfigurationDialog() {
    this.#matDialog
      .open(CreateEditConfigurationDialogComponent, {
        restoreFocus: false,
        data: <CreateEditColumnDialogInputs>{
          title: 'Create configuration',
        },
      })
      .afterClosed()
      .subscribe((outputs?: CreateEditColumnDialogOutputs) => {
        if (outputs) {
          this.#classroomsService
            .createConfiguration(this.classroomId(), outputs.label)
            .subscribe(
              (createdConfiguration) =>
                createdConfiguration?.id &&
                this.selectConfiguration(createdConfiguration.id)
            );
        }
      });
  }

  public openDeleteColumnDialog(columnDetail: ColumnDetail) {
    this.#matDialog
      .open(YesNoDialogComponent, {
        restoreFocus: false,
        data: <YesNoDialogInputs>{
          title: 'Delete classroom',
          subtitle: `Are you sure you want to delete column '${
            columnDetail.label
          }' and all of its related student data?`,
        },
      })
      .afterClosed()
      .subscribe((success) => {
        if (success) {
          this.#classroomsService.deleteColumn(
            this.classroomId(),
            this.configurationId(),
            columnDetail.id
          );
        }
      });
  }

  public openEditColumnDialog(columnDetail: ColumnDetail) {
    this.#matDialog
      .open(CreateEditColumnDialogComponent, {
        restoreFocus: false,
        data: <CreateEditColumnDialogInputs>{
          title: 'Edit column',
          existingData: {
            columnDetail,
          },
        },
      })
      .afterClosed()
      .subscribe((outputs?: CreateEditColumnDialogOutputs) => {
        if (outputs) {
          this.#classroomsService.patchField(
            this.classroomId(),
            columnDetail.fieldId,
            outputs.label
          );
        }
      });
  }

  public openCreateColumnDialog(targetOrdinal?: number) {
    this.#matDialog
      .open(CreateEditColumnDialogComponent, {
        restoreFocus: false,
        data: <CreateEditColumnDialogInputs>{
          title: 'Create column',
        },
      })
      .afterClosed()
      .subscribe((outputs?: CreateEditColumnDialogOutputs) => {
        if (outputs) {
          this.#classroomsService.createColumn(
            this.classroomId(),
            this.configurationId(),
            outputs.label,
            outputs.type,
            targetOrdinal
          );
        }
      });
  }

  public openDeleteGroupDialog(groupDetail: GroupDetail) {
    this.#matDialog
      .open(YesNoDialogComponent, {
        restoreFocus: false,
        data: <YesNoDialogInputs>{
          title: 'Delete locked group',
          subtitle: `Are you sure you want to delete group '${
            groupDetail.label
          }' and all of its data?`,
        },
      })
      .afterClosed()
      .subscribe((success) => {
        if (success) {
          this.#classroomsService.deleteGroup(
            this.classroomId(),
            groupDetail.configurationId,
            groupDetail.id
          );
        }
      });
  }

  public openCreateGroupDialog() {
    this.#matDialog
      .open(CreateEditGroupDialogComponent, {
        restoreFocus: false,
        data: <CreateEditGroupDialogInputs>{
          title: 'Create group',
        },
      })
      .afterClosed()
      .subscribe((outputs?: CreateEditGroupDialogOutputs) => {
        if (outputs) {
          this.#classroomsService
            .createGroup(
              this.classroomId(),
              this.configurationId(),
              outputs.label
            )
            .subscribe(() => this.scrollToBottom$.next());
        }
      });
  }
}
