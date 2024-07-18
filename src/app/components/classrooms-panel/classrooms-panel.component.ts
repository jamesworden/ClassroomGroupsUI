import { Component, computed, inject, Signal, signal } from '@angular/core';
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
import { viewClassroom } from '../../state/classrooms/classrooms.actions';
import {
  selectClassrooms,
  selectViewingClassroomId,
} from '../../state/classrooms/classrooms.selectors';

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

  readonly classrooms = toSignal(this.#store.select(selectClassrooms));
  readonly shownClassroomId = toSignal(
    this.#store.select(selectViewingClassroomId)
  );

  readonly searchQuery = signal('');

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
}
