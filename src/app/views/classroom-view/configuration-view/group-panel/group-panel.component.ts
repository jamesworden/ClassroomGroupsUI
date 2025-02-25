import { Component, computed, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ClassroomsService,
  ColumnDetail,
  GroupDetail,
  MoveStudentDetail,
  StudentDetail,
  StudentField,
} from '@shared/classrooms';
import { StudentListComponent } from '../student-list/student-list.component';
import { GroupFooterComponent } from '../group-footer/group-footer.component';
import { YesNoDialogComponent, YesNoDialogInputs } from '@app/components';
import { MatDialog } from '@angular/material/dialog';

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
  readonly #matDialog = inject(MatDialog);
  readonly #classroomsService = inject(ClassroomsService);

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

  createStudent() {
    this.studentCreated.emit();
  }

  deleteGroup() {
    if (this.groupDetail().isLocked) {
      this.openDeleteGroupModal();
    } else {
      this.groupDeleted.emit();
    }
  }

  openDeleteGroupModal() {
    const dialogRef = this.#matDialog.open(YesNoDialogComponent, {
      restoreFocus: false,
      data: <YesNoDialogInputs>{
        title: 'Delete locked group',
        subtitle: `Are you sure you want to delete group '${
          this.groupDetail()?.label
        }' and all of its data?`,
      },
    });
    dialogRef.afterClosed().subscribe((success) => {
      const classroomId = this.classroomId();
      if (success && classroomId) {
        this.#classroomsService.deleteGroup(
          classroomId,
          this.groupDetail().configurationId,
          this.groupDetail().id
        );
      }
    });
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
