import { computed, inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { YesNoDialogComponent, YesNoDialogInputs } from '@app/components';
import { AccountsService } from '@shared/accounts';
import { ClassroomDetail, ClassroomsService } from '@shared/classrooms';

@Injectable({
  providedIn: 'root',
})
export class ClassroomsPageService {
  readonly #matDialog = inject(MatDialog);
  readonly #classroomsService = inject(ClassroomsService);
  readonly #accountsService = inject(AccountsService);

  public readonly reachedClassroomLimit = computed(
    () =>
      this.#classroomsService.select.classroomDetails().length >=
      this.#accountsService.select.maxClassrooms()
  );

  public openDeleteClassroomDialog({ label, id }: ClassroomDetail) {
    this.#matDialog
      .open(YesNoDialogComponent, {
        restoreFocus: false,
        data: <YesNoDialogInputs>{
          title: 'Delete classroom',
          subtitle: `Are you sure you want to delete classroom '${
            label
          }' and all of its data?`,
        },
      })
      .afterClosed()
      .subscribe(
        (success) => success && this.#classroomsService.deleteClassroom(id)
      );
  }
}
