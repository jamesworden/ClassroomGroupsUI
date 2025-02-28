import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToolbarComponent } from '@app/components';
import { Themes, ThemeService } from '@app/themes';
import { GoogleSignInButtonComponent } from '@ui-inputs';

@Component({
  selector: 'app-sign-up-page',
  imports: [
    CommonModule,
    ToolbarComponent,
    GoogleSignInButtonComponent,
    RouterModule,
  ],
  templateUrl: './sign-up-page.component.html',
  styleUrl: './sign-up-page.component.scss',
})
export class SignUpViewComponent {
  readonly #themeService = inject(ThemeService);

  readonly theme = this.#themeService.theme;

  readonly Themes = Themes;

  readonly fullYear = new Date().getFullYear();
}
