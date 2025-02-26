import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SubscriptionPlan } from '@app/metadata';

@Component({
  selector: 'app-subscription-plan-card',
  imports: [MatIconModule, MatTooltipModule],
  templateUrl: './subscription-plan-card.component.html',
  styleUrl: './subscription-plan-card.component.scss',
})
export class SubscriptionPlanCardComponent {
  subscriptionPlan = input.required<SubscriptionPlan>();
}
