import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
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
  ClassroomsService,
  ClassroomViewModel,
  ConfigurationViewModel,
  Group,
  GroupViewModel,
  Student,
  StudentField,
  StudentViewModel,
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

  readonly classroom = input<ClassroomViewModel>();
  readonly configuration = input<ConfigurationViewModel>();
  readonly group = input<GroupViewModel>();

  readonly students = computed(() =>
    this.#classroomsService.students(this.classroom()?.id)()
  );
  readonly columns = computed(() =>
    this.#classroomsService.columns(this.configuration()?.id)
  );
  readonly studentsInGroup = computed(() =>
    this.students().filter((student) => student.groupId === this.group()?.id)
  );
  readonly viewingGroupIds = computed(() =>
    (this.#classroomsService.groups(this.configuration()?.id)() ?? []).map(
      ({ id }) => id
    )
  );

  editingFieldId?: string;
  editingStudentId?: string;
  editingField?: string | number;
  editingStudents: StudentViewModel[] = [];

  constructor() {
    effect(() => {
      this.editingStudents = this.studentsInGroup();
    });
  }

  addStudent() {}

  deleteGroup() {}

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

  startEditing(studentField: StudentField) {
    this.editingField = studentField.value;
    this.editingFieldId = studentField.fieldId;
    this.editingStudentId = studentField.studentId;
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
