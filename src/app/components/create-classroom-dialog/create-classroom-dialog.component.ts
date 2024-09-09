import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface CreateClassroomDialogResults {
  label: string;
  description: string;
}

@Component({
  selector: 'app-create-classroom-dialog',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './create-classroom-dialog.component.html',
  styleUrl: './create-classroom-dialog.component.scss',
})
export class CreateClassroomDialogComponent {
  label = '';
  description = '';

  createClassroom(): CreateClassroomDialogResults {
    return {
      description: this.description,
      label: this.label,
    };
  }
}
