import { Injectable, signal } from "@angular/core";

@Injectable({
    providedIn: 'root',
})
export class AccountsService {
    private _isLoggedIn = signal(false)
    public isLoggedIn = this._isLoggedIn.asReadonly()
}