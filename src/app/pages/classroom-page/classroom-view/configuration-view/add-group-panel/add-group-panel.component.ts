import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClassroomsService } from '@shared/classrooms';

@Component({
  selector: 'app-add-group-panel',
  imports: [MatTooltipModule, MatIconModule, MatButtonModule],
  templateUrl: './add-group-panel.component.html',
  styleUrl: './add-group-panel.component.scss',
})
export class AddGroupPanelComponent {
  readonly #classroomsService = inject(ClassroomsService);

  readonly groupLimitReached = input.required<boolean>();
  readonly classroomId = input.required<string>();
  readonly configurationId = input.required<string>();

  createGroup() {
    this.#classroomsService.createGroup(
      this.classroomId(),
      this.configurationId()
    );
  }
}
