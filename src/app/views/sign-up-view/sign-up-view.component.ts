import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToolbarComponent } from '@app/components';
import { Themes, ThemeService } from '@app/themes';
import { GoogleSignInButtonComponent } from '@ui-inputs';

@Component({
  selector: 'app-sign-up-view',
  imports: [
    CommonModule,
    ToolbarComponent,
    GoogleSignInButtonComponent,
    RouterModule,
  ],
  templateUrl: './sign-up-view.component.html',
  styleUrl: './sign-up-view.component.scss',
})
export class SignUpViewComponent {
  readonly #themeService = inject(ThemeService);

  readonly theme = this.#themeService.theme;
  readonly Themes = Themes;
}
