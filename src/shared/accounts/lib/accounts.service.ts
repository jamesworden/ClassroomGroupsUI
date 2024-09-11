import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, of, tap } from 'rxjs';
import { Account } from './models';

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  readonly #httpClient = inject(HttpClient);

  private _accountLoading = signal(true);
  public accountLoading = this._accountLoading.asReadonly();

  private _account = signal<Account | undefined>(undefined);
  public account = this._account.asReadonly();

  public isLoggedIn = computed(() => !!this._account());

  constructor() {
    this.getAccount();
  }

  getAccount() {
    return this.#httpClient
      .get<Account>('/api/v1/authentication/get-account', {
        withCredentials: true,
      })
      .pipe(
        tap(() => {
          this._accountLoading.set(true);
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status !== 403) {
            console.error('Error fetching account:', error);
          }
          return of(null);
        }),
        finalize(() => {
          this._accountLoading.set(false);
        })
      )
      .subscribe((account) => {
        if (account) {
          this._account.set(account);
          console.log('[Account]:', account);
        }
      });
  }

  logout() {
    return this.#httpClient
      .post('/api/v1/authentication/logout', {
        withCredentials: true,
      })
      .subscribe(() => {
        this.reset();
      });
  }

  reset() {
    this._account.set(undefined);
    this._accountLoading.set(false);
  }
}
