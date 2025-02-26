import { Component, input, output } from '@angular/core';
import {
  ColumnDetail,
  GroupDetail,
  MoveStudentDetail,
  StudentDetail,
  StudentField,
} from '@shared/classrooms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
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
  readonly classroomId = input.required<string>();
  readonly configurationId = input.required<string>();
  readonly defaultGroup = input.required<GroupDetail>();
  readonly columnDetails = input.required<ColumnDetail[]>();
  readonly collapsed = input(false);

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
