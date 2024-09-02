import { effect, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AccountsService } from '@shared/accounts';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  readonly #router = inject(Router);
  readonly #accountsService = inject(AccountsService);

  readonly isLoggedIn = this.#accountsService.isLoggedIn;

  constructor() {
    effect(() => {
      if (!this.isLoggedIn()) {
        this.#router.navigate(['/']);
      }
    });
  }
}
