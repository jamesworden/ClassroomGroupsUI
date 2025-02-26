import { Component, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ClassroomPageService } from '../classroom-view.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-no-selected-configuration-view',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './no-selected-configuration-view.component.html',
  styleUrl: './no-selected-configuration-view.component.scss',
})
export class NoSelectedConfigurationViewComponent {
  readonly #classroomViewService = inject(ClassroomPageService);

  readonly sidenavOpen = input.required<boolean>();

  readonly sidenavToggled = output();

  openCreateConfigurationModal() {
    this.#classroomViewService.openCreateConfigurationDialog();
  }

  openSidenav() {
    this.sidenavToggled.emit();
  }
}
