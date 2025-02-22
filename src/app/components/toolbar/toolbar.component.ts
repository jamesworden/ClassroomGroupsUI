import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { AccountsService } from '@shared/accounts';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CodeLinksMenuComponent } from '../code-links-menu/code-links-menu.component';
import {
  AccountMenuButtonComponent,
  ToggleThemeButtonComponent,
} from '@ui-inputs';

@Component({
  selector: 'app-toolbar',
  imports: [
    MatToolbarModule,
    MatIconModule,
    RouterModule,
    MatMenuModule,
    MatButtonModule,
    MatTooltipModule,
    CodeLinksMenuComponent,
    ToggleThemeButtonComponent,
    AccountMenuButtonComponent,
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
  readonly #accountsService = inject(AccountsService);

  readonly isLoggedIn = this.#accountsService.select.isLoggedIn;
}
