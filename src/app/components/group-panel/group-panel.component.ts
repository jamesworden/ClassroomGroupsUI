import { Component, computed, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassroomsService, GroupDetail } from '@shared/classrooms';
import { StudentListComponent } from '../student-list/student-list.component';

@Component({
  selector: 'app-group-panel',
  standalone: true,
  imports: [
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    StudentListComponent,
  ],
  templateUrl: './group-panel.component.html',
  styleUrl: './group-panel.component.scss',
})
export class GroupPanelComponent {
  readonly #classroomsService = inject(ClassroomsService);
  readonly #matSnackBar = inject(MatSnackBar);

  readonly classroomId = input<string>();
  readonly groupDetail = input<GroupDetail>();

  readonly groupDeleted = output<void>();
  readonly studentCreated = output<void>();
  readonly labelUpdated = output<string>();

  readonly students = computed(() => this.groupDetail()?.studentDetails ?? []);

  readonly studentsInGroup = computed(() =>
    this.students().filter(
      (student) => student.groupId === this.groupDetail()?.id
    )
  );

  createStudent() {
    this.studentCreated.emit();
  }

  deleteGroup() {
    const groupDetail = this.groupDetail();
    if (groupDetail) {
      this.groupDeleted.emit();
    }
  }

  updateLabel(event: Event) {
    const label = (event.target as HTMLInputElement)?.value;
    this.labelUpdated.emit(label);
  }
}
