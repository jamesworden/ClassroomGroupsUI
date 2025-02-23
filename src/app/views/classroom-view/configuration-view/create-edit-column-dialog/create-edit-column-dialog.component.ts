import { Component, inject, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ColumnDetail, FieldType } from '@shared/classrooms';

export interface CreateEditColumnDialogOutputs {
  type: FieldType;
  label: string;
}

export interface CreateEditColumnDialogInputs {
  title: string;
  existingData?: {
    columnDetail: ColumnDetail;
  };
}

@Component({
  selector: 'app-create-edit-column-dialog',
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
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

  public readonly dialogRef = inject(
    MatDialogRef<CreateEditColumnDialogComponent>
  );

  readonly canceled = signal(undefined);
  readonly title = signal(this.#data.title);
  readonly existingData = signal(this.#data.existingData);

  readonly Type = FieldType;

  label?: string;
  type = FieldType.NUMBER;
  fieldNameIsValid = false;

  readonly saved = () =>
    signal<CreateEditColumnDialogOutputs>({
      type: this.type,
      label: this.label ?? '',
    });

  setFieldNameIsValid() {
    this.fieldNameIsValid = (this.label?.trim().length ?? 0) > 0;
  }
}
