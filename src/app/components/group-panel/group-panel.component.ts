import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  ViewChild,
} from '@angular/core';
import { Group, Student, StudentField } from '../../models/classroom.models';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { ClassroomsService } from '../../classrooms.service';
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
import { StudentViewModel } from '../../models/classroom-view.models';

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

  readonly group = input<Group>();

  readonly viewingStudents = this.#classroomsService.viewingStudents;
  readonly viewingClassroomId = this.#classroomsService.viewingClassroomId;
  readonly viewingConfigurationId =
    this.#classroomsService.viewingConfigurationId;
  readonly viewingConfiguration = this.#classroomsService.viewingConfiguration;
  readonly viewingGroups = this.#classroomsService.viewingGroups;
  readonly viewingColumns = this.#classroomsService.viewingColumns;

  readonly studentsInGroup = computed(() =>
    this.viewingStudents().filter(
      (student) => student.groupId === this.group()?.id
    )
  );

  readonly viewingGroupIds = computed(() =>
    this.viewingGroups().map(({ id }) => id)
  );

  editingFieldId?: string;
  editingStudentId?: string;
  editingField?: string | number;
  editingStudents: StudentViewModel[] = [];

  constructor() {
    effect(() => {
      this.editingStudents = this.viewingStudents();
    });
  }

  addStudent() {}

  deleteGroup() {
    // if (this.studentsInGroup().length > 0) {
    //   this.#matSnackBar.open(
    //     "You can't delete group that contains students",
    //     'Hide',
    //     {
    //       duration: 3000,
    //     }
    //   );
    //   return;
    // }
    // const classroomId = this.viewingClassroomId();
    // const configurationId = this.viewingConfigurationId();
    // const groupId = this.group()?.id;
    // if (classroomId && configurationId && groupId) {
    //   this.#classroomsService.deleteGroup(
    //     classroomId,
    //     configurationId,
    //     groupId
    //   );
    //   this.#matSnackBar.open('Group deleted', 'Hide', {
    //     duration: 3000,
    //   });
    // }
  }

  drop(event: CdkDragDrop<Student[]>) {
    moveItemInArray(
      this.editingStudents,
      event.previousIndex,
      event.currentIndex
    );
    this.#classroomsService.updateStudents(
      this.viewingClassroomId(),
      this.editingStudents
    );
  }

  startEditing(studentField: StudentField) {
    this.editingField = studentField.value;
    this.editingFieldId = studentField.fieldId;
    this.editingStudentId = studentField.studentId;
    setTimeout(() => this.valueInput.nativeElement.focus());
  }

  saveEdits() {
    if (
      this.editingStudentId !== undefined &&
      this.editingFieldId !== undefined &&
      this.editingField !== undefined
    ) {
      this.#classroomsService.setStudentValue(
        this.editingStudentId,
        this.editingFieldId,
        this.editingField
      );
    }

    this.editingField = undefined;
    this.editingFieldId = undefined;
    this.editingStudentId = undefined;
  }
}
