import { Component, computed, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ClassroomPageService } from '../../classroom-page.service';
import { ClassroomsService } from '@shared/classrooms';
import { AccountsService } from '@shared/accounts';

@Component({
  selector: 'app-no-selected-configuration-view',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './no-selected-configuration-view.component.html',
  styleUrl: './no-selected-configuration-view.component.scss',
})
export class NoSelectedConfigurationViewComponent {
  readonly #classroomPageService = inject(ClassroomPageService);
  readonly #classroomsService = inject(ClassroomsService);
  readonly #accountsService = inject(AccountsService);

  readonly configurationLimitReached = computed(
    () =>
      this.#classroomsService.select.configurationDetails().length >=
      this.#accountsService.select.maxConfigurationsPerClassroom()
  );

  readonly sidenavOpen = input.required<boolean>();

  readonly sidenavToggled = output();

  openCreateConfigurationDialog() {
    this.#classroomPageService.openCreateConfigurationDialog();
  }

  openSidenav() {
    this.sidenavToggled.emit();
  }
}
