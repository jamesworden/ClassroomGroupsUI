import { Component, inject, input } from '@angular/core';
import { ClassroomGroup } from '../../models/classroom.models';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { ClassroomsService } from '../../classrooms.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-group-panel',
  standalone: true,
  imports: [MatIconModule, MatCheckboxModule, MatButtonModule],
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

  addStudent() {}

  deleteGroup() {
    const studentIsInGroup = this.viewingStudents().some(
      (student) => student.groupId === this.group()?.id
    );
    if (studentIsInGroup) {
      this.#matSnackBar.open(
        "Can't delete group that contains students",
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
}
