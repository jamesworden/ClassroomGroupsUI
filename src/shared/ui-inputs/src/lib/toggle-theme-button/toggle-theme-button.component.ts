import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Themes, ThemeService } from '@app/themes';

@Component({
  selector: 'app-toggle-theme-button>',
  imports: [MatTooltipModule, MatIconModule, MatButtonModule],
  templateUrl: './toggle-theme-button.component.html',
  styleUrl: './toggle-theme-button.component.scss',
})
export class ToggleThemeButtonComponent {
  readonly #themeService = inject(ThemeService);

  readonly theme = this.#themeService.theme;

  readonly Themes = Themes;

  toggleTheme() {
    this.#themeService.toggleTheme();
  }
}
