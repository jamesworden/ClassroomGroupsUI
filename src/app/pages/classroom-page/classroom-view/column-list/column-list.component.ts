import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CdkContextMenuTrigger, CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  TemplateRef,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
  ClassroomsService,
  ColumnDetail,
  FieldType,
  GroupDetail,
  MoveColumnDetail,
} from '@shared/classrooms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AccountsService } from '@shared/accounts';
import { MatTooltipModule } from '@angular/material/tooltip';
import { YesNoDialogComponent, YesNoDialogInputs } from '@app/components';
import { MatButtonModule } from '@angular/material/button';
import {
  CreateEditColumnDialogComponent,
  CreateEditColumnDialogInputs,
  CreateEditColumnDialogOutputs,
} from '../configuration-view/create-edit-column-dialog/create-edit-column-dialog.component';
import { ClassroomPageService } from '../../classroom-page.service';

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
    MatTooltipModule,
    MatButtonModule,
  ],
  templateUrl: './column-list.component.html',
  styleUrl: './column-list.component.scss',
})
export class ColumnListComponent {
  readonly #classroomsService = inject(ClassroomsService);
  readonly #matDialog = inject(MatDialog);
  readonly #accountsService = inject(AccountsService);
  readonly #classroomPageService = inject(ClassroomPageService);

  readonly classroomId = input.required<string>();
  readonly configurationId = input.required<string>();
  readonly defaultGroup = input.required<GroupDetail>();
  readonly columnDetails = input.required<ColumnDetail[]>();
  readonly enableDrag = input(true);
  readonly rightHeaderTemplate = input<TemplateRef<ColumnDetail>>();
  readonly roundBottom = input(true);
  readonly enableContextMenu = input(true);

  readonly maxFieldsPerClassroom = computed(() =>
    this.#accountsService.select.maxFieldsPerClassroom()
  );
  readonly reachedColumnLimit = computed(
    () => this.columnDetails().length >= this.maxFieldsPerClassroom()
  );

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

  openDeleteColumnDialog(columnDetail: ColumnDetail) {
    this.#classroomPageService.openDeleteColumnDialog(columnDetail);
  }

  openEditColumnDialog(columnDetail: ColumnDetail) {
    this.#classroomPageService.openEditColumnDialog(columnDetail);
  }

  openCreateColumnDialog(targetOrdinal?: number) {
    this.#classroomPageService.openCreateColumnDialog(targetOrdinal);
  }
}
