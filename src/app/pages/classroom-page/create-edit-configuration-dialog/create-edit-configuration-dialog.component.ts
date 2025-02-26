import {
  Component,
  Inject,
  inject,
  ViewChild,
  ElementRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
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
  templateUrl: './create-edit-configuration-dialog.component.html',
  styleUrl: './create-edit-configuration-dialog.component.scss',
})
export class CreateEditConfigurationDialogComponent implements OnInit {
  readonly #fb = inject(FormBuilder);
  readonly #matDialogRef = inject(MatDialogRef);

  @ViewChild('labelInput') labelInput!: ElementRef<HTMLInputElement>;

  form: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CreateEditConfigurationDialogInputs
  ) {
    this.form = this.#fb.group({
      label: [
        data.initialLabel || '',
        [Validators.required, Validators.maxLength(50)],
      ],
    });
  }

  ngOnInit() {
    this.labelInput?.nativeElement.focus();
  }

  onSubmit() {
    if (this.form.valid) {
      this.#matDialogRef.close({ label: this.form.value.label.trim() });
    }
  }

  onCancel() {
    this.#matDialogRef.close();
  }
}
