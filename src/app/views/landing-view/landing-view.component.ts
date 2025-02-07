import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ToolbarComponent } from '@app/components';
import { Themes, ThemeService } from '@app/themes';
import { AccountsService } from '@shared/accounts';

@Component({
  selector: 'app-landing-view',
  imports: [MatIconModule, CommonModule, ToolbarComponent, RouterModule],
  templateUrl: './landing-view.component.html',
  styleUrl: './landing-view.component.scss',
})
export class LandingViewComponent {
  readonly #accountsService = inject(AccountsService);
  readonly #themeService = inject(ThemeService);

  readonly isLoggedIn = this.#accountsService.select.isLoggedIn;
  readonly Themes = Themes;
  readonly theme = this.#themeService.theme;

  toggleTheme() {
    this.#themeService.toggleTheme();
  }
}
