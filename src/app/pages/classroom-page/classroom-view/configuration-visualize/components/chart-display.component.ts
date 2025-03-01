import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-chart-display',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div
      class="bg-zinc-50/80 dark:bg-zinc-900/90 border border-zinc-300 dark:border-zinc-600 rounded-lg p-4 h-full"
    >
      <canvas
        baseChart
        class="h-full w-full"
        [data]="chartData()"
        [options]="chartOptions()"
        [type]="chartType()"
      ></canvas>
    </div>
  `,
})
export class ChartDisplayComponent {
  readonly chartData = input.required<ChartConfiguration['data']>();
  readonly chartOptions = input.required<ChartConfiguration['options']>();
  readonly chartType = input.required<ChartType>();
}
