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
  inject,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  ClassroomsService,
  FieldType,
  StudentDetail,
  StudentField,
} from '@shared/classrooms';
import { CdkMenu, CdkMenuItem, CdkContextMenuTrigger } from '@angular/cdk/menu';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    FormsModule,
    CdkDrag,
    CdkDropList,
    MatIconModule,
    CdkContextMenuTrigger,
    CdkMenu,
    CdkMenuItem,
  ],
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
  readonly groupIndex = input<number>();

  readonly studentFieldUpdated = output<StudentField>();
  readonly studentDeleted = output<StudentDetail>();

  readonly groupIds = computed(() =>
    this.#classroomsService.select.groupIds(this.configurationId())()
  );
  readonly columnDetails = computed(() =>
    this.#classroomsService.select.columnDetails(this.configurationId())
  );

  readonly FieldType = FieldType;

  editingStudents: StudentDetail[] = [];

  constructor() {
    effect(() => {
      this.editingStudents = this.studentDetails() || [];
    });
  }

  saveEdits(studentId: string, fieldId: string, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const studentField: StudentField = {
      studentId,
      fieldId,
      value,
    };
    this.studentFieldUpdated.emit(studentField);
  }

  drop(event: CdkDragDrop<StudentDetail[]>) {
    // TODO
  }

  deleteStudent(studentDetail: StudentDetail) {
    this.studentDeleted.emit(studentDetail);
  }
}
