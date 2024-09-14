import { Component, inject, signal } from '@angular/core';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { Column, Field, FieldType } from '@shared/classrooms';

export interface CreateEditColumnDialogOutputs {
  type: FieldType;
  label: string;
}

export interface CreateEditColumnDialogInputs {
  title: string;
  existingData?: {
    column: Column;
    field: Field;
  };
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
    MatTooltipModule,
  ],
  templateUrl: './create-edit-column-dialog.component.html',
  styleUrl: './create-edit-column-dialog.component.scss',
})
export class CreateEditColumnDialogComponent {
  readonly #data = inject<CreateEditColumnDialogInputs>(MAT_DIALOG_DATA);

  readonly Type = FieldType;

  public readonly dialogRef = inject(
    MatDialogRef<CreateEditColumnDialogComponent>
  );

  readonly title = signal(this.#data.title);

  label?: string;
  type = FieldType.NUMBER;
  fieldNameIsValid = false;

  readonly saved = () =>
    signal<CreateEditColumnDialogOutputs>({
      type: this.type,
      label: this.label ?? '',
    });

  readonly canceled = signal(undefined);

  setFieldNameIsValid() {
    this.fieldNameIsValid = (this.label?.trim().length ?? 0) > 0;
  }
}
