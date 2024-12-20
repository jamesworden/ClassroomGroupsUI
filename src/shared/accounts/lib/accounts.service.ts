import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { catchError, finalize, of, take, tap } from 'rxjs';
import { Account, GetAccountResponse } from './models';
import { create } from 'mutative';
import { environment } from 'environments/environment';

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
        `${environment.BASE_API}/v1/authentication/account`,
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
      .post(`${environment.BASE_API}/v1/authentication/logout`, {
        withCredentials: true,
      })
      .pipe(
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
