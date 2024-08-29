import { Component, effect, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AccountsService } from '@shared/accounts';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  readonly #accountsService = inject(AccountsService);
  readonly #router = inject(Router);

  readonly isLoggedIn = this.#accountsService.isLoggedIn;

  constructor() {
    effect(() => {
      if (!this.isLoggedIn()) {
        this.#router.navigate(['/']);
      }
    });
  }
}
