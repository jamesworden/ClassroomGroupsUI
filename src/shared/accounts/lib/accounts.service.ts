import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { computed, inject, Injectable, signal } from "@angular/core";
import { catchError, map, Observable, throwError } from "rxjs";
import { Account } from "./models";

@Injectable({
    providedIn: 'root',
})
export class AccountsService {
    readonly #httpClient = inject(HttpClient)

    private _account = signal<Account | undefined>(undefined)
    public account = this._account.asReadonly();

    public isLoggedIn = computed(() => !!this._account())

    getAccount(): Observable<Account> {
        return this.#httpClient.get<Account>('/api/v1/authentication/get-account', {
            withCredentials: true
        }).pipe(
            map((account) => {
                this._account.set(account)
                return account
            }),
            catchError((error: HttpErrorResponse) => {
                if (error.status === 403) {
                    this._account.set(undefined);
                }
                return throwError(() => error)
            })
        )
    }

    logout() {
        return this.#httpClient.post('/api/v1/authentication/logout', {
            withCredentials: true,
        })
    }
}