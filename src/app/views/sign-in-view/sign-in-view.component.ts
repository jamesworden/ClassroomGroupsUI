import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToolbarComponent } from '@app/components';
import { Themes, ThemeService } from '@app/themes';
import { GoogleSignInButtonComponent } from '@ui-inputs';

@Component({
  selector: 'app-sign-in-view',
  imports: [
    ToolbarComponent,
    CommonModule,
    RouterModule,
    GoogleSignInButtonComponent,
  ],
  templateUrl: './sign-in-view.component.html',
  styleUrl: './sign-in-view.component.scss',
})
export class SignInViewComponent {
  readonly #themeService = inject(ThemeService);

  readonly theme = this.#themeService.theme;
  readonly Themes = Themes;
}
