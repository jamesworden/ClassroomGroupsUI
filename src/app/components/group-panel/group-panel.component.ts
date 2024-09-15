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
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Classroom,
  ClassroomsService,
  Group,
  GroupDetail,
  Student,
  StudentDetail,
  StudentField,
} from '@shared/classrooms';

@Component({
  selector: 'app-group-panel',
  standalone: true,
  imports: [
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
    MatTooltipModule,
    CdkDropList,
    CdkDrag,
    MatIconModule,
    CdkDropList,
    CdkDrag,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './group-panel.component.html',
  styleUrl: './group-panel.component.scss',
})
export class GroupPanelComponent {
  readonly #classroomsService = inject(ClassroomsService);
  readonly #matSnackBar = inject(MatSnackBar);

  @ViewChild('valueInput', { read: ElementRef })
  valueInput!: ElementRef<HTMLInputElement>;

  readonly groupDetail = input<GroupDetail>();

  readonly groupDeleted = output<void>();
  readonly studentCreated = output<void>();
  readonly labelUpdated = output<string>();

  readonly students = computed(() => this.groupDetail()?.studentDetails ?? []);
  readonly columnDetails = computed(() =>
    this.#classroomsService.select.columnDetails(
      this.groupDetail()?.configurationId
    )
  );
  readonly studentsInGroup = computed(() =>
    this.students().filter(
      (student) => student.groupId === this.groupDetail()?.id
    )
  );
  readonly groupIds = computed(() =>
    this.#classroomsService.select.groupIds(
      this.groupDetail()?.configurationId
    )()
  );

  editingFieldId?: string;
  editingStudentId?: string;
  editingField?: string | number;
  editingStudents: StudentDetail[] = [];
  updatedLabel?: string;

  constructor() {
    effect(() => {
      this.editingStudents = this.studentsInGroup();
    });
    effect(() => {
      this.updatedLabel = this.groupDetail()?.label;
    });
  }

  createStudent() {
    this.studentCreated.emit();
  }

  deleteGroup() {
    const groupDetail = this.groupDetail();
    if (groupDetail) {
      this.groupDeleted.emit();
    }
  }

  updateLabel() {
    if (this.updatedLabel) {
      this.labelUpdated.emit(this.updatedLabel);
    } else {
      this.updatedLabel = this.groupDetail()?.label;
    }
  }

  drop(event: CdkDragDrop<Student[]>) {
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

  startEditing(fieldId: string, value: string, studentId: string) {
    this.editingField = value;
    this.editingFieldId = fieldId;
    this.editingStudentId = studentId;
    setTimeout(() => this.valueInput.nativeElement.focus());
  }

  saveEdits() {
    // if (
    //   this.editingStudentId !== undefined &&
    //   this.editingFieldId !== undefined &&
    //   this.editingField !== undefined
    // ) {
    //   this.#classroomsService.setStudentValue(
    //     this.editingStudentId,
    //     this.editingFieldId,
    //     this.editingField
    //   );
    // }
    // this.editingField = undefined;
    // this.editingFieldId = undefined;
    // this.editingStudentId = undefined;
  }
}
