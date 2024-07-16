import { Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { getClassrooms } from './classrooms.actions';
import { Classroom } from './classrooms.reducer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  readonly #store = inject(Store<{ classrooms: Classroom[] }>);

  readonly classrooms = toSignal(this.#store.select('classrooms'));

  ngOnInit() {
    this.#store.dispatch(getClassrooms());
  }
}
