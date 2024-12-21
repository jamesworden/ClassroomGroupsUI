import { Component, effect, input, OnDestroy } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-google-sign-in-button',
  standalone: true,
  imports: [],
  template: `
    <div class="h-[44px] max-w-[222px]">
      <div
        id="g_id_onload"
        [attr.data-client_id]="GOOGLE_CLIENT_ID"
        [attr.data-context]="context()"
        data-ux_mode="redirect"
        [attr.data-login_uri]="GOOGLE_LOGIN_URI"
        data-auto_prompt="false"
      ></div>
      <div
        class="g_id_signin"
        data-type="standard"
        [attr.data-shape]="shape()"
        data-theme="outline"
        [attr.data-text]="text()"
        [attr.data-size]="size()"
        data-logo_alignment="left"
      ></div>
    </div>
  `,
})
export class GoogleSignInButtonComponent implements OnDestroy {
  readonly size = input<'large' | 'medium' | 'small'>('large');
  readonly shape = input<'rectangular' | 'pill' | 'square'>('rectangular');
  readonly context = input<'signin' | 'signup' | 'use'>('use');
  readonly text = input<'signin_with' | 'signup_with'>('signin_with');
  readonly isVisible = input(true);

  readonly GOOGLE_CLIENT_ID = environment.GOOGLE_CLIENT_ID;
  readonly GOOGLE_LOGIN_URI = `${environment.BASE_API}${environment.GOOGLE_LOGIN_URI}`;

  script: HTMLScriptElement | undefined;

  constructor() {
    effect(() => {
      if (this.isVisible()) {
        this.removeScriptIfExists();
        this.addScript();
      }
    });
  }

  ngOnDestroy() {
    this.removeScriptIfExists();
  }

  removeScriptIfExists() {
    if (this.script) {
      document.body.removeChild(this.script);
    }
  }

  addScript() {
    this.script = document.createElement('script');
    this.script.src = 'https://accounts.google.com/gsi/client';
    this.script.async = true;
    this.script.defer = true;
    document.body.appendChild(this.script);
  }
}
