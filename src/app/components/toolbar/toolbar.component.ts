import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { Themes } from 'app/themes/theme.models';
import { ThemeService } from 'app/themes/theme.service';
import { AccountMenuComponent } from '../account-menu/account-menu.component';
import { AccountsService } from '@shared/accounts';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatIconModule,
    RouterModule,
    MatMenuModule,
    AccountMenuComponent,
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
  readonly #themeService = inject(ThemeService);
  readonly #accountsService = inject(AccountsService);

  readonly isLoggedIn = this.#accountsService.select.isLoggedIn;
  readonly theme = this.#themeService.theme;
  readonly Themes = Themes;
  readonly menuIsOpen = signal(false);

  toggleTheme() {
    this.#themeService.toggleTheme();
  }

  markMenuAsOpen() {
    this.menuIsOpen.set(true);
  }

  markMenuAsClosed() {
    this.menuIsOpen.set(false);
  }
}
