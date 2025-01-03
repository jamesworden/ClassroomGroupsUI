import { Component, inject, input, output } from '@angular/core';
import {
  ClassroomsService,
  ColumnDetail,
  GroupDetail,
  StudentDetail,
  StudentField,
} from '@shared/classrooms';
import { StudentListComponent } from '../student-list/student-list.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MoveStudentDetail } from 'shared/classrooms/lib/models/move-student-detail';

@Component({
  selector: 'app-configuration-panel-bottom',
  standalone: true,
  imports: [StudentListComponent, CommonModule, MatIconModule],
  templateUrl: './configuration-panel-bottom.component.html',
  styleUrl: './configuration-panel-bottom.component.scss',
})
export class ConfigurationPanelBottomComponent {
  readonly #classroomsService = inject(ClassroomsService);

  readonly classroomId = input<string>();
  readonly configurationId = input<string>();
  readonly defaultGroup = input<GroupDetail>();
  readonly columnDetails = input<ColumnDetail[]>([]);

  readonly studentFieldUpdated = output<StudentField>();
  readonly studentDeleted = output<StudentDetail>();
  readonly studentPositionUpdated = output<MoveStudentDetail>();

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
