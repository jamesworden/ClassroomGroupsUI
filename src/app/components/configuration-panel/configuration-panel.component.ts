import { Component, computed, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  YesNoDialogComponent,
  YesNoDialogInputs,
} from '../yes-no-dialog/yes-no-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { ClassroomColumn, ClassroomField } from '../../models/classroom.models';
import {
  CreateEditColumnDialogComponent,
  CreateEditColumnDialogInputs,
  CreateEditColumnDialogOutputs,
} from '../create-edit-column-dialog/create-edit-column-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { ClassroomsService } from '../../classrooms.service';

@Component({
  selector: 'app-configuration-panel',
  standalone: true,
  imports: [
    MatSlideToggleModule,
    MatInputModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule,
    CdkDrag,
    CdkDropList,
    MatSlideToggleModule,
    MatMenuModule,
    MatBadgeModule,
  ],
  templateUrl: './configuration-panel.component.html',
  styleUrl: './configuration-panel.component.scss',
})
export class ConfigurationPanelComponent {
  readonly #matDialog = inject(MatDialog);
  readonly #matSnackBar = inject(MatSnackBar);
  readonly #classroomsService = inject(ClassroomsService);

  readonly classrooms = this.#classroomsService.classrooms;
  readonly viewingClassroomId = this.#classroomsService.viewingClassroomId;
  readonly viewingClassroom = this.#classroomsService.viewingClassroom;
  readonly viewingConfiguration = this.#classroomsService.viewingConfiguration;
  readonly viewingConfigurationId =
    this.#classroomsService.viewingConfigurationId;

  readonly fieldIdsToFields = computed(() => {
    const fieldIdsToFields: {
      [fieldId: string]: ClassroomField;
    } = {};
    for (const field of this.viewingClassroom()?.fields ?? []) {
      fieldIdsToFields[field.id] = field;
    }
    return fieldIdsToFields;
  });

  readonly enabledColumnBadges = computed(() => {
    const enabledColumnBadges: {
      [columnId: string]: number;
    } = {};
    let latestSortValue = 1;
    for (const column of this.viewingConfiguration()?.columns ?? []) {
      if (column.enabled) {
        enabledColumnBadges[column.id] = latestSortValue;
        latestSortValue++;
      }
    }
    return enabledColumnBadges;
  });

  averageScores = false;
  groupingByDivision = false;
  groupingValue = 0;
  updatedDescription = '';
  updatedLabel = '';
  columns: ClassroomColumn[] = [];

  constructor() {
    effect(
      () =>
        (this.updatedDescription =
          this.viewingConfiguration()?.description ?? '')
    );
    effect(
      () => (this.updatedLabel = this.viewingConfiguration()?.label ?? '')
    );
    effect(
      () => (this.columns = [...(this.viewingConfiguration()?.columns ?? [])])
    );
  }

  toggleGroupingType() {
    this.groupingByDivision = !this.groupingByDivision;
  }

  updateDescription() {
    const classroomId = this.viewingClassroomId();
    const configurationId = this.viewingConfigurationId();
    if (classroomId && configurationId) {
      this.#classroomsService.updateConfigurationDescription(
        classroomId,
        configurationId,
        this.updatedDescription
      );
    }
  }

  updateLabel() {
    const classroomId = this.viewingClassroomId();
    const configurationId = this.viewingConfigurationId();
    if (classroomId && configurationId) {
      this.#classroomsService.updateConfigurationLabel(
        classroomId,
        configurationId,
        this.updatedLabel
      );
    }
  }

  openDeleteConfigurationModal() {
    const dialogRef = this.#matDialog.open(YesNoDialogComponent, {
      restoreFocus: false,
      data: <YesNoDialogInputs>{
        title: 'Delete configuration',
        subtitle: `Are you sure you want to delete the configuration ${
          this.viewingConfiguration()?.label
        } and all of it's data?`,
      },
    });
    dialogRef.afterClosed().subscribe((success) => {
      const classroomId = this.viewingClassroomId();
      const configurationId = this.viewingConfigurationId();
      if (success && classroomId && configurationId) {
        this.#classroomsService.deleteConfiguration(
          classroomId,
          configurationId
        );
      }
    });
  }

  drop(event: CdkDragDrop<ClassroomColumn>) {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
    const classroomId = this.viewingClassroomId();
    const configurationId = this.viewingConfigurationId();
    if (classroomId && configurationId) {
      this.#classroomsService.updateColumns(
        classroomId,
        configurationId,
        this.columns
      );
    }
  }

  openCreateColumnDialog() {
    const dialogRef = this.#matDialog.open(CreateEditColumnDialogComponent, {
      restoreFocus: false,
      data: <CreateEditColumnDialogInputs>{
        title: 'Create Column',
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((outputs?: CreateEditColumnDialogOutputs) => {
        const classroomId = this.viewingClassroomId();
        if (outputs && classroomId) {
          this.#classroomsService.createColumn(
            classroomId,
            outputs.column,
            outputs.field
          );
          this.#matSnackBar.open('Column created', 'Hide', {
            duration: 3000,
          });
        }
      });
  }

  toggleColumn(columnId: string) {
    const classroomId = this.viewingClassroomId();
    const configurationId = this.viewingConfigurationId();
    if (classroomId && configurationId) {
      this.#classroomsService.toggleColumn(
        classroomId,
        configurationId,
        columnId
      );
    }
  }

  setSortAscending(columnId: string) {
    // this.#store.dispatch(
    //   updateColumns({
    //     classroomId: this.viewingClassroomId(),
    //     configurationId: this.viewingConfigurationId(),
    //     columns: {
    //       ...this.columns.map((column) => ({
    //         ...column,
    //         sort:
    //           column.id === columnId
    //             ? ClassroomColumnSort.ASCENDING
    //             : column.sort,
    //       })),
    //     },
    //   })
    // );
  }

  setSortDescending(columnId: string) {
    // this.#store.dispatch(
    //   updateColumns({
    //     classroomId: this.viewingClassroomId(),
    //     configurationId: this.viewingConfigurationId(),
    //     columns: {
    //       ...this.columns.map((column) => ({
    //         ...column,
    //         sort:
    //           column.id === columnId
    //             ? ClassroomColumnSort.DESCENDING
    //             : column.sort,
    //       })),
    //     },
    //   })
    // );
  }

  removeSort(columnId: string) {
    // this.#store.dispatch(
    //   updateColumns({
    //     classroomId: this.viewingClassroomId(),
    //     configurationId: this.viewingConfigurationId(),
    //     columns: {
    //       ...this.columns.map((column) => ({
    //         ...column,
    //         sort:
    //           column.id === columnId ? ClassroomColumnSort.NONE : column.sort,
    //       })),
    //     },
    //   })
    // );
  }

  createGroup() {
    const classroomId = this.viewingClassroomId();
    const configurationId = this.viewingConfigurationId();
    if (classroomId && configurationId) {
      this.#classroomsService.createGroup(classroomId, configurationId);
    }
  }
}
