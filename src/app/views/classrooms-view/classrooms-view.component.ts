import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ClassroomsService } from '@shared/classrooms';
import { Router } from '@angular/router';
import { ThemeService } from 'app/themes/theme.service';
import { Themes } from 'app/themes/theme.models';

@Component({
  selector: 'app-classrooms-view',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTableModule, MatToolbarModule],
  templateUrl: './classrooms-view.component.html',
  styleUrl: './classrooms-view.component.scss',
  providers: [provideNativeDateAdapter()],
})
export class ClassroomsViewComponent {
  readonly #classroomsService = inject(ClassroomsService);
  readonly #router = inject(Router);
  readonly #themeService = inject(ThemeService);

  readonly classroomDetails = this.#classroomsService.classroomDetails;
  readonly theme = this.#themeService.theme;
  readonly Themes = Themes;

  displayedColumns = ['label', 'description'];

  constructor() {
    this.#classroomsService.getClassroomDetails();
  }

  viewClassroom(id: string) {
    this.#router.navigate(['/classrooms', id]);
  }

  toggleTheme() {
    this.#themeService.toggleTheme();
  }
}
