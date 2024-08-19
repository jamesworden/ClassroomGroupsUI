import { Component, inject, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ThemeService } from '../../themes/theme.service';
import { Themes } from '../../themes/theme.models';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { map } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatIconModule, MatSnackBarModule, MatButtonModule, HttpClientModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  readonly #themeService = inject(ThemeService);
  readonly #matSnackBar = inject(MatSnackBar);
  readonly #httpClient = inject(HttpClient)

  readonly toggledClassAndConfigPanel = output();

  readonly themeSignal = this.#themeService.theme;

  readonly Themes = Themes;

  toggleTheme() {
    this.#themeService.toggleTheme();
  }

  openUnderConstructionToastMessage() {
    console.log('test')
    return this.#httpClient.post('https://localhost:7192/classroom-groups/api/v1/authentication/logout', {
      withCredentials: true,  // This is crucial to send cookies
    }).subscribe((x) => {
      console.log(x)
    })
  }

  toggleClassAndConfigPanel() {
    this.toggledClassAndConfigPanel.emit();
  }
}
