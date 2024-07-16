import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { increment, decrement, reset } from './classrooms.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  readonly #store = inject(Store<{ count: number }>);

  readonly count = toSignal(this.#store.select('count'));

  increment() {
    this.#store.dispatch(increment());
  }

  decrement() {
    this.#store.dispatch(decrement());
  }

  reset() {
    this.#store.dispatch(reset());
  }
}
