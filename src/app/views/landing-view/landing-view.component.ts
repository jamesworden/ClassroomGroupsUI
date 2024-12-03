import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AccountsService } from '@shared/accounts';
import { GoogleSignInButtonComponent } from '@ui-inputs';

@Component({
  selector: 'app-landing-view',
  standalone: true,
  imports: [GoogleSignInButtonComponent],
  templateUrl: './landing-view.component.html',
  styleUrl: './landing-view.component.scss',
})
export class LandingViewComponent {
  readonly #accountsService = inject(AccountsService);
  readonly #router = inject(Router);

  readonly isLoggedIn = this.#accountsService.select.isLoggedIn;

  constructor() {
    effect(() => {
      if (this.isLoggedIn()) {
        this.#router.navigate(['classrooms']);
      }
    });
  }
}
