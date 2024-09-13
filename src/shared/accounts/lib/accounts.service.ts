import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { catchError, finalize, of, take, tap } from 'rxjs';
import { Account, GetAccountResponse } from './models';

class AccountSelectors {
  constructor(private _state: Signal<AccountsState>) {}

  public readonly account = computed(() => this._state().account);

  public readonly isLoggedIn = computed(() => !!this._state().account);

  public readonly accountLoading = computed(() => this._state().accountLoading);
}

interface AccountsState {
  accountLoading: boolean;
  account?: Account;
}

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  readonly #httpClient = inject(HttpClient);

  private readonly _state = signal<AccountsState>({
    accountLoading: true,
  });

  public readonly select = new AccountSelectors(this._state.asReadonly());

  constructor() {
    this.getAccount();
  }

  private patchState(
    strategy: (state: AccountsState) => Partial<AccountsState>
  ) {
    const state = this._state();
    this._state.set({
      ...state,
      ...strategy(state),
    });
  }

  getAccount() {
    this.patchState(() => ({
      accountLoading: true,
    }));
    return this.#httpClient
      .get<GetAccountResponse>('/api/v1/authentication/account', {
        withCredentials: true,
      })
      .pipe(
        tap(({ account }) => {
          if (account) {
            console.log('[Got Account]', account);
            this.patchState(() => ({
              account,
            }));
          }
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status !== 403) {
            console.error('[Failed to Get Account]', error);
          }
          return of(null);
        }),
        finalize(() => {
          this.patchState(() => ({
            accountLoading: false,
          }));
        }),
        take(1)
      )
      .subscribe();
  }

  logout() {
    return this.#httpClient
      .post('/api/v1/authentication/logout', {
        withCredentials: true,
      })
      .pipe(
        finalize(() => {
          this.patchState(() => ({
            accountLoading: false,
            account: undefined,
          }));
        }),
        take(1)
      )
      .subscribe();
  }
}
