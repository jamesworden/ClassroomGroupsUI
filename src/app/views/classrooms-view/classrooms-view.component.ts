import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ClassroomDetail, ClassroomsService } from '@shared/classrooms';
import { Router, RouterModule } from '@angular/router';
import { ThemeService } from 'app/themes/theme.service';
import { Themes } from 'app/themes/theme.models';
import { MatMenuModule } from '@angular/material/menu';
import { AccountMenuComponent } from 'app/components/account-menu/account-menu.component';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  YesNoDialogComponent,
  YesNoDialogInputs,
} from 'app/components/yes-no-dialog/yes-no-dialog.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AccountsService } from '@shared/accounts';

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
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTooltipModule,
    RouterModule,
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
  readonly #accountService = inject(AccountsService);

  readonly classroomDetails = this.#classroomsService.select.classroomDetails;
  readonly classroomsLoading = this.#classroomsService.select.classroomsLoading;
  readonly theme = this.#themeService.theme;
  readonly Themes = Themes;
  readonly menuIsOpen = signal(false);
  readonly account = this.#accountService.select.account;

  displayedColumns = ['label', 'description', 'actions'];

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

  createClassroom() {
    this.#classroomsService.createClassroom().subscribe((classroomDetail) => {
      if (classroomDetail) {
        this.viewClassroom(classroomDetail.id);
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
