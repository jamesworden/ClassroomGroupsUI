import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ClassroomDetail, ClassroomsService } from '@shared/classrooms';
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
import {
  YesNoDialogComponent,
  YesNoDialogInputs,
} from 'app/components/yes-no-dialog/yes-no-dialog.component';

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

  displayedColumns = ['label', 'description', 'actions'];

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

  openDeleteClassroomModal(classroomDetail: ClassroomDetail) {
    const dialogRef = this.#matDialog.open(YesNoDialogComponent, {
      restoreFocus: false,
      data: <YesNoDialogInputs>{
        title: 'Delete classroom',
        subtitle: `Are you sure you want to delete the classroom ${classroomDetail.label} and all of it's data?`,
      },
    });
    dialogRef.afterClosed().subscribe((success: boolean) => {
      if (success) {
        this.#classroomsService.deleteClassroom(classroomDetail.id);
      }
    });
  }
}
