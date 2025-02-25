import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { YesNoDialogComponent, YesNoDialogInputs } from '@app/components';
import { ClassroomDetail, ClassroomsService } from '@shared/classrooms';

@Injectable({
  providedIn: 'root',
})
export class ClassroomViewServiceService {
  readonly #matDialog = inject(MatDialog);
  readonly #classroomsService = inject(ClassroomsService);
  readonly #router = inject(Router);

  openDeleteClassroomDialog({ label, id }: ClassroomDetail) {
    const dialogRef = this.#matDialog.open(YesNoDialogComponent, {
      restoreFocus: false,
      data: <YesNoDialogInputs>{
        title: 'Delete classroom',
        subtitle: `Are you sure you want to delete classroom '${
          label
        }' and all of its data?`,
      },
    });
    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        this.#classroomsService.deleteClassroom(id).subscribe(() => {
          this.#router.navigate(['/classrooms']);
        });
      }
    });
  }
}
