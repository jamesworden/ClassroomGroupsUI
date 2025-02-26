import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ToolbarComponent } from '@app/components';
import { Themes, ThemeService } from '@app/themes';
import { AccountsService } from '@shared/accounts';

@Component({
  selector: 'app-page-not-found-view',
  imports: [RouterModule, ToolbarComponent, MatIconModule],
  templateUrl: './page-not-found-view.component.html',
  styleUrl: './page-not-found-view.component.scss',
})
export class NotFoundPageComponent {
  readonly #themeService = inject(ThemeService);
  readonly #accountService = inject(AccountsService);

  readonly theme = this.#themeService.theme;
  readonly isLoggedIn = this.#accountService.select.isLoggedIn;

  readonly Themes = Themes;
}
