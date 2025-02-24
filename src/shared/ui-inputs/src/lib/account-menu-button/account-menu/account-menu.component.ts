import { Component, inject } from '@angular/core';
import { AccountsService } from '@shared/accounts';
import { GoogleSignInButtonComponent } from '@ui-inputs';

@Component({
  selector: 'app-account-menu',
  imports: [GoogleSignInButtonComponent],
  templateUrl: './account-menu.component.html',
  styleUrl: './account-menu.component.scss',
})
export class AccountMenuComponent {
  readonly #accountsService = inject(AccountsService);

  readonly isLoggedIn = this.#accountsService.select.isLoggedIn;
  readonly account = this.#accountsService.select.account;

  logout() {
    this.#accountsService.logout();
  }
}
