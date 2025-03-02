import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToolbarComponent } from '@app/components';
import { Themes, ThemeService } from '@app/themes';
import { GoogleSignInButtonComponent } from '@shared/ui-inputs';

@Component({
  selector: 'app-sign-in-page',
  imports: [
    ToolbarComponent,
    CommonModule,
    RouterModule,
    GoogleSignInButtonComponent,
  ],
  templateUrl: './sign-in-page.component.html',
  styleUrl: './sign-in-page.component.scss',
})
export class SignInPageComponent {
  readonly #themeService = inject(ThemeService);

  readonly theme = this.#themeService.theme;

  readonly Themes = Themes;

  readonly fullYear = new Date().getFullYear();
}
