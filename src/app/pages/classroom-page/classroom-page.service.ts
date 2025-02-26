import { computed, inject, Injectable } from '@angular/core';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CreateEditConfigurationDialogComponent,
  YesNoDialogComponent,
  YesNoDialogInputs,
} from '@app/components';
import { ConfigurationViewMode } from '@app/models';
import {
  ClassroomDetail,
  ClassroomsService,
  Configuration,
} from '@shared/classrooms';
import { combineLatest } from 'rxjs';
import {
  CreateEditColumnDialogInputs,
  CreateEditColumnDialogOutputs,
} from './configuration-view/create-edit-column-dialog/create-edit-column-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class ClassroomPageService {
  readonly #matDialog = inject(MatDialog);
  readonly #classroomsService = inject(ClassroomsService);
  readonly #router = inject(Router);
  readonly #activatedRoute = inject(ActivatedRoute);

  readonly queryParams = toSignal(this.#activatedRoute.params, {
    initialValue: {
      classroomId: null,
      configurationId: null,
      configurationViewMode: ConfigurationViewMode,
    },
  });
  readonly classroomId = computed(
    () => this.queryParams().classroomId as string
  );
  readonly configurationId = computed(
    () => this.queryParams().configurationId as string
  );
  readonly configurationViewMode = computed(
    () => this.queryParams().configurationViewMode as ConfigurationViewMode
  );
  readonly configurations = computed(() =>
    this.#classroomsService.select.configurations(this.classroomId())()
  );
  readonly configurationIds = computed(() =>
    this.#classroomsService.select.configurationIds(this.classroomId())()
  );
  readonly classroomId$ = toObservable(this.classroomId);
  readonly configurationId$ = toObservable(this.configurationId);
  readonly configurations$ = toObservable(this.configurations);

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

  openDeleteClassroomDialog({ label, id }: ClassroomDetail) {
    const dialogRef = this.#matDialog.open(YesNoDialogComponent, {
      restoreFocus: false,
      data: <YesNoDialogInputs>{
        title: 'Delete classroom',
        subtitle: `Are you sure you want to delete classroom '${
          label
        }' and all of its data?`,
      },
    });
    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        this.#classroomsService.deleteClassroom(id).subscribe(() => {
          this.#router.navigate(['/classrooms']);
        });
      }
    });
  }

  selectFirstConfiguration() {
    const [firstConfigurationId] = this.configurationIds();
    if (firstConfigurationId) {
      this.selectConfiguration(firstConfigurationId);
    }
  }

  selectConfiguration(configurationId: string) {
    this.#router.navigate([
      `/classrooms/${this.classroomId()}/configurations/${configurationId}/${this.configurationViewMode()}`,
    ]);
  }

  openDeleteConfigurationModal(configuration: Configuration) {
    const dialogRef = this.#matDialog.open(YesNoDialogComponent, {
      restoreFocus: false,
      data: <YesNoDialogInputs>{
        title: 'Delete configuration',
        subtitle: `Are you sure you want to delete configuration '${
          configuration.label
        }' and all of its data?`,
      },
    });
    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        this.#classroomsService
          .deleteConfiguration(configuration.classroomId, configuration.id)
          .subscribe(() => this.selectFirstConfiguration());
      }
    });
  }

  setConfigurationViewMode(configurationViewMode: ConfigurationViewMode) {
    this.#router.navigate([
      'classrooms',
      this.classroomId(),
      'configurations',
      this.configurationId(),
      configurationViewMode,
    ]);
  }

  openCreateConfigurationDialog() {
    const dialogRef = this.#matDialog.open(
      CreateEditConfigurationDialogComponent,
      {
        restoreFocus: false,
        data: <CreateEditColumnDialogInputs>{
          title: 'Create configuration',
        },
      }
    );
    dialogRef
      .afterClosed()
      .subscribe((outputs?: CreateEditColumnDialogOutputs) => {
        if (outputs) {
          this.#classroomsService.createConfiguration(
            this.classroomId(),
            outputs.label
          );
        }
      });
  }
}
