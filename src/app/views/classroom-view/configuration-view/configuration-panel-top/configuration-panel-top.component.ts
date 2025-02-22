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
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import {
  ClassroomsService,
  Column,
  ColumnDetail,
  ConfigurationDetail,
  GroupDetail,
  MoveColumnDetail,
  StudentGroupingStrategy,
} from '@shared/classrooms';
import { AccountsService } from '@shared/accounts';
import { CdkContextMenuTrigger, CdkMenu, CdkMenuItem } from '@angular/cdk/menu';

@Component({
  selector: 'app-configuration-panel-top',
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
    CommonModule,
    MatTooltipModule,
    CdkContextMenuTrigger,
    CdkMenu,
    CdkMenuItem,
  ],
  templateUrl: './configuration-panel-top.component.html',
  styleUrl: './configuration-panel-top.component.scss',
})
export class ConfigurationPanelTopComponent implements AfterViewInit {
  readonly #matDialog = inject(MatDialog);
  readonly #classroomsService = inject(ClassroomsService);
  readonly #accountsService = inject(AccountsService);

  @ViewChild('toolbar')
  toolbar!: ElementRef<HTMLDivElement>;

  readonly configurationDetail = input.required<ConfigurationDetail>();
  readonly columnDetails = input.required<ColumnDetail[]>();
  readonly defaultGroup = input.required<GroupDetail>();
  readonly collapsed = input(false);

  readonly labelUpdated = output<string>();
  readonly descriptionUpdated = output<string>();
  readonly deletedConfiguration = output<string>();

  readonly account = this.#accountsService.select.account;

  readonly toolbarHeight = signal<number>(0);

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
  readonly listGroupDetails = computed(() =>
    this.#classroomsService.select.listGroupDetails(this.configurationId())()
  );
  readonly studentsInConfiguration = computed(() =>
    this.#classroomsService.select.studentsInConfiguration(
      this.configurationId()
    )()
  );
  readonly classroomUpdating = computed(() =>
    this.#classroomsService.select.classroomUpdating(this.classroomId())()
  );

  readonly StudentGroupingStrategy = StudentGroupingStrategy;

  groupingByDivision = false;
  groupingValue = 0;
  columns: ColumnDetail[] = [];
  editingFieldId?: string;
  editingField = '';

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
    const configurationId = this.configurationId();
    if (configurationId) {
      this.deletedConfiguration.emit(configurationId);
    }
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

  deleteColumn(columnId: string) {
    const classroomId = this.classroomId();
    const configurationId = this.configurationId();
    if (classroomId && configurationId) {
      this.#classroomsService.deleteColumn(
        classroomId,
        configurationId,
        columnId
      );
    }
  }

  groupStudents(studentGroupingStrategy: StudentGroupingStrategy) {
    const classroomId = this.classroomId();
    const configurationId = this.configurationId();
    if (classroomId && configurationId) {
      const studentsPerGroup = this.groupingByDivision
        ? undefined
        : this.groupingValue;
      const numberOfGroups = this.groupingByDivision
        ? this.groupingValue
        : undefined;

      this.#classroomsService.groupStudents(
        classroomId,
        configurationId,
        studentGroupingStrategy,
        numberOfGroups,
        studentsPerGroup
      );
    }
  }
}
