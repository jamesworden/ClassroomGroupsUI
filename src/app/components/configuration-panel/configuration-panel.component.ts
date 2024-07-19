import { Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Store } from '@ngrx/store';
import {
  selectViewingClassroom,
  selectViewingClassroomId,
  selectViewingConfiguration,
  selectViewingConfigurationId,
} from '../../state/classrooms/classrooms.selectors';
import {
  createColumn,
  deleteConfiguration,
  updateColumns,
  updateConfigurationDescription,
  updateConfigurationLabel,
} from '../../state/classrooms/classrooms.actions';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  YesNoDialogComponent,
  YesNoDialogInputs,
} from '../yes-no-dialog/yes-no-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { ClassroomConfigurationColumn } from '../../models/classroom.models';
import {
  CreateEditColumnDialogComponent,
  CreateEditColumnDialogInputs,
} from '../create-edit-column-dialog/create-edit-column-dialog.component';

@Component({
  selector: 'app-configuration-panel',
  standalone: true,
  imports: [
    MatSlideToggleModule,
    MatInputModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule,
    CdkDrag,
    CdkDropList,
  ],
  templateUrl: './configuration-panel.component.html',
  styleUrl: './configuration-panel.component.scss',
})
export class ConfigurationPanelComponent {
  readonly #store = inject(Store);
  readonly #matDialog = inject(MatDialog);

  readonly viewingConfiguration = toSignal(
    this.#store.select(selectViewingConfiguration)
  );

  readonly viewingClassroomId = toSignal(
    this.#store.select(selectViewingClassroomId),
    {
      initialValue: '',
    }
  );

  readonly viewingConfigurationId = toSignal(
    this.#store.select(selectViewingConfigurationId),
    {
      initialValue: '',
    }
  );

  readonly viewingClassroom = toSignal(
    this.#store.select(selectViewingClassroom)
  );

  averageScores = false;
  groupingByDivision = false;
  groupingValue = 0;
  updatedDescription = '';
  updatedLabel = '';
  columns: ClassroomConfigurationColumn[] = [];

  constructor() {
    effect(
      () =>
        (this.updatedDescription =
          this.viewingConfiguration()?.description ?? '')
    );
    effect(
      () => (this.updatedLabel = this.viewingConfiguration()?.label ?? '')
    );
    effect(
      () => (this.columns = [...(this.viewingConfiguration()?.columns ?? [])])
    );
  }

  toggleGroupingType() {
    this.groupingByDivision = !this.groupingByDivision;
  }

  updateDescription() {
    this.#store.dispatch(
      updateConfigurationDescription({
        classroomId: this.viewingClassroomId(),
        description: this.updatedDescription,
        configurationId: this.viewingConfigurationId(),
      })
    );
  }

  updateLabel() {
    this.#store.dispatch(
      updateConfigurationLabel({
        classroomId: this.viewingClassroomId(),
        label: this.updatedLabel,
        configurationId: this.viewingConfigurationId(),
      })
    );
  }

  openDeleteConfigurationModal() {
    const dialogRef = this.#matDialog.open(YesNoDialogComponent, {
      restoreFocus: false,
      data: <YesNoDialogInputs>{
        title: 'Delete classroom',
        subtitle: `Are you sure you want to delete the classroom ${
          this.viewingConfiguration()?.label
        } and all of it's data?`,
      },
    });
    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        this.#store.dispatch(
          deleteConfiguration({
            classroomId: this.viewingClassroomId(),
            configurationId: this.viewingConfigurationId(),
          })
        );
      }
    });
  }

  drop(event: CdkDragDrop<ClassroomConfigurationColumn>) {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
    this.#store.dispatch(
      updateColumns({
        classroomId: this.viewingClassroomId(),
        configurationId: this.viewingConfigurationId(),
        columns: this.columns,
      })
    );
  }

  openCreateColumnDialog() {
    const dialogRef = this.#matDialog.open(CreateEditColumnDialogComponent, {
      restoreFocus: false,
      data: <CreateEditColumnDialogInputs>{
        title: 'Create Column',
      },
    });
    dialogRef.afterClosed().subscribe((column) => {
      if (column) {
        console.log(column);
        this.#store.dispatch(
          createColumn({
            classroomId: this.viewingClassroomId(),
            configurationId: this.viewingConfigurationId(),
            column,
          })
        );
      }
    });
  }
}
