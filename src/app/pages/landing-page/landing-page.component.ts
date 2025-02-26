import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ToolbarComponent } from '@app/components';
import { AccountsService } from '@shared/accounts';
import { FeatureCardComponent } from './feature-card/feature-card.component';

@Component({
  selector: 'app-landing-page',
  imports: [
    MatIconModule,
    CommonModule,
    ToolbarComponent,
    RouterModule,
    FeatureCardComponent,
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
  readonly #accountsService = inject(AccountsService);

  readonly isLoggedIn = this.#accountsService.select.isLoggedIn;

  readonly fullYear = new Date().getFullYear();
}
