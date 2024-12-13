import { Component, inject, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ThemeService } from '../../themes/theme.service';
import { Themes } from '../../themes/theme.models';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AccountsService } from '@shared/accounts';
import { GoogleSignInButtonComponent } from '@ui-inputs';
import { AccountMenuComponent } from '../account-menu/account-menu.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    MatIconModule,
    MatSnackBarModule,
    MatButtonModule,
    MatMenuModule,
    GoogleSignInButtonComponent,
    AccountMenuComponent,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  readonly #themeService = inject(ThemeService);
  readonly #accountsService = inject(AccountsService);

  readonly toggledClassAndConfigPanel = output();

  readonly theme = this.#themeService.theme;
  readonly isLoggedIn = this.#accountsService.select.isLoggedIn;
  readonly account = this.#accountsService.select.account;

  readonly Themes = Themes;
  readonly menuIsOpen = signal(false);

  toggleTheme() {
    this.#themeService.toggleTheme();
  }

  toggleClassAndConfigPanel() {
    this.toggledClassAndConfigPanel.emit();
  }

  markMenuAsOpen() {
    this.menuIsOpen.set(true);
  }

  markMenuAsClosed() {
    this.menuIsOpen.set(false);
  }
}
