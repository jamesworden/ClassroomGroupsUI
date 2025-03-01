import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  inject,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { ConfigurationVisualizeService } from '../configuration-visualize.service';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AverageSettingsControlsComponent } from './average-settings-controls.component';

@Component({
  selector: 'app-chart-display',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective,
    MatSidenavModule,
    AverageSettingsControlsComponent,
  ],
  template: `
    <div class="h-full w-full rounded-lg overflow-hidden">
      <mat-sidenav-container class="h-full">
        <!-- Main content area -->
        <mat-sidenav-content
          class="bg-zinc-50/80 dark:bg-zinc-900/90 border border-zinc-300 dark:border-zinc-600 rounded-lg p-4 "
        >
          <div class="h-full w-full">
            <div class="h-full w-full" #chartContainer>
              <canvas
                baseChart
                #chartCanvas
                class="h-full w-full"
                [data]="chartData()"
                [options]="chartOptions()"
                [type]="chartType()"
              ></canvas>
            </div>
          </div>
        </mat-sidenav-content>

        <!-- Settings panel as a sidenav -->
        <mat-sidenav
          #sidenav
          position="end"
          mode="over"
          [opened]="averageSettingsOpen()"
          (openedChange)="onSidenavOpenedChange($event)"
          class="border-l border-zinc-300 dark:border-zinc-600 pl-4 bg-zinc-50 dark:bg-zinc-800"
          style="width: 18rem"
        >
          <div class="pt-4 pr-4 pb-4 h-full flex flex-col">
            <app-average-settings-controls
              class="h-full"
            ></app-average-settings-controls>
          </div>
        </mat-sidenav>
      </mat-sidenav-container>
    </div>
  `,
})
export class ChartDisplayComponent implements AfterViewInit {
  readonly #configurationVisualizeService = inject(
    ConfigurationVisualizeService
  );

  readonly chartData = input.required<ChartConfiguration['data']>();
  readonly chartOptions = input.required<ChartConfiguration['options']>();
  readonly chartType = input.required<ChartType>();

  readonly averageSettingsOpen =
    this.#configurationVisualizeService.averageSettingsOpen;

  @ViewChild('chartCanvas') chartCanvas!: BaseChartDirective;
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  @ViewChild('sidenav') sidenav!: ElementRef;

  private resizeObserver!: ResizeObserver;

  ngAfterViewInit() {
    this.resizeObserver = new ResizeObserver(() => {
      if (this.chartCanvas?.chart) {
        this.chartCanvas.chart.resize();
      }
    });

    if (this.chartContainer?.nativeElement) {
      this.resizeObserver.observe(this.chartContainer.nativeElement);
    }
  }

  onSidenavOpenedChange(opened: boolean) {
    this.#configurationVisualizeService.setAverageSettingsOpen(opened);
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}
