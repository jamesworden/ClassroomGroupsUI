import { Component, computed, effect, inject, input } from '@angular/core';
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
import {
  CreateEditColumnDialogComponent,
  CreateEditColumnDialogInputs,
  CreateEditColumnDialogOutputs,
} from '../create-edit-column-dialog/create-edit-column-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { CommonModule } from '@angular/common';
import {
  ClassroomsService,
  Column,
  Configuration,
  ConfigurationDetail,
} from '@shared/classrooms';

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
    CommonModule,
    MatTooltipModule,
  ],
  templateUrl: './configuration-panel.component.html',
  styleUrl: './configuration-panel.component.scss',
})
export class ConfigurationPanelComponent {
  readonly #matDialog = inject(MatDialog);
  readonly #matSnackBar = inject(MatSnackBar);
  readonly #classroomsService = inject(ClassroomsService);

  readonly configurationDetail = input<ConfigurationDetail>();

  readonly enabledColumnBadges = computed(() => {
    // const enabledColumnBadges: {
    //   [columnId: string]: number;
    // } = {};
    // let latestSortValue = 1;
    // for (const column of this.viewingColumns() ?? []) {
    //   if (column.enabled) {
    //     enabledColumnBadges[column.id] = latestSortValue;
    //     latestSortValue++;
    //   }
    // }
    // return enabledColumnBadges;
    return [];
  });

  averageScores = false;
  groupingByDivision = false;
  groupingValue = 0;
  updatedDescription = '';
  updatedLabel = '';
  columns: Column[] = [];

  // constructor() {
  //   effect(
  //     () =>
  //       (this.updatedDescription =
  //         this.viewingConfiguration()?.description ?? '')
  //   );
  //   effect(
  //     () => (this.updatedLabel = this.viewingConfiguration()?.label ?? '')
  //   );
  //   effect(() => (this.columns = this.viewingColumns()));
  // }

  toggleGroupingType() {
    this.groupingByDivision = !this.groupingByDivision;
  }

  updateDescription() {
    // const configurationId = this.viewingConfiguration()?.id;
    // if (configurationId) {
    //   // this.#classroomsService.updateConfiguration(configurationId, {
    //   //   description: this.updatedDescription,
    //   // });
    // }
  }

  updateLabel() {
    // const classroomId = this.viewingClassroomId();
    // const configurationId = this.viewingConfigurationId();
    // if (classroomId && configurationId) {
    //   this.#classroomsService.updateConfiguration(classroomId, {
    //     label: this.updatedLabel,
    //   });
    // }
  }

  openDeleteConfigurationModal() {
    // const dialogRef = this.#matDialog.open(YesNoDialogComponent, {
    //   restoreFocus: false,
    //   data: <YesNoDialogInputs>{
    //     title: 'Delete configuration',
    //     subtitle: `Are you sure you want to delete the configuration ${
    //       this.viewingConfiguration()?.label
    //     } and all of it's data?`,
    //   },
    // });
    // dialogRef.afterClosed().subscribe((success) => {
    //   const classroomId = this.viewingClassroomId();
    //   const configurationId = this.viewingConfigurationId();
    //   if (success && classroomId && configurationId) {
    //     this.#classroomsService.deleteConfiguration(configurationId);
    //   }
    // });
  }

  drop(event: CdkDragDrop<Column>) {
    // moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
    // const classroomId = this.viewingClassroomId();
    // const configurationId = this.viewingConfigurationId();
    // if (classroomId && configurationId) {
    //   this.#classroomsService.updateColumns(configurationId, this.columns);
    // }
  }

  openCreateColumnDialog() {
    // const dialogRef = this.#matDialog.open(CreateEditColumnDialogComponent, {
    //   restoreFocus: false,
    //   data: <CreateEditColumnDialogInputs>{
    //     title: 'Create Column',
    //   },
    // });
    // dialogRef
    //   .afterClosed()
    //   .subscribe((outputs?: CreateEditColumnDialogOutputs) => {
    //     if (outputs) {
    //       this.#classroomsService.createField(outputs.field);
    //       this.#matSnackBar.open('Column created', 'Hide', {
    //         duration: 3000,
    //       });
    //     }
    //   });
  }

  toggleColumn(columnId: string) {
    // this.#classroomsService.toggleColumn(columnId);
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
    // this.#classroomsService.createGroup(this.viewingConfigurationId() ?? '');
    // this.#matSnackBar.open('Group created', 'Hide', {
    //   duration: 3000,
    // });
  }
}
