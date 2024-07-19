import { Component, inject, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ThemeService } from '../../themes/theme.service';
import { Themes } from '../../themes/theme.models';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatIconModule, MatSnackBarModule, MatButtonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  readonly #themeService = inject(ThemeService);
  readonly #matSnackBar = inject(MatSnackBar);

  readonly toggledClassAndConfigPanel = output();

  readonly themeSignal = this.#themeService.theme;

  readonly Themes = Themes;

  toggleTheme() {
    this.#themeService.toggleTheme();
  }

  openUnderConstructionToastMessage() {
    this.#matSnackBar.open('Under construction!', 'Hide', {
      duration: 3000,
    });
  }

  toggleClassAndConfigPanel() {
    this.toggledClassAndConfigPanel.emit();
  }
}
