// configuration-visualize.component.ts
import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import {
  ConfigurationDetail,
  ColumnDetail,
  ClassroomDetail,
} from '@shared/classrooms';
import { ConfigurationVisualizeService } from './configuration-visualize.service';
import {
  ConfigurationHeaderComponent,
  ControlsPanelComponent,
  StatsPanelComponent,
  ChartDisplayComponent,
  EmptyStateComponent,
} from './components';

@Component({
  selector: 'app-configuration-visualize',
  standalone: true,
  imports: [
    CommonModule,
    ConfigurationHeaderComponent,
    StatsPanelComponent,
    ControlsPanelComponent,
    ChartDisplayComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="flex flex-col h-full relative">
      <div
        class="panel mx-4 mb-4 flex-auto rounded-b-lg shadow-lg flex flex-col flex-1 h-full"
      >
        <div class="flex flex-col flex-1 overflow-hidden">
          <!-- Header Component -->
          <app-configuration-header
            [configurationDetail]="configurationDetail()"
            [chartType]="service.chartType()"
            [showUngroupedStudents]="service.showUngroupedStudents()"
            (chartTypeChange)="service.setChartType($event)"
            (showUngroupedStudentsChange)="
              service.setShowUngroupedStudents($event)
            "
          ></app-configuration-header>

          <div
            class="px-4 flex flex-wrap justify-between items-center mb-4 gap-2 border-b border-zinc-300 dark:border-zinc-700 pb-4"
          >
            <!-- Stats Panel Component -->
            <app-stats-panel
              [viewingBy]="service.viewingBy()"
              [showingStudentDetails]="service.showingStudentDetails()"
              [allGroupDetails]="service.allGroupDetails()"
              [averageScore]="service.averageScore()"
            ></app-stats-panel>

            <!-- Controls Panel Component -->
            <app-controls-panel
              [viewingBy]="service.viewingBy()"
              [selectedColumn]="service.selectedColumn()"
              [selectedColumnLabel]="service.selectedColumnLabel()"
              [numericColumns]="service.numericColumns()"
              (viewingByChange)="service.setViewingBy($event)"
              (selectedColumnChange)="service.setSelectedColumn($event)"
            ></app-controls-panel>
          </div>

          <!-- Main content area -->
          <div class="relative flex-1 p-4 overflow-hidden">
            <div class="absolute inset-4 overflow-hidden">
              <!-- Chart Display Component -->
              <app-chart-display
                *ngIf="service.numericColumns().length"
                [chartData]="service.chartData()"
                [chartOptions]="service.chartOptions()"
                [chartType]="service.chartType()"
              ></app-chart-display>

              <!-- Empty State Component -->
              <app-empty-state
                *ngIf="!service.numericColumns().length"
              ></app-empty-state>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  providers: [provideCharts(withDefaultRegisterables())],
})
export class ConfigurationVisualizeComponent {
  readonly configurationDetail = input.required<ConfigurationDetail>();
  readonly classroom = input.required<ClassroomDetail>();
  readonly columnDetails = input.required<ColumnDetail[]>();

  readonly service = inject(ConfigurationVisualizeService);
}
