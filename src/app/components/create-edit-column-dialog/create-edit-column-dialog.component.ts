import { Component, inject, signal } from '@angular/core';
import {
  ClassroomConfigurationColumn,
  ClassroomConfigurationColumnSort,
  ClassroomConfigurationColumnType,
} from '../../models/classroom.models';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { generateUniqueId } from '../../logic/generate-unique-id';

export interface CreateEditColumnDialogInputs {
  title: string;
  column?: ClassroomConfigurationColumn;
}

@Component({
  selector: 'app-create-edit-column-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    MatRadioModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
  ],
  templateUrl: './create-edit-column-dialog.component.html',
  styleUrl: './create-edit-column-dialog.component.scss',
})
export class CreateEditColumnDialogComponent {
  readonly #data = inject<CreateEditColumnDialogInputs>(MAT_DIALOG_DATA);

  readonly Type = ClassroomConfigurationColumnType;

  public readonly dialogRef = inject(
    MatDialogRef<CreateEditColumnDialogComponent>
  );

  readonly title = this.#data.title;
  readonly column: ClassroomConfigurationColumn = {
    enabled: true,
    id: this.#data.column?.id ?? generateUniqueId(),
    label: this.#data.column?.label ?? '',
    sort: this.#data.column?.sort ?? ClassroomConfigurationColumnSort.NONE,
    type: this.#data.column?.type ?? ClassroomConfigurationColumnType.TEXT,
  };

  readonly saved = signal(this.column);
  readonly canceled = signal(undefined);
}
