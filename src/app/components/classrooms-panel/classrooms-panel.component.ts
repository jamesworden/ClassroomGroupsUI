import {
  Component,
  computed,
  ElementRef,
  inject,
  output,
  Signal,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Classroom } from '../../models/classroom.models';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClassroomsService } from '../../classrooms.service';

@Component({
  selector: 'app-classrooms-panel',
  standalone: true,
  imports: [
    MatIconModule,
    FormsModule,
    MatInputModule,
    MatListModule,
    MatFormFieldModule,
    MatDividerModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './classrooms-panel.component.html',
  styleUrl: './classrooms-panel.component.scss',
})
export class ClassroomsPanelComponent {
  readonly #matSnackBar = inject(MatSnackBar);
  readonly #classroomsService = inject(ClassroomsService);

  readonly classAndConfigPanelClosed = output();

  @ViewChild('scrollContainer')
  scrollContainer!: ElementRef<HTMLElement>;

  readonly classrooms = this.#classroomsService.classrooms;
  readonly viewingClassroomId = this.#classroomsService.viewingClassroomId;
  readonly searchQuery = signal('');

  addClassroomLabel = '';

  filteredClassrooms: Signal<Classroom[]> = computed(() =>
    this.classrooms().filter((classroom) =>
      classroom.label
        .toLowerCase()
        .includes(this.searchQuery().trim().toLowerCase())
    )
  );

  selectClassroom(classroomId: string) {
    // this.#classroomsService.viewClassroom(classroomId);
  }

  addClassroom() {
    if (this.addClassroomLabel.trim().length <= 0) {
      this.#matSnackBar.open(
        'Please enter the name of the classroom.',
        'Hide',
        {
          duration: 3000,
        }
      );
      return;
    }
    this.#classroomsService.addClassroom(this.addClassroomLabel);
    this.addClassroomLabel = '';
    this.#matSnackBar.open('Classroom created', 'Hide', {
      duration: 3000,
    });
    // TODO: Turn into an ofActionSuccessful
    setTimeout(() => {
      this.scrollContainer.nativeElement.scrollTo({
        top: this.scrollContainer.nativeElement.scrollHeight,
        behavior: 'smooth',
      });
    });
  }
}
