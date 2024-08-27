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

    getAccount() {
        return this.#httpClient.get<Account>('/api/v1/authentication/get-account', {
            withCredentials: true
        }).subscribe((account) => {
            this._account.set(account)
            console.log(account)
            return account
        })
    }

    logout() {
        return this.#httpClient.post('/api/v1/authentication/logout', {
            withCredentials: true,
        })
    }
}