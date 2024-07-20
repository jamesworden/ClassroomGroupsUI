import { Component, inject, signal } from '@angular/core';
import {
  ClassroomColumn,
  ClassroomColumnSort,
  ClassroomFieldType,
  ClassroomField,
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
import { MatTooltipModule } from '@angular/material/tooltip';

export interface CreateEditColumnDialogOutputs {
  column: ClassroomColumn;
  field: ClassroomField;
}

export interface CreateEditColumnDialogInputs {
  title: string;
  existingData?: {
    column: ClassroomColumn;
    field: ClassroomField;
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

  readonly Type = ClassroomFieldType;

  public readonly dialogRef = inject(
    MatDialogRef<CreateEditColumnDialogComponent>
  );

  readonly title = signal(this.#data.title);

  readonly column: ClassroomColumn = {
    enabled: true,
    fieldId: '',
    id: '',
    sort: ClassroomColumnSort.NONE,
  };

  readonly field: ClassroomField = {
    id: '',
    label: '',
    type: ClassroomFieldType.TEXT,
  };

  readonly saved = () =>
    signal<CreateEditColumnDialogOutputs>({
      column: this.column,
      field: this.field,
    });

  readonly canceled = signal(undefined);

  fieldNameIsValid = false;

  constructor() {
    const fieldId = this.#data.existingData?.field?.id ?? generateUniqueId();

    this.column = {
      enabled: true,
      id: this.#data.existingData?.column?.id ?? generateUniqueId(),
      sort: this.#data.existingData?.column?.sort ?? ClassroomColumnSort.NONE,
      fieldId,
    };
    this.field = {
      id: fieldId,
      label: this.#data.existingData?.field?.label ?? '',
      type: this.#data.existingData?.field?.type ?? ClassroomFieldType.TEXT,
    };
  }

  setFieldNameIsValid() {
    this.fieldNameIsValid = this.field.label.trim().length > 0;
  }
}
