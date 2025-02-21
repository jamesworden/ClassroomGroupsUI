import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ToolbarComponent } from '@app/components';
import { Themes, ThemeService } from '@app/themes';
import { AccountsService } from '@shared/accounts';
import { FeatureCardComponent } from './feature-card/feature-card.component';

@Component({
  selector: 'app-landing-view',
  imports: [
    MatIconModule,
    CommonModule,
    ToolbarComponent,
    RouterModule,
    FeatureCardComponent,
  ],
  templateUrl: './landing-view.component.html',
  styleUrl: './landing-view.component.scss',
})
export class LandingViewComponent {
  readonly #accountsService = inject(AccountsService);
  readonly #themeService = inject(ThemeService);

  readonly isLoggedIn = this.#accountsService.select.isLoggedIn;
  readonly theme = this.#themeService.theme;

  readonly Themes = Themes;
  readonly fullYear = new Date().getFullYear();

  toggleTheme() {
    this.#themeService.toggleTheme();
  }
}
