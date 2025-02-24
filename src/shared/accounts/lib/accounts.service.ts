import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, of, take, tap } from 'rxjs';
import { Account, GetAccountResponse } from './models';
import { create } from 'mutative';
import { environment } from 'environments/environment';
import { AccountSelectors } from './accounts.selectors';
import { Router } from '@angular/router';

export interface AccountsState {
  accountLoading: boolean;
  account?: Account;
}

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  readonly #httpClient = inject(HttpClient);
  readonly #router = inject(Router);

  private readonly _state = signal<AccountsState>({
    accountLoading: true,
  });

  public readonly select = new AccountSelectors(this._state.asReadonly());

  constructor() {
    this.getAccount();
  }

  public patchState(strategy: (draft: AccountsState) => void) {
    this._state.set(
      create(this._state(), (draft) => {
        strategy(draft);
      })
    );
  }

  getAccount() {
    this.patchState((draft) => {
      draft.accountLoading = true;
    });
    return this.#httpClient
      .get<GetAccountResponse>(
        `${environment.BASE_API}/api/v1/authentication/account`,
        {
          withCredentials: true,
        }
      )
      .pipe(
        tap(({ account }) => {
          if (account) {
            console.log('[Got Account]', account);
            this.patchState((draft) => {
              draft.account = account;
            });
          }
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status !== 403) {
            console.error('[Failed to Get Account]', error);
          }
          return of(null);
        }),
        finalize(() => {
          this.patchState((draft) => {
            draft.accountLoading = false;
          });
        }),
        take(1)
      )
      .subscribe();
  }

  logout() {
    return this.#httpClient
      .post(`${environment.BASE_API}/api/v1/authentication/logout`, {
        withCredentials: true,
      })
      .pipe(
        tap(() => {
          this.#router.navigate(['/']);
        }),
        finalize(() => {
          this.patchState((draft) => {
            draft.account = undefined;
            draft.accountLoading = false;
          });
        }),
        take(1)
      )
      .subscribe();
  }
}
