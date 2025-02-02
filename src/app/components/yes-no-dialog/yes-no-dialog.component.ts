import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

export interface YesNoDialogInputs {
  title: string;
  subtitle: string;
}

@Component({
    selector: 'app-yes-no-dialog',
    imports: [
        MatButtonModule,
        MatDialogActions,
        MatDialogClose,
        MatDialogTitle,
        MatDialogContent,
    ],
    templateUrl: './yes-no-dialog.component.html',
    styleUrl: './yes-no-dialog.component.scss'
})
export class YesNoDialogComponent {
  readonly #data = inject<YesNoDialogInputs>(MAT_DIALOG_DATA);
  public readonly dialogRef = inject(MatDialogRef<YesNoDialogComponent>);

  readonly title = this.#data.title;
  readonly subtitle = this.#data.subtitle;

  readonly yesSelected = signal(true);
  readonly noSelected = signal(false);
}
