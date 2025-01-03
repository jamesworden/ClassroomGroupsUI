import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AccountsService } from '@shared/accounts';
import { ToolbarComponent } from 'app/components/toolbar/toolbar.component';
import { Themes } from 'app/themes/theme.models';
import { ThemeService } from 'app/themes/theme.service';

@Component({
  selector: 'app-landing-view',
  standalone: true,
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
