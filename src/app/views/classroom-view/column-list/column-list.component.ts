import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CdkContextMenuTrigger, CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
  ClassroomsService,
  ColumnDetail,
  FieldType,
  GroupDetail,
  MoveColumnDetail,
} from '@shared/classrooms';
import {
  CreateEditColumnDialogComponent,
  CreateEditColumnDialogInputs,
  CreateEditColumnDialogOutputs,
} from '../configuration-view/create-edit-column-dialog/create-edit-column-dialog.component';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-column-list',
  imports: [
    CommonModule,
    CdkContextMenuTrigger,
    CdkMenu,
    CdkMenuItem,
    CdkDrag,
    CdkDropList,
    MatIconModule,
    MatCheckboxModule,
    MatSlideToggleModule,
  ],
  templateUrl: './column-list.component.html',
  styleUrl: './column-list.component.scss',
})
export class ColumnListComponent {
  readonly #classroomsService = inject(ClassroomsService);
  readonly #matDialog = inject(MatDialog);

  readonly classroomId = input.required<string>();
  readonly configurationId = input.required<string>();
  readonly defaultGroup = input.required<GroupDetail>();
  readonly columnDetails = input.required<ColumnDetail[]>();
  readonly enableDrag = input(true);
  readonly rightHeaderTemplate = input<TemplateRef<ColumnDetail>>();
  readonly roundBottom = input(true);
  readonly enableContextMenu = input(true);

  readonly FieldType = FieldType;

  editingColumnDetails: ColumnDetail[] = [];

  constructor() {
    effect(() => (this.editingColumnDetails = this.columnDetails()));
  }

  drop(event: CdkDragDrop<ColumnDetail>) {
    const column = event.item.data as ColumnDetail;
    const classroomId = this.classroomId();
    const configurationId = this.configurationId();

    moveItemInArray(
      this.editingColumnDetails,
      event.previousIndex,
      event.currentIndex
    );

    const moveColumnDetail: MoveColumnDetail = {
      currIndex: event.currentIndex,
      prevIndex: event.previousIndex,
    };

    this.#classroomsService.moveColumn(
      classroomId,
      configurationId,
      column.id,
      moveColumnDetail
    );
  }

  deleteColumn(columnId: string) {
    this.#classroomsService.deleteColumn(
      this.classroomId(),
      this.configurationId(),
      columnId
    );
  }

  openEditColumnDialog(columnDetail: ColumnDetail) {
    const dialogRef = this.#matDialog.open(CreateEditColumnDialogComponent, {
      restoreFocus: false,
      data: <CreateEditColumnDialogInputs>{
        title: 'Edit Column',
        existingData: {
          columnDetail,
        },
      },
    });
    dialogRef
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
}
