import {
  Component,
  inject,
  signal,
  OnInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
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
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
  ],
  template: `
    <div class="p-4">
      <h2 mat-dialog-title>{{ title() }}</h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="flex flex-col gap-y-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Column name</mat-label>
            <input
              formControlName="label"
              type="text"
              matInput
              placeholder="Enter column name"
              #columnNameInput
            />
            <mat-error *ngIf="form.get('label')?.errors?.['required']">
              Column name is required
            </mat-error>
          </mat-form-field>

          @if (!existingData()?.columnDetail?.type) {
            <div class="mb-2">
              <mat-radio-group formControlName="type" class="flex gap-x-4">
                <mat-radio-button color="primary" [value]="Type.NUMBER">
                  Grade
                </mat-radio-button>
                <mat-radio-button color="primary" [value]="Type.TEXT">
                  Text
                </mat-radio-button>
              </mat-radio-group>
            </div>
          }
        </div>

        <div mat-dialog-actions class="flex justify-end gap-x-2 mt-4">
          <button type="button" mat-button (click)="onCancel()">Cancel</button>
          <button
            type="submit"
            mat-raised-button
            color="primary"
            [disabled]="!form.valid"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 300px;
        max-width: 400px;
      }

      mat-radio-group {
        margin-bottom: 16px;
      }
    `,
  ],
})
export class CreateEditColumnDialogComponent implements OnInit {
  @ViewChild('columnNameInput') columnNameInput!: ElementRef;

  readonly #data = inject<CreateEditColumnDialogInputs>(MAT_DIALOG_DATA);
  public readonly dialogRef = inject(
    MatDialogRef<CreateEditColumnDialogComponent>
  );
  private fb = inject(FormBuilder);

  readonly canceled = signal(undefined);
  readonly title = signal(this.#data.title);
  readonly existingData = signal(this.#data.existingData);

  readonly Type = FieldType;

  form!: FormGroup;

  ngOnInit(): void {
    // Initialize the form with FormBuilder
    this.form = this.fb.group({
      label: [
        this.existingData()?.columnDetail?.label || '',
        [Validators.required],
      ],
      type: [this.existingData()?.columnDetail?.type || FieldType.NUMBER],
    });

    // Focus the input field when the dialog opens
    setTimeout(() => {
      if (this.columnNameInput) {
        this.columnNameInput.nativeElement.focus();
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValues = this.form.value;
      this.dialogRef.close({
        type: formValues.type,
        label: formValues.label.trim(),
      } as CreateEditColumnDialogOutputs);
    }
  }

  onCancel(): void {
    this.dialogRef.close(this.canceled());
  }
}
