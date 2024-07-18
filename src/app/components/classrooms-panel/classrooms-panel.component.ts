import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Signal,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { select, Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Classroom } from '../../models/classroom.models';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { ClassroomsState } from '../../state/classrooms/classrooms.reducer';
import {
  addClassroom,
  viewClassroom,
} from '../../state/classrooms/classrooms.actions';
import {
  selectClassrooms,
  selectViewingClassroomId,
} from '../../state/classrooms/classrooms.selectors';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  ],
  templateUrl: './classrooms-panel.component.html',
  styleUrl: './classrooms-panel.component.scss',
})
export class ClassroomsPanelComponent {
  readonly #store = inject(Store<{ state: ClassroomsState }>);
  readonly #matSnackBar = inject(MatSnackBar);

  @ViewChild('scrollContainer')
  scrollContainer!: ElementRef<HTMLElement>;

  readonly classrooms = toSignal(this.#store.select(selectClassrooms));
  readonly shownClassroomId = toSignal(
    this.#store.select(selectViewingClassroomId)
  );

  readonly searchQuery = signal('');

  addClassroomLabel = '';

  filteredClassrooms: Signal<Classroom[]> = computed(() => {
    const classrooms = this.classrooms();
    if (!classrooms) {
      return [];
    }
    const query = this.searchQuery();
    return classrooms.filter((classroom) =>
      classroom.label.includes(query.trim())
    );
  });

  selectClassroom(classroomId: string) {
    this.#store.dispatch(viewClassroom({ classroomId }));
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
    this.#store.dispatch(
      addClassroom({ classroomLabel: this.addClassroomLabel })
    );
    this.addClassroomLabel = '';
    this.#matSnackBar.open('Classroom created.', 'Hide', {
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
