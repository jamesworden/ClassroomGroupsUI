import { Component, computed, inject, input } from '@angular/core';
import { ClassroomGroup } from '../../models/classroom.models';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { ClassroomsService } from '../../classrooms.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-group-panel',
  standalone: true,
  imports: [
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
    MatTooltipModule,
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

  readonly studentsInGroup = computed(() =>
    this.viewingStudents().filter(
      (student) => student.groupId === this.group()?.id
    )
  );

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
}
