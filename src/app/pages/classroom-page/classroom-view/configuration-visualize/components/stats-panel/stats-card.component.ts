import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div
      class="bg-zinc-50/80 dark:bg-zinc-900/90 border border-zinc-300 dark:border-zinc-600 rounded-lg h-14 px-3 py-2 flex items-center flex-1"
    >
      <div
        class="mr-2 {{
          backgroundColor()
        }} p-1.5 rounded-full flex flex-col justify-around"
      >
        <mat-icon class="{{ iconColor() }} text-md">{{ icon() }}</mat-icon>
      </div>
      <div class="truncate">
        <div class="text-xs font-medium opacity-80">{{ label() }}</div>
        <div class="text-base font-semibold">
          {{ value() }}
        </div>
      </div>
    </div>
  `,
})
export class StatsCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input.required<string>();
  readonly backgroundColor = input.required<string>();
  readonly iconColor = input.required<string>();
}
