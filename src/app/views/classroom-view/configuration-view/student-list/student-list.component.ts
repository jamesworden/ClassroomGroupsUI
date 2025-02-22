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
  ColumnDetail,
  FieldType,
  GroupDetail,
  MoveStudentDetail,
  StudentDetail,
  StudentField,
} from '@shared/classrooms';
import { CdkMenu, CdkMenuItem, CdkContextMenuTrigger } from '@angular/cdk/menu';
import { MatButtonModule } from '@angular/material/button';
import { AccountsService } from '@shared/accounts';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-student-list',
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
    MatTooltipModule,
    MatButtonModule,
  ],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss',
})
export class StudentListComponent {
  readonly #classroomsService = inject(ClassroomsService);
  readonly #accountsService = inject(AccountsService);

  readonly classroomId = input.required<string>();
  readonly configurationId = input.required<string>();
  readonly groupId = input.required<string>();
  readonly studentDetails = input.required<StudentDetail[]>();
  readonly groupIndex = input.required<number>();
  readonly columnDetails = input.required<ColumnDetail[]>();
  readonly groupDetail = input.required<GroupDetail>();
  readonly roundedBottom = input<boolean>(false);
  readonly roundedTop = input<boolean>(false);

  readonly studentFieldUpdated = output<StudentField>();
  readonly studentDeleted = output<StudentDetail>();
  readonly studentPositionUpdated = output<MoveStudentDetail>();

  readonly account = this.#accountsService.select.account;

  readonly groupIds = computed(() =>
    this.#classroomsService.select.groupIds(this.configurationId())()
  );
  readonly studentsInConfiguration = computed(() =>
    this.#classroomsService.select.studentsInConfiguration(
      this.configurationId()
    )()
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
    const classroomId = this.classroomId();
    const configurationId = this.configurationId();
    if (!classroomId || !configurationId) {
      return;
    }
    const studentDetail = event.item.data as StudentDetail;
    const updatedStudentPosition: MoveStudentDetail = {
      prevIndex: event.previousIndex,
      prevGroupId: event.previousContainer.id,
      currIndex: event.currentIndex,
      currGroupId: event.container.id,
      studentId: studentDetail.id,
    };
    this.studentPositionUpdated.emit(updatedStudentPosition);
  }

  deleteStudent(studentDetail: StudentDetail) {
    this.studentDeleted.emit(studentDetail);
  }
}
