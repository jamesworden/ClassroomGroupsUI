import { Component, computed, inject, input, signal } from '@angular/core';
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
import {
  Classroom,
  ClassroomsService,
  Column,
  ColumnSort,
  Configuration,
  Field,
  FieldType,
  generateUniqueId,
} from '@shared/classrooms';

export interface CreateEditColumnDialogOutputs {
  column: Column;
  field: Field;
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
  readonly #classroomsService = inject(ClassroomsService);

  readonly viewingClassroom = input<Classroom>();
  readonly viewingConfiguration = input<Configuration>();

  readonly viewingColumns = computed(
    () => []
    // this.#classroomsService.columns(this.viewingConfiguration()?.id)
  );

  readonly Type = FieldType;

  public readonly dialogRef = inject(
    MatDialogRef<CreateEditColumnDialogComponent>
  );

  readonly title = signal(this.#data.title);

  readonly column: Column = {
    enabled: true,
    fieldId: '',
    id: '',
    sort: ColumnSort.NONE,
    configurationId: '',
    ordinal: this.viewingColumns().length - 1,
  };

  readonly field: Field = {
    id: '',
    label: '',
    type: FieldType.TEXT,
    classroomId: this.viewingClassroom()?.id ?? '',
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
      sort: this.#data.existingData?.column?.sort ?? ColumnSort.NONE,
      fieldId,
      configurationId: '',
      ordinal: this.viewingColumns().length - 1,
    };
    this.field = {
      id: fieldId,
      label: this.#data.existingData?.field?.label ?? '',
      type: this.#data.existingData?.field?.type ?? FieldType.TEXT,
      classroomId: this.viewingClassroom()?.id ?? '',
    };
  }

  setFieldNameIsValid() {
    this.fieldNameIsValid = this.field.label.trim().length > 0;
  }
}
