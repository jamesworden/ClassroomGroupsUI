import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ClassroomsService } from '@shared/classrooms';
import { Router } from '@angular/router';
import { ThemeService } from 'app/themes/theme.service';
import { Themes } from 'app/themes/theme.models';
import { MatMenuModule } from '@angular/material/menu';
import { AccountMenuComponent } from 'app/components/account-menu/account-menu.component';
import { MatDialog } from '@angular/material/dialog';
import {
  CreateClassroomDialogComponent,
  CreateClassroomDialogResults,
} from 'app/components/create-classroom-dialog/create-classroom-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-classrooms-view',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatToolbarModule,
    MatMenuModule,
    AccountMenuComponent,
    CreateClassroomDialogComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './classrooms-view.component.html',
  styleUrl: './classrooms-view.component.scss',
  providers: [provideNativeDateAdapter()],
})
export class ClassroomsViewComponent {
  readonly #classroomsService = inject(ClassroomsService);
  readonly #router = inject(Router);
  readonly #themeService = inject(ThemeService);
  readonly #matDialog = inject(MatDialog);

  readonly classroomDetails = this.#classroomsService.classroomDetails;
  readonly classroomsLoading = this.#classroomsService.classroomsLoading;
  readonly theme = this.#themeService.theme;
  readonly Themes = Themes;
  readonly menuIsOpen = signal(false);

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

  markMenuAsOpen() {
    this.menuIsOpen.set(true);
  }

  markMenuAsClosed() {
    this.menuIsOpen.set(false);
  }

  openCreateClassroomModal() {
    const dialogRef = this.#matDialog.open(CreateClassroomDialogComponent, {
      restoreFocus: false,
    });
    dialogRef
      .afterClosed()
      .subscribe((results?: CreateClassroomDialogResults) => {
        console.log(results);
        if (results) {
          this.#classroomsService.createClassroom(
            results.label,
            results.description
          );
        }
      });
  }
}
