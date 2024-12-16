import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
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
  readonly #router = inject(Router);
  readonly #themeService = inject(ThemeService);

  readonly isLoggedIn = this.#accountsService.select.isLoggedIn;
  readonly Themes = Themes;
  readonly theme = this.#themeService.theme;

  constructor() {
    // effect(() => {
    //   if (this.isLoggedIn()) {
    //     this.#router.navigate(['classrooms']);
    //   }
    // });
  }

  toggleTheme() {
    this.#themeService.toggleTheme();
  }
}
