import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClassroomPageService } from 'app/pages/classroom-page/classroom-page.service';

@Component({
  selector: 'app-add-group-panel',
  imports: [MatTooltipModule, MatIconModule, MatButtonModule],
  templateUrl: './add-group-panel.component.html',
  styleUrl: './add-group-panel.component.scss',
})
export class AddGroupPanelComponent {
  readonly #classroomPageService = inject(ClassroomPageService);

  readonly groupLimitReached = input.required<boolean>();
  readonly classroomId = input.required<string>();
  readonly configurationId = input.required<string>();

  createGroup() {
    this.#classroomPageService.openCreateGroupDialog();
  }
}
