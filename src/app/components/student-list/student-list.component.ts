import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ClassroomsService,
  FieldType,
  StudentDetail,
} from '@shared/classrooms';
import { CellSelectionService } from 'app/views/classroom-view/cell-selection.service';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule, CdkDrag, CdkDropList],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss',
})
export class StudentListComponent {
  readonly #classroomsService = inject(ClassroomsService);
  readonly #cellSelectionService = inject(CellSelectionService);

  readonly classroomId = input<string>();
  readonly configurationId = input<string>();
  readonly groupId = input<string>();
  readonly studentDetails = input<StudentDetail[]>();
  readonly roundedBottom = input<boolean>(false);
  readonly roundedTop = input<boolean>(false);
  readonly groupIndex = input<number>();

  readonly selectedCell = this.#cellSelectionService.selectedCell;

  @ViewChild('valueInput', { read: ElementRef })
  valueInput?: ElementRef<HTMLInputElement>;

  readonly groupIds = computed(() =>
    this.#classroomsService.select.groupIds(this.configurationId())()
  );
  readonly columnDetails = computed(() =>
    this.#classroomsService.select.columnDetails(this.configurationId())
  );

  readonly FieldType = FieldType;

  editCellValue = '';
  editingStudents: StudentDetail[] = [];

  constructor() {
    effect(() => {
      this.editingStudents = this.studentDetails() || [];
      this.editCellValue = this.#cellSelectionService.editCellValue() || '';
    });
    effect(() => {
      if (this.selectedCell()) {
        setTimeout(() => {
          this.valueInput?.nativeElement.focus();
        });
      }
    });
  }

  startEditing(
    value: string,
    type: FieldType,
    rowIndex: number,
    columnIndex: number
  ) {
    this.#cellSelectionService.setEditCellValue(value);
    this.#cellSelectionService.setEditCellDetails({
      type,
      rowIndex,
      columnIndex,
      groupIndex: this.groupIndex()!,
    });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
    }
  }

  saveEdits(originalValue: string, selectNextCell = false) {
    const classroomId = this.classroomId();
    const selectedCell = this.selectedCell();

    if (
      classroomId &&
      selectedCell?.studentId !== undefined &&
      selectedCell?.fieldId !== undefined &&
      this.editCellValue !== undefined &&
      this.editCellValue !== originalValue
    ) {
      this.#classroomsService.upsertStudentField(
        classroomId,
        selectedCell.studentId,
        selectedCell.fieldId,
        this.editCellValue
      );
    }
    selectNextCell
      ? setTimeout(() => this.#cellSelectionService.selectRightCell())
      : this.#cellSelectionService.unselectCell();
  }

  drop(event: CdkDragDrop<StudentDetail[]>) {
    // TODO
  }
}
