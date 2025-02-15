import { Component, input, output } from '@angular/core';
import {
  ColumnDetail,
  GroupDetail,
  StudentDetail,
  StudentField,
} from '@shared/classrooms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MoveStudentDetail } from 'shared/classrooms/lib/models/move-student-detail';
import { StudentListComponent } from '../student-list/student-list.component';
import { GroupFooterComponent } from '../group-footer/group-footer.component';

@Component({
  selector: 'app-configuration-panel-bottom',
  imports: [
    StudentListComponent,
    CommonModule,
    MatIconModule,
    GroupFooterComponent,
  ],
  templateUrl: './configuration-panel-bottom.component.html',
  styleUrl: './configuration-panel-bottom.component.scss',
})
export class ConfigurationPanelBottomComponent {
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
