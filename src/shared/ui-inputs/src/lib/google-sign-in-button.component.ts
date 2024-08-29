import { Component, effect, input, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-google-sign-in-button',
  standalone: true,
  imports: [],
  template: `
  <div class="h-[44px] max-w-[222px]">
  <div
      id="g_id_onload"
      data-client_id="379282615975-blkaldtgv9vuieo7hc2gmttkl2nb5983.apps.googleusercontent.com"
      data-context="signin"
      data-ux_mode="popup"
      data-login_uri="https://localhost:7192/classroom-groups/api/v1/authentication/login-with-google"
      data-redirecturi="https://localhost:4200/"
      data-auto_prompt="true"
    ></div>
    <div
      class="g_id_signin"
      data-type="standard"
      data-shape="rectangular"
      data-theme="outline"
      data-text="signin_with"
      [attr.data-size]="dataSize()"
      data-logo_alignment="left"
    ></div>
  </div>
  `,
})
export class GoogleSignInButtonComponent implements OnDestroy {
  dataSize = input('large')
  isVisible = input(true)

  script: HTMLScriptElement | undefined

  constructor() {
    effect(() => {
      if (this.isVisible()) {
        this.removeScriptIfExists()
        this.addScript()
      }
    })
  }

  ngOnDestroy() {
    this.removeScriptIfExists()
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
