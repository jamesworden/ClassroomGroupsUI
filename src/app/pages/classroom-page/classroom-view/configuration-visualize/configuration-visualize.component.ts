// configuration-visualize.component.ts
import { Component, input, inject, OnDestroy } from '@angular/core';
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
  templateUrl: './configuration-visualize.component.html',
  styleUrl: './configuration-visualize.component.scss',
  providers: [provideCharts(withDefaultRegisterables())],
})
export class ConfigurationVisualizeComponent implements OnDestroy {
  readonly #configurationVisualizeService = inject(
    ConfigurationVisualizeService
  );

  readonly configurationDetail = input.required<ConfigurationDetail>();
  readonly classroom = input.required<ClassroomDetail>();
  readonly columnDetails = input.required<ColumnDetail[]>();

  readonly service = inject(ConfigurationVisualizeService);

  ngOnDestroy() {
    this.#configurationVisualizeService.setAverageSettingsOpen(false);
  }
}
