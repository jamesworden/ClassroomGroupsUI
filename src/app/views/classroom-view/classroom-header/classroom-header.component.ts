import { Component, inject, input, output } from '@angular/core';
import {
  ClassroomDetail,
  ClassroomsService,
  ColumnDetail,
  GroupDetail,
  StudentDetail,
} from '@shared/classrooms';
import { CounterCardComponent } from '../counter-card/counter-card.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Themes, ThemeService } from '@app/themes';
import { MatButtonModule } from '@angular/material/button';
import {
  AccountMenuButtonComponent,
  CodeLinksMenuButtonComponent,
  ToggleThemeButtonComponent,
} from '@ui-inputs';
import { AccountsService } from '@shared/accounts';

@Component({
  selector: 'app-classroom-header',
  imports: [
    CounterCardComponent,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatButtonModule,
    RouterModule,
    ToggleThemeButtonComponent,
    AccountMenuButtonComponent,
    CodeLinksMenuButtonComponent,
  ],
  templateUrl: './classroom-header.component.html',
  styleUrl: './classroom-header.component.scss',
})
export class ClassroomHeaderComponent {
  readonly #classroomsService = inject(ClassroomsService);
  readonly #themeService = inject(ThemeService);
  readonly #accountsService = inject(AccountsService);

  readonly classroom = input.required<ClassroomDetail>();
  readonly groupDetails = input.required<GroupDetail[]>();
  readonly studentDetails = input.required<StudentDetail[]>();
  readonly columnDetails = input.required<ColumnDetail[]>();
  readonly collapsePanelDetails = input.required<boolean>();

  readonly collapsedPanelsToggled = output();
  readonly deleteClassroomDialogOpened = output();

  readonly theme = this.#themeService.theme;
  readonly maxStudentsPerClassroom =
    this.#accountsService.select.maxStudentsPerClassroom;
  readonly maxFieldsPerClassroom =
    this.#accountsService.select.maxFieldsPerClassroom;

  readonly Themes = Themes;

  updateClassroomLabel(event: Event) {
    const label = (event.target as HTMLInputElement)?.value || '';
    this.#classroomsService.patchClassroom(
      this.classroom().id,
      label,
      this.classroom().description
    );
  }

  updateClassroomDescription(event: Event) {
    const description = (event.target as HTMLInputElement)?.value;
    this.#classroomsService.patchClassroom(
      this.classroom().id,
      this.classroom().label,
      description
    );
  }

  toggleCollapsedPanels() {
    this.collapsedPanelsToggled.emit();
  }

  toggleTheme() {
    this.#themeService.toggleTheme();
  }

  openDeleteClassroomDialog() {
    this.deleteClassroomDialogOpened.emit();
  }
}
