import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface CreateEditConfigurationDialogInputs {
  title: string;
  initialLabel?: string;
  isEditing?: boolean;
}

export interface CreateEditConfigurationDialogOutputs {
  label: string;
}

@Component({
  selector: 'app-create-edit-configuration-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="p-6">
      <h2 class="text-xl font-medium mb-6">{{ data.title }}</h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-form-field class="w-full">
          <mat-label>Configuration Name</mat-label>
          <input
            matInput
            formControlName="label"
            placeholder="Enter configuration name"
            #labelInput
            autocomplete="off"
          />
          <mat-error *ngIf="form.get('label')?.errors?.['required']">
            Configuration name is required
          </mat-error>
          <mat-error *ngIf="form.get('label')?.errors?.['maxlength']">
            Configuration name must be 50 characters or less
          </mat-error>
        </mat-form-field>

        <div class="flex justify-end gap-3 mt-6">
          <button mat-button type="button" (click)="onCancel()">Cancel</button>
          <button
            mat-raised-button
            color="primary"
            type="submit"
            [disabled]="!form.valid"
          >
            {{ data.isEditing ? 'Save' : 'Create' }}
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
    `,
  ],
})
export class CreateEditConfigurationDialogComponent implements OnInit {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateEditConfigurationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CreateEditConfigurationDialogInputs
  ) {
    this.form = this.fb.group({
      label: [
        data.initialLabel || '',
        [Validators.required, Validators.maxLength(50)],
      ],
    });
  }

  ngOnInit(): void {
    // Focus the input field when the dialog opens
    setTimeout(() => {
      const labelInput = document.querySelector(
        'input[formControlName="label"]'
      ) as HTMLInputElement;
      if (labelInput) {
        labelInput.focus();
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close({
        label: this.form.value.label.trim(),
      } as CreateEditConfigurationDialogOutputs);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
