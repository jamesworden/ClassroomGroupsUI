import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ToolbarComponent } from '@app/components';
import { AccountsService } from '@shared/accounts';
import { FeatureCardComponent } from './feature-card/feature-card.component';

@Component({
  selector: 'app-landing-view',
  imports: [
    MatIconModule,
    CommonModule,
    ToolbarComponent,
    RouterModule,
    FeatureCardComponent,
  ],
  templateUrl: './landing-view.component.html',
  styleUrl: './landing-view.component.scss',
})
export class LandingPageComponent {
  readonly #accountsService = inject(AccountsService);

  readonly isLoggedIn = this.#accountsService.select.isLoggedIn;

  readonly fullYear = new Date().getFullYear();
}
