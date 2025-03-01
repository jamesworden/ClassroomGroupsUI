import { Component, computed, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ColumnDetail,
  GroupDetail,
  MAX_GROUP_NAME_LENGTH,
  MoveStudentDetail,
  StudentDetail,
  StudentField,
} from '@shared/classrooms';
import { StudentListComponent } from '../student-list/student-list.component';
import { GroupFooterComponent } from '../group-footer/group-footer.component';
import { ClassroomPageService } from 'app/pages/classroom-page/classroom-page.service';

@Component({
  selector: 'app-group-panel',
  imports: [
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    StudentListComponent,
    GroupFooterComponent,
  ],
  templateUrl: './group-panel.component.html',
  styleUrl: './group-panel.component.scss',
})
export class GroupPanelComponent {
  readonly #classroomPageService = inject(ClassroomPageService);

  readonly classroomId = input.required<string>();
  readonly groupDetail = input.required<GroupDetail>();
  readonly groupIndex = input.required<number>();
  readonly columnDetails = input.required<ColumnDetail[]>();
  readonly collapsed = input(false);

  readonly groupDeleted = output<void>();
  readonly studentCreated = output<void>();
  readonly labelUpdated = output<string>();
  readonly studentFieldUpdated = output<StudentField>();
  readonly studentDeleted = output<StudentDetail>();
  readonly studentPositionUpdated = output<MoveStudentDetail>();

  readonly students = computed(() => this.groupDetail()?.studentDetails ?? []);
  readonly studentsInGroup = computed(() =>
    this.students().filter(
      (student) => student.groupId === this.groupDetail()?.id
    )
  );

  readonly MAX_GROUP_NAME_LENGTH = MAX_GROUP_NAME_LENGTH;

  createStudent() {
    this.studentCreated.emit();
  }

  deleteGroup() {
    if (this.groupDetail().isLocked) {
      this.openDeleteGroupDialog();
    } else {
      this.groupDeleted.emit();
    }
  }

  openDeleteGroupDialog() {
    this.#classroomPageService.openDeleteGroupDialog(this.groupDetail());
  }

  updateLabel(event: Event) {
    const label = (event.target as HTMLInputElement)?.value;
    this.labelUpdated.emit(label);
  }

  updateStudentField(studentField: StudentField) {
    this.studentFieldUpdated.emit(studentField);
  }

  deleteStudent(studentDetail: StudentDetail) {
    this.studentDeleted.emit(studentDetail);
  }

  updateStudentPosition(studentPosition: MoveStudentDetail) {
    this.studentPositionUpdated.emit(studentPosition);
  }
}
