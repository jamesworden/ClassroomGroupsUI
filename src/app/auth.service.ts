import { computed, Injectable, signal } from "@angular/core";

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly _authToken = signal<string | undefined>(undefined)

    public readonly authToken = this._authToken.asReadonly()

    public readonly isAuthenticated = computed(() => {
        const authToken = this.authToken()
        console.log(!!authToken)
        return !!authToken
    })

    constructor() {
        setTimeout(() => {
            const authToken = this.getCookie('.AspNetCore.Cookies')
            if (authToken) {
                console.log(authToken)
                this._authToken.set(authToken)
            }
        }, 1000)

    }

    private getCookie(name: string): string | null {
        const value = `; ${document.cookie}`;
        console.log(document.cookie)
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop()?.split(';').shift() || null;
        }
        return null;
    }
}