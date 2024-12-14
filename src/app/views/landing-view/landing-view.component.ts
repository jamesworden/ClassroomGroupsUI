import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AccountsService } from '@shared/accounts';
import { GoogleSignInButtonComponent } from '@ui-inputs';
import { Themes } from 'app/themes/theme.models';
import { ThemeService } from 'app/themes/theme.service';

@Component({
  selector: 'app-landing-view',
  standalone: true,
  imports: [GoogleSignInButtonComponent, MatIconModule, CommonModule],
  templateUrl: './landing-view.component.html',
  styleUrl: './landing-view.component.scss',
})
export class LandingViewComponent {
  readonly #accountsService = inject(AccountsService);
  readonly #router = inject(Router);
  readonly #themeService = inject(ThemeService);

  readonly isLoggedIn = this.#accountsService.select.isLoggedIn;
  readonly Themes = Themes;
  readonly theme = this.#themeService.theme;

  constructor() {
    effect(() => {
      if (this.isLoggedIn()) {
        this.#router.navigate(['classrooms']);
      }
    });
  }

  toggleTheme() {
    this.#themeService.toggleTheme();
  }
}
