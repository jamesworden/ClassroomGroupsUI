import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import {
  provideCharts,
  withDefaultRegisterables,
  BaseChartDirective,
} from 'ng2-charts';
import { ChartType } from 'chart.js';

import {
  ConfigurationDetail,
  ColumnDetail,
  ClassroomDetail,
} from '@shared/classrooms';
import { MatChipsModule } from '@angular/material/chips';
import { ConfigurationVisualizeService } from './configuration-visualize.service';

export enum ViewingBy {
  Students = 'Students',
  Groups = 'Groups',
}

@Component({
  selector: 'app-configuration-visualize',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatIconModule,
    FormsModule,
    BaseChartDirective,
    MatChipsModule,
  ],
  templateUrl: './configuration-visualize.component.html',
  styleUrl: './configuration-visualize.component.scss',
  providers: [provideCharts(withDefaultRegisterables())],
})
export class ConfigurationVisualizeComponent {
  readonly #configurationVisualizeService = inject(
    ConfigurationVisualizeService
  );

  readonly configurationDetail = input.required<ConfigurationDetail>();
  readonly classroom = input.required<ClassroomDetail>();
  readonly columnDetails = input.required<ColumnDetail[]>();

  readonly viewingBy = this.#configurationVisualizeService.viewingBy;
  readonly selectedColumn = this.#configurationVisualizeService.selectedColumn;
  readonly chartType = this.#configurationVisualizeService.chartType;
  readonly showUngroupedStudents =
    this.#configurationVisualizeService.showUngroupedStudents;
  readonly chartData = this.#configurationVisualizeService.chartData;
  readonly chartOptions = this.#configurationVisualizeService.chartOptions;
  readonly selectedColumnLabel =
    this.#configurationVisualizeService.selectedColumnLabel;
  readonly numericColumns = this.#configurationVisualizeService.numericColumns;
  readonly averageScore = this.#configurationVisualizeService.averageScore;
  readonly allGroupDetails =
    this.#configurationVisualizeService.allGroupDetails;
  readonly showingStudentDetails =
    this.#configurationVisualizeService.showingStudentDetails;

  readonly ViewingBy = ViewingBy;

  setViewingBy(viewingBy: ViewingBy) {
    this.#configurationVisualizeService.setViewingBy(viewingBy);
  }

  setSelectedColumn(selectedColumn: string | 'average') {
    this.#configurationVisualizeService.setSelectedColumn(selectedColumn);
  }

  setChartType(chartType: ChartType) {
    this.#configurationVisualizeService.setChartType(chartType);
  }

  toggleShowUngroupedStudents() {
    this.#configurationVisualizeService.setShowUngroupedStudents(
      !this.showUngroupedStudents()
    );
  }
}
