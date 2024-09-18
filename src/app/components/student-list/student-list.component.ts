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
import { ClassroomsService, StudentDetail } from '@shared/classrooms';

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

  @ViewChild('valueInput', { read: ElementRef })
  valueInput!: ElementRef<HTMLInputElement>;

  readonly groupIds = computed(() =>
    this.#classroomsService.select.groupIds(this.configurationId())()
  );
  readonly columnDetails = computed(() =>
    this.#classroomsService.select.columnDetails(this.configurationId())
  );

  editingFieldId?: string;
  editingStudentId?: string;
  editingField?: string;
  editingStudents: StudentDetail[] = [];

  constructor() {
    effect(() => {
      this.editingStudents = this.studentDetails() ?? [];
    });
  }

  startEditing(fieldId: string, value: string, studentId: string) {
    this.editingField = value;
    this.editingFieldId = fieldId;
    this.editingStudentId = studentId;
    setTimeout(() => this.valueInput.nativeElement.focus());
  }

  saveEdits() {
    const classroomId = this.classroomId();
    if (
      classroomId &&
      this.editingStudentId !== undefined &&
      this.editingFieldId !== undefined &&
      this.editingField !== undefined
    ) {
      this.#classroomsService.upsertStudentField(
        classroomId,
        this.editingStudentId,
        this.editingFieldId,
        this.editingField
      );
    }
    this.editingField = undefined;
    this.editingFieldId = undefined;
    this.editingStudentId = undefined;
  }

  drop(event: CdkDragDrop<StudentDetail[]>) {
    // const ontoSameGroup = event.container === event.previousContainer;
    // if (ontoSameGroup) {
    //   // Order editingStudents
    //   moveItemInArray(
    //     this.editingStudents,
    //     event.previousIndex,
    //     event.currentIndex
    //   );
    //   // Assign ordinals according to the order
    //   this.editingStudents = this.editingStudents.map(
    //     (editingStudent, ordinal) => ({ ...editingStudent, ordinal })
    //   );
    //   // Create correct student group updates
    //   const studentGroups = this.#classroomsService
    //     .studentGroups()
    //     .map((studentGroup) => {
    //       const updatedStudent = this.editingStudents.find(
    //         ({ id }) => id === studentGroup.studentId
    //       );
    //       if (updatedStudent) {
    //         studentGroup.ordinal = updatedStudent.ordinal;
    //       }
    //       return studentGroup;
    //     });
    //   // Persist updates
    //   this.#classroomsService.updateStudentGroups(studentGroups);
    //   return;
    // }
    // Recalculate ordinals
  }
}
