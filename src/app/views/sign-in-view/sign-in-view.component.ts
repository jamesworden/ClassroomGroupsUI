import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GoogleSignInButtonComponent } from '@ui-inputs';
import { ToolbarComponent } from 'app/components/toolbar/toolbar.component';
import { Themes } from 'app/themes/theme.models';
import { ThemeService } from 'app/themes/theme.service';

@Component({
  selector: 'app-sign-in-view',
  standalone: true,
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
