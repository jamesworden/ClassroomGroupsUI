import { Component, input } from '@angular/core';
import { SubscriptionPlan } from 'app/metadata';

@Component({
  selector: 'app-subscription-plan-card',
  standalone: true,
  imports: [],
  templateUrl: './subscription-plan-card.component.html',
  styleUrl: './subscription-plan-card.component.scss',
})
export class SubscriptionPlanCardComponent {
  subscriptionPlan = input<SubscriptionPlan>();
}
