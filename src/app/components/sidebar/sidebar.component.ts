import { Component, inject, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ThemeService } from '../../themes/theme.service';
import { Themes } from '../../themes/theme.models';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AccountsService } from '@shared/accounts';
import { GoogleSignInButtonComponent } from '@ui-inputs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatIconModule, MatSnackBarModule, MatButtonModule, MatMenuModule, GoogleSignInButtonComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  readonly #themeService = inject(ThemeService);
  readonly #accountsService = inject(AccountsService)

  readonly toggledClassAndConfigPanel = output();

  readonly theme = this.#themeService.theme;
  readonly isLoggedIn = this.#accountsService.isLoggedIn;
  readonly account = this.#accountsService.account;

  readonly Themes = Themes;

  toggleTheme() {
    this.#themeService.toggleTheme();
  }

  toggleClassAndConfigPanel() {
    this.toggledClassAndConfigPanel.emit();
  }

  logout() {
    this.#accountsService.logout()
  }
}
