import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  ViewChild,
} from '@angular/core';
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
  ColumnDetail,
  ConfigurationDetail,
} from '@shared/classrooms';
import { MoveColumnDetail } from 'shared/classrooms/lib/models/move-column-detail';

@Component({
  selector: 'app-configuration-panel-top',
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
  templateUrl: './configuration-panel-top.component.html',
  styleUrl: './configuration-panel-top.component.scss',
})
export class ConfigurationPanelTopComponent implements AfterViewInit {
  readonly #matDialog = inject(MatDialog);
  readonly #matSnackBar = inject(MatSnackBar);
  readonly #classroomsService = inject(ClassroomsService);

  @ViewChild('toolbar')
  toolbar!: ElementRef<HTMLDivElement>;

  readonly configurationDetail = input<ConfigurationDetail>();
  readonly columnDetails = input<ColumnDetail[]>([]);

  readonly labelUpdated = output<string>();
  readonly descriptionUpdated = output<string>();
  readonly deletedConfiguration = output();

  readonly classroomId = computed(
    () => this.configurationDetail()?.classroomId
  );
  readonly configurationId = computed(() => this.configurationDetail()?.id);
  readonly configurations = computed(() =>
    this.#classroomsService.select.configurations(this.classroomId())()
  );
  readonly configurationLabel = computed(
    () => this.configurationDetail()?.label ?? ''
  );
  readonly configurationDescription = computed(
    () => this.configurationDetail()?.description ?? ''
  );
  readonly defaultGroup = computed(() =>
    this.#classroomsService.select.defaultGroup(this.configurationId())()
  );
  readonly enabledColumnBadges = computed(() => {
    const enabledColumnBadges: {
      [columnId: string]: number;
    } = {};
    let latestSortValue = 1;
    for (const column of this.columnDetails() ?? []) {
      if (column.enabled) {
        enabledColumnBadges[column.id] = latestSortValue;
        latestSortValue++;
      }
    }
    return enabledColumnBadges;
  });

  groupingByDivision = false;
  groupingValue = 0;
  columns: ColumnDetail[] = [];
  editingFieldId?: string;
  editingField = '';
  readonly toolbarHeight = signal<number>(0);

  constructor() {
    effect(() => (this.columns = this.columnDetails()));
  }

  ngAfterViewInit() {
    const observer = new ResizeObserver(() => {
      if (this.toolbar) {
        this.toolbarHeight.set(this.toolbar.nativeElement.offsetHeight);
      }
    });
    observer.observe(this.toolbar.nativeElement);
  }

  toggleGroupingType() {
    this.groupingByDivision = !this.groupingByDivision;
  }

  updateDescription(event: Event) {
    const description = (event.target as HTMLInputElement).value;
    this.descriptionUpdated.emit(description);
  }

  updateLabel(event: Event) {
    const label = (event.target as HTMLInputElement).value;
    this.labelUpdated.emit(label);
  }

  openDeleteConfigurationModal() {
    const dialogRef = this.#matDialog.open(YesNoDialogComponent, {
      restoreFocus: false,
      data: <YesNoDialogInputs>{
        title: 'Delete configuration',
        subtitle: `Are you sure you want to delete the configuration ${
          this.configurationDetail()?.label
        } and all of it's data?`,
      },
    });
    dialogRef.afterClosed().subscribe((success) => {
      const classroomId = this.classroomId();
      const configurationId = this.configurationId();
      if (success && classroomId && configurationId) {
        this.#classroomsService
          .deleteConfiguration(classroomId, configurationId)
          .subscribe(() => this.deletedConfiguration.emit());
      }
    });
  }

  startEditing(fieldId: string) {
    this.editingFieldId = fieldId;
    this.editingField =
      this.columnDetails().find((c) => c.fieldId === fieldId)?.label ?? '';
  }

  saveEdits() {
    const classroomId = this.classroomId();
    const column = this.columnDetails().find(
      (c) => c.fieldId === this.editingFieldId
    );
    if (classroomId && column) {
      this.#classroomsService.patchField(
        classroomId,
        column.fieldId,
        this.editingField
      );
    }
    this.editingFieldId = undefined;
    this.editingField = '';
  }

  drop(event: CdkDragDrop<Column>) {
    const column = event.item.data as ColumnDetail;
    const classroomId = this.classroomId();
    const configurationId = this.configurationId();
    if (!classroomId || !configurationId || !column) {
      return;
    }

    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);

    const moveColumnDetail: MoveColumnDetail = {
      columnId: column.id,
      currIndex: event.currentIndex,
      prevIndex: event.previousIndex,
    };

    this.#classroomsService.moveColumn(
      classroomId,
      configurationId,
      moveColumnDetail
    );
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
        const classroomId = this.classroomId();
        const configurationId = this.configurationId();
        if (outputs && classroomId && configurationId) {
          this.#classroomsService.createColumn(
            classroomId,
            configurationId,
            outputs.label,
            outputs.type
          );
        }
      });
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
    const classroomId = this.classroomId();
    const configurationId = this.configurationId();
    if (classroomId && configurationId) {
      this.#classroomsService.createGroup(classroomId, configurationId);
    }
  }

  createStudent() {
    const classroomId = this.classroomId();
    const configurationId = this.configurationId();
    if (classroomId && configurationId) {
      this.#classroomsService.createStudent(classroomId, configurationId);
    }
  }
}
