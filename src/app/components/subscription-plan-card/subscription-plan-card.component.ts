import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SubscriptionPlan } from 'app/metadata';

@Component({
  selector: 'app-subscription-plan-card',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './subscription-plan-card.component.html',
  styleUrl: './subscription-plan-card.component.scss',
})
export class SubscriptionPlanCardComponent {
  subscriptionPlan = input<SubscriptionPlan>();
}
