import { Component, computed, inject, Signal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { showClassroom } from '../../state/classrooms.actions';
import { Classroom } from '../../models/classroom.models';

@Component({
  selector: 'app-classrooms-panel',
  standalone: true,
  imports: [
    MatIconModule,
    FormsModule,
    MatInputModule,
    MatListModule,
    MatFormFieldModule,
  ],
  templateUrl: './classrooms-panel.component.html',
  styleUrl: './classrooms-panel.component.scss',
})
export class ClassroomsPanelComponent {
  readonly #store = inject(Store<{ classrooms: Classroom[] }>);
  readonly classrooms: Signal<Classroom[]> = toSignal(
    this.#store.select('classrooms')
  );

  readonly searchQuery = signal('');

  filteredClassrooms: Signal<Classroom[]> = computed(() => {
    const classrooms = this.classrooms();
    const query = this.searchQuery();
    console.log(classrooms, query);
    return classrooms.filter((classroom) =>
      classroom.label.includes(query.trim())
    );
  });

  selectClassroom(classroomId: string) {
    this.#store.dispatch(showClassroom({ classroomId }));
  }
}
