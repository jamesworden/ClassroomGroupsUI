import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClassroomsService } from '@shared/classrooms';
import { ClassroomPageService } from 'app/pages/classroom-page/classroom-page.service';

@Component({
  selector: 'app-add-group-panel',
  imports: [MatTooltipModule, MatIconModule, MatButtonModule],
  templateUrl: './add-group-panel.component.html',
  styleUrl: './add-group-panel.component.scss',
})
export class AddGroupPanelComponent {
  readonly #classroomsService = inject(ClassroomsService);
  readonly #classroomPageService = inject(ClassroomPageService);

  readonly reachedGroupLimit = input.required<boolean>();
  readonly classroomId = input.required<string>();
  readonly configurationId = input.required<string>();

  createGroup() {
    this.#classroomsService
      .createGroup(this.classroomId(), this.configurationId())
      .subscribe(() => this.#classroomPageService.scrollToBottom$.next());
  }
}
