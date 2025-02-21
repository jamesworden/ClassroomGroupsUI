import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-counter-card',
  imports: [MatTooltipModule, MatIconModule, CommonModule],
  templateUrl: './counter-card.component.html',
  styleUrl: './counter-card.component.scss',
})
export class CounterCardComponent {
  readonly count = input.required<number>();
  readonly totalCount = input.required<number>();
  readonly withinLimitTooltip = input.required<string>();
  readonly limitReachedTooltip = input.required<string>();
  readonly icon = input.required<string>();

  readonly limitReached = computed(() => this.count() >= this.totalCount());
}
