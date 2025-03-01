import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div
      class="flex flex-col items-center justify-center text-center p-8 bg-zinc-50/80 dark:bg-zinc-900/90 border border-zinc-300 dark:border-zinc-600 rounded-lg h-full"
    >
      <mat-icon class="text-6xl mb-4 text-zinc-400 dark:text-zinc-600"
        >data_array</mat-icon
      >
      <h3 class="text-xl font-medium mb-2">No numeric data available</h3>
      <p class="opacity-70 max-w-md">
        Add number columns to your configuration to visualize data. Numeric data
        allows you to track and analyze student performance.
      </p>
    </div>
  `,
})
export class EmptyStateComponent {}
