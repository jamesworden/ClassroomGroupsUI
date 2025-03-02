import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ClassroomDetail, ClassroomsService } from '@shared/classrooms';
import { Router, RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AccountsService } from '@shared/accounts';
import { CommonModule } from '@angular/common';
import { subscriptionPlans } from '@app/metadata';
import { Themes, ThemeService } from '@app/themes';
import {
  AccountMenuButtonComponent,
  CodeLinksMenuButtonComponent,
  ToggleThemeButtonComponent,
} from '@shared/ui-inputs';
import { ClassroomsPageService } from './classrooms-page.service';
import { ClassroomCardComponent } from './classroom-card/classroom-card.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CsvImportDialogComponent } from './csv-import-dialog/csv-import-dialog.component';

@Component({
  selector: 'app-classrooms-view',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatToolbarModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTooltipModule,
    RouterModule,
    CommonModule,
    ToggleThemeButtonComponent,
    AccountMenuButtonComponent,
    CodeLinksMenuButtonComponent,
    ClassroomCardComponent,
  ],
  templateUrl: './classrooms-page.component.html',
  styleUrl: './classrooms-page.component.scss',
  providers: [ClassroomsPageService],
})
export class ClassroomsPageComponent {
  readonly #classroomsService = inject(ClassroomsService);
  readonly #router = inject(Router);
  readonly #themeService = inject(ThemeService);
  readonly #accountService = inject(AccountsService);
  readonly #classroomsPageService = inject(ClassroomsPageService);
  readonly #matSnackBar = inject(MatSnackBar);
  readonly #matDialog = inject(MatDialog);

  readonly classroomDetails = this.#classroomsService.select.classroomDetails;
  readonly classroomsLoading = this.#classroomsService.select.classroomsLoading;
  readonly account = this.#accountService.select.account;
  readonly theme = this.#themeService.theme;
  readonly reachedClassroomLimit =
    this.#classroomsPageService.reachedClassroomLimit;

  readonly Themes = Themes;
  readonly subscriptionPlans = subscriptionPlans;
  readonly displayedColumns = ['label', 'description', 'actions'];
  readonly fullYear = new Date().getFullYear();

  readonly isDragging = signal(false);

  viewClassroom(id: string) {
    this.#router.navigate(['/classrooms', id]);
  }

  createClassroom() {
    this.#classroomsService.createClassroom().subscribe((classroomDetail) => {
      if (classroomDetail) {
        this.viewClassroom(classroomDetail.id);
      }
    });
  }

  openDeleteClassroomDialog(classroomDetail: ClassroomDetail) {
    this.#classroomsPageService.openDeleteClassroomDialog(classroomDetail);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  processFile(file: File) {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      this.#matSnackBar.open('Please upload a CSV file', 'Dismiss', {
        duration: 5000,
        panelClass: 'error-snackbar',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvData = e.target?.result as string;
      this.openCsvImportDialog(csvData, file.name);
    };
    reader.readAsText(file);
  }

  openCsvImportDialog(csvData: string, fileName: string) {
    const dialogRef = this.#matDialog.open(CsvImportDialogComponent, {
      data: {
        csvData,
        fileName,
        maxClassrooms: this.account()?.subscription?.maxClassrooms ?? 0,
        currentClassroomsCount: this.classroomDetails().length,
      },
      width: '90vw', // Make dialog 90% of viewport width
      maxWidth: '800px', // Set maximum width to 1400px
    });

    dialogRef.afterClosed().subscribe(() => {
      // if (result) {
      //   // LOAD CLASSROOMS
      //   // this.snackBar.open('Classroom data imported successfully', 'Dismiss', {
      //   //   duration: 5000
      //   // });
      // }
    });
  }
}
