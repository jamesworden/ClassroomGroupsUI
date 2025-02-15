import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AccountsService } from '@shared/accounts';
import { ClassroomsService, GroupDetail } from '@shared/classrooms';

@Component({
  selector: 'app-group-footer',
  imports: [MatTooltipModule, MatIconModule, CommonModule, MatButtonModule],
  templateUrl: './group-footer.component.html',
  styleUrl: './group-footer.component.scss',
})
export class GroupFooterComponent {
  readonly #classroomsService = inject(ClassroomsService);
  readonly #accountsService = inject(AccountsService);

  readonly configurationId = input<string>();
  readonly classroomId = input<string>();
  readonly groupId = input<string>();
  readonly groupDetail = input<GroupDetail>();

  readonly studentsInConfiguration = computed(() =>
    this.#classroomsService.select.studentsInConfiguration(
      this.configurationId()
    )()
  );

  readonly account = this.#accountsService.select.account;

  addStudent() {
    const classroomId = this.classroomId();
    const configurationId = this.configurationId();
    if (classroomId && configurationId) {
      this.#classroomsService.createStudent(
        classroomId,
        configurationId,
        this.groupId()
      );
    }
  }

  toggleGroupLocked() {
    const classroomId = this.classroomId();
    const configurationId = this.configurationId();
    const group = this.groupDetail();
    if (classroomId && configurationId && group) {
      group.isLocked
        ? this.#classroomsService.unlockGroup(
            classroomId,
            configurationId,
            group.id
          )
        : this.#classroomsService.lockGroup(
            classroomId,
            configurationId,
            group.id
          );
    }
  }
}
