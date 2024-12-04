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
  output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClassroomsService, StudentDetail } from '@shared/classrooms';
import { Cell } from 'app/models/cell';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule, CdkDrag, CdkDropList],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss',
})
export class StudentListComponent {
  readonly #classroomsService = inject(ClassroomsService);

  readonly classroomId = input<string>();
  readonly configurationId = input<string>();
  readonly groupId = input<string>();
  readonly studentDetails = input<StudentDetail[]>();
  readonly roundedBottom = input<boolean>(false);
  readonly roundedTop = input<boolean>(false);
  readonly selectedCell = input<Cell>();

  readonly cellUnselected = output();

  @ViewChild('valueInput', { read: ElementRef })
  valueInput?: ElementRef<HTMLInputElement>;

  readonly groupIds = computed(() =>
    this.#classroomsService.select.groupIds(this.configurationId())()
  );
  readonly columnDetails = computed(() =>
    this.#classroomsService.select.columnDetails(this.configurationId())
  );

  editingField?: string;
  editingStudents: StudentDetail[] = [];

  constructor() {
    effect(() => {
      this.editingStudents = this.studentDetails() ?? [];
    });
    effect(() => {
      if (this.selectedCell()) {
        setTimeout(() => {
          this.valueInput?.nativeElement.focus();
        });
      }
    });
  }

  startEditing(fieldId: string, value: string, studentId: string) {
    this.editingField = value;
  }

  saveEdits() {
    const classroomId = this.classroomId();
    const selectedCell = this.selectedCell();
    if (
      classroomId &&
      selectedCell?.studentId !== undefined &&
      selectedCell?.fieldId !== undefined &&
      this.editingField !== undefined
    ) {
      this.#classroomsService.upsertStudentField(
        classroomId,
        selectedCell.studentId,
        selectedCell.fieldId,
        this.editingField
      );
    }
    this.editingField = undefined;
    this.cellUnselected.emit();
  }

  drop(event: CdkDragDrop<StudentDetail[]>) {
    // TODO
  }
}
