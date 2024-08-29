import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ClassroomsService } from '@shared/classrooms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-classrooms-view',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTableModule],
  templateUrl: './classrooms-view.component.html',
  styleUrl: './classrooms-view.component.scss',
  providers: [provideNativeDateAdapter()],
})
export class ClassroomsViewComponent {
  readonly #classroomsService = inject(ClassroomsService);
  readonly #router = inject(Router);

  readonly classrooms = this.#classroomsService.classrooms;

  displayedColumns = ['label', 'description'];

  constructor() {
    this.#classroomsService.getClassroomsDetails();
  }

  viewClassroom(id: string) {
    this.#router.navigate(['/classrooms', id]);
  }
}
