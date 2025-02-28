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
import { MAX_GROUP_NAME_LENGTH } from '@shared/classrooms';

export interface CreateEditGroupDialogInputs {
  title: string;
  initialLabel?: string;
  initialDescription?: string;
  isEditing?: boolean;
}

export interface CreateEditGroupDialogOutputs {
  label: string;
}

@Component({
  selector: 'app-create-edit-group-dialog',
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
  templateUrl: './create-edit-group-dialog.component.html',
  styleUrl: './create-edit-group-dialog.component.scss',
})
export class CreateEditGroupDialogComponent implements OnInit {
  readonly #fb = inject(FormBuilder);
  readonly #matDialogRef = inject(MatDialogRef);

  @ViewChild('labelInput') labelInput!: ElementRef<HTMLInputElement>;

  form: FormGroup;

  readonly MAX_GROUP_NAME_LENGTH = MAX_GROUP_NAME_LENGTH;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CreateEditGroupDialogInputs
  ) {
    this.form = this.#fb.group({
      label: [data.initialLabel || '', [Validators.maxLength(50)]],
    });
  }

  ngOnInit() {
    this.labelInput?.nativeElement.focus();
  }

  onSubmit() {
    if (this.form.valid) {
      const result: CreateEditGroupDialogOutputs = {
        label: this.form.value.label.trim(),
      };

      this.#matDialogRef.close(result);
    }
  }

  onCancel() {
    this.#matDialogRef.close();
  }
}
