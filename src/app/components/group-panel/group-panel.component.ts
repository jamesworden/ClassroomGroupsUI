import { Component, computed, effect, inject, input } from '@angular/core';
import { ClassroomGroup, Student } from '../../models/classroom.models';
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

interface StudentWithOrderedValues extends Student {
  orderedValues: (number | string)[];
}

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

  readonly group = input<ClassroomGroup>();

  readonly viewingStudents = this.#classroomsService.viewingStudents;
  readonly viewingClassroomId = this.#classroomsService.viewingClassroomId;
  readonly viewingConfigurationId =
    this.#classroomsService.viewingConfigurationId;
  readonly viewingConfiguration = this.#classroomsService.viewingConfiguration;

  readonly studentsInGroup = computed(() =>
    this.viewingStudents().filter(
      (student) => student.groupId === this.group()?.id
    )
  );

  readonly studentsWithOrderedFields = computed<StudentWithOrderedValues[]>(
    () => {
      const students = this.viewingStudents();
      const columns = this.viewingConfiguration()?.columns ?? [];

      const x: StudentWithOrderedValues[] = students.map((student) => {
        const orderedValues: (number | string)[] = [];
        for (const column of columns) {
          orderedValues.push(student.row[column.fieldId]);
        }
        return {
          ...student,
          orderedValues,
        };
      });

      return x;
    }
  );

  students: StudentWithOrderedValues[] = [];
  editingOrderedFieldIndex?: number;
  editingStudentId?: string;
  editingField?: string | number;

  constructor() {
    effect(() => (this.students = this.studentsWithOrderedFields()));
  }

  addStudent() {}

  deleteGroup() {
    if (this.studentsInGroup().length > 0) {
      this.#matSnackBar.open(
        "You can't delete group that contains students",
        'Hide',
        {
          duration: 3000,
        }
      );
      return;
    }

    const classroomId = this.viewingClassroomId();
    const configurationId = this.viewingConfigurationId();
    const groupId = this.group()?.id;
    if (classroomId && configurationId && groupId) {
      this.#classroomsService.deleteGroup(
        classroomId,
        configurationId,
        groupId
      );
      this.#matSnackBar.open('Group deleted', 'Hide', {
        duration: 3000,
      });
    }
  }

  drop(event: CdkDragDrop<Student[]>) {
    moveItemInArray(this.students, event.previousIndex, event.currentIndex);
    // TODO: Persist changes
  }

  startEditing(
    studentId: string,
    editingIndex: number,
    initialValue: string | number
  ) {
    this.editingOrderedFieldIndex = editingIndex;
    this.editingStudentId = studentId;
    this.editingField = initialValue;
  }

  saveEdits() {
    // TODO: Persist changes
    this.editingOrderedFieldIndex = undefined;
    this.editingStudentId = undefined;
    this.editingField = undefined;
  }
}
