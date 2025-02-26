import { Component, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ClassroomPageService } from '../../classroom-page.service';

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

  openCreateConfigurationDialog() {
    this.#classroomViewService.openCreateConfigurationDialog();
  }

  openSidenav() {
    this.sidenavToggled.emit();
  }
}
