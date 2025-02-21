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
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Themes, ThemeService } from '@app/themes';
import { AccountMenuComponent } from '@app/components';
import { CodeLinksMenuComponent } from 'app/components/code-links-menu/code-links-menu.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-classroom-header',
  imports: [
    CounterCardComponent,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    AccountMenuComponent,
    CodeLinksMenuComponent,
    MatButtonModule,
  ],
  templateUrl: './classroom-header.component.html',
  styleUrl: './classroom-header.component.scss',
})
export class ClassroomHeaderComponent {
  readonly #classroomsService = inject(ClassroomsService);
  readonly #router = inject(Router);
  readonly #themeService = inject(ThemeService);

  readonly theme = this.#themeService.theme;

  readonly classroom = input.required<ClassroomDetail>();
  readonly groupDetails = input.required<GroupDetail[]>();
  readonly maxStudentsPerClassroom = input.required<number>();
  readonly maxFieldsPerClassroom = input.required<number>();
  readonly studentDetails = input.required<StudentDetail[]>();
  readonly columnDetails = input.required<ColumnDetail[]>();
  readonly menuIsOpen = input.required<boolean>();
  readonly collapsePanelDetails = input.required<boolean>();

  readonly collapsedPanelsToggled = output();
  readonly deleteClassroomDialogOpened = output();
  readonly menuMarkedAsOpen = output();
  readonly menuMarkedAsClosed = output();

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

  goToClassroomsView() {
    this.#router.navigate(['classrooms']);
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

  markMenuAsOpen() {
    this.menuMarkedAsOpen.emit();
  }

  markMenuAsClosed() {
    this.menuMarkedAsOpen.emit();
  }
}
