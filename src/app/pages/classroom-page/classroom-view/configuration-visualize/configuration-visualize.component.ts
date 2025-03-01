import { Component, computed, input, signal } from '@angular/core';
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
import { Chart, ChartConfiguration, ChartData, ChartType } from 'chart.js';

import {
  ConfigurationDetail,
  GroupDetail,
  ColumnDetail,
  ClassroomDetail,
  FieldType,
} from '@shared/classrooms';

enum ViewingBy {
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
  ],
  templateUrl: './configuration-visualize.component.html',
  styleUrl: './configuration-visualize.component.scss',
  providers: [provideCharts(withDefaultRegisterables())],
})
export class ConfigurationVisualizeComponent {
  // Input properties
  readonly configurationDetail = input.required<ConfigurationDetail>();
  readonly classroom = input.required<ClassroomDetail>();
  readonly columnDetails = input.required<ColumnDetail[]>();
  readonly defaultGroup = input.required<GroupDetail>();
  readonly groupDetails = input.required<GroupDetail[]>();
  readonly averageScores = input.required<{ [id: string]: number }>();

  // Signal state properties
  readonly viewingBy = signal<ViewingBy>(ViewingBy.Students);
  readonly selectedColumn = signal<string | 'average'>('average');
  readonly chartType = signal<ChartType>('bar');

  // Computed properties
  readonly allGroupDetails = computed(() => {
    return [this.defaultGroup(), ...this.groupDetails()];
  });

  readonly allStudentDetails = computed(() => {
    return this.allGroupDetails().flatMap((group) => group.studentDetails);
  });

  readonly numberColumns = computed(() => {
    return this.columnDetails().filter((col) => col.type === 'NUMBER');
  });

  readonly noDataAvailable = computed(() => {
    return this.numberColumns().length === 0;
  });

  readonly selectedColumnLabel = computed(() => {
    if (this.selectedColumn() === 'average') {
      return 'Average Score';
    } else {
      return (
        this.columnDetails().find(
          (col) => col.fieldId === this.selectedColumn()
        )?.label || ''
      );
    }
  });

  // New computed signals for chart data generation
  readonly studentLabels = computed(() => {
    return this.allStudentDetails().map((student) => {
      const firstName = student.fieldIdsToValues['firstName'] || '';
      const lastName = student.fieldIdsToValues['lastName'] || '';

      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }

      return student.id.slice(-4);
    });
  });

  readonly groupLabels = computed(() => {
    return this.allGroupDetails().map((group) => group.label);
  });

  readonly studentDataset = computed(() => {
    const students = this.allStudentDetails();

    if (this.selectedColumn() === 'average') {
      // Average scores for all number columns
      const data = students.map((student) => {
        const studentScores = this.numberColumns()
          .filter(({ type }) => type === FieldType.NUMBER)
          .map((col) =>
            parseFloat(student.fieldIdsToValues[col.fieldId] || '0')
          );

        return studentScores.length
          ? studentScores.reduce((sum, score) => sum + score, 0) /
              studentScores.length
          : 0;
      });

      return {
        data,
        label: 'Average Score',
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return 'rgba(94, 129, 244, 0.8)';
          }

          // Create gradient based on chart type
          if (this.chartType() === 'bar') {
            const gradient = ctx.createLinearGradient(
              0,
              chartArea.bottom,
              0,
              chartArea.top
            );
            gradient.addColorStop(0, 'rgba(94, 129, 244, 0.2)');
            gradient.addColorStop(1, 'rgba(94, 129, 244, 0.8)');
            return gradient;
          } else if (this.chartType() === 'line') {
            const gradient = ctx.createLinearGradient(
              0,
              chartArea.bottom,
              0,
              chartArea.top
            );
            gradient.addColorStop(0, 'rgba(94, 129, 244, 0.1)');
            gradient.addColorStop(1, 'rgba(94, 129, 244, 0.6)');
            return gradient;
          } else {
            return 'rgba(94, 129, 244, 0.7)';
          }
        },
        borderColor: 'rgba(94, 129, 244, 1)',
        hoverBackgroundColor: 'rgba(94, 129, 244, 0.9)',
        pointBackgroundColor: 'rgba(94, 129, 244, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(94, 129, 244, 1)',
        borderWidth: this.chartType() === 'line' ? 3 : 0,
      };
    } else {
      // Specific column data
      const data = students.map((student) => {
        const value = student.fieldIdsToValues[this.selectedColumn()] || '0';
        return parseFloat(value) || 0;
      });

      return {
        data,
        label: this.selectedColumnLabel(),
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return 'rgba(94, 129, 244, 0.8)';
          }

          // Create gradient based on chart type
          if (this.chartType() === 'bar') {
            const gradient = ctx.createLinearGradient(
              0,
              chartArea.bottom,
              0,
              chartArea.top
            );
            gradient.addColorStop(0, 'rgba(94, 129, 244, 0.2)');
            gradient.addColorStop(1, 'rgba(94, 129, 244, 0.8)');
            return gradient;
          } else if (this.chartType() === 'line') {
            const gradient = ctx.createLinearGradient(
              0,
              chartArea.bottom,
              0,
              chartArea.top
            );
            gradient.addColorStop(0, 'rgba(94, 129, 244, 0.1)');
            gradient.addColorStop(1, 'rgba(94, 129, 244, 0.6)');
            return gradient;
          } else {
            return 'rgba(94, 129, 244, 0.7)';
          }
        },
        borderColor: 'rgba(66, 186, 255, 1)',
        hoverBackgroundColor: 'rgba(66, 186, 255, 0.9)',
        pointBackgroundColor: 'rgba(66, 186, 255, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(66, 186, 255, 1)',
        borderWidth: this.chartType() === 'line' ? 3 : 0,
      };
    }
  });

  readonly groupDataset = computed(() => {
    const groups = this.allGroupDetails();

    if (this.selectedColumn() === 'average') {
      // Average scores across all columns for each group
      const data = groups.map((group) => {
        const groupStudents = group.studentDetails;

        // Get all number column scores for all students in the group
        const allScores = groupStudents.flatMap((student) =>
          this.numberColumns()
            .map((col) =>
              parseFloat(student.fieldIdsToValues[col.fieldId] || '0')
            )
            .filter((score) => !isNaN(score))
        );

        return allScores.length
          ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length
          : 0;
      });

      return {
        data,
        label: 'Average Score',
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return 'rgba(137, 111, 255, 0.8)';
          }

          // Create gradient based on chart type
          if (this.chartType() === 'bar') {
            const gradient = ctx.createLinearGradient(
              0,
              chartArea.bottom,
              0,
              chartArea.top
            );
            gradient.addColorStop(0, 'rgba(137, 111, 255, 0.2)');
            gradient.addColorStop(1, 'rgba(137, 111, 255, 0.8)');
            return gradient;
          } else if (this.chartType() === 'line') {
            const gradient = ctx.createLinearGradient(
              0,
              chartArea.bottom,
              0,
              chartArea.top
            );
            gradient.addColorStop(0, 'rgba(137, 111, 255, 0.1)');
            gradient.addColorStop(1, 'rgba(137, 111, 255, 0.6)');
            return gradient;
          } else {
            return 'rgba(137, 111, 255, 0.7)';
          }
        },
        borderColor: 'rgba(137, 111, 255, 1)',
        hoverBackgroundColor: 'rgba(137, 111, 255, 0.9)',
        pointBackgroundColor: 'rgba(137, 111, 255, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(137, 111, 255, 1)',
        borderWidth: this.chartType() === 'line' ? 3 : 0,
      };
    } else {
      // Specific column averages for each group
      const data = groups.map((group) => {
        const groupStudents = group.studentDetails;

        const columnScores = groupStudents
          .map((student) =>
            parseFloat(student.fieldIdsToValues[this.selectedColumn()] || '0')
          )
          .filter((score) => !isNaN(score));

        return columnScores.length
          ? columnScores.reduce((sum, score) => sum + score, 0) /
              columnScores.length
          : 0;
      });

      return {
        data,
        label: this.selectedColumnLabel(),
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return 'rgba(137, 111, 255, 0.8)';
          }

          // Create gradient based on chart type
          if (this.chartType() === 'bar') {
            const gradient = ctx.createLinearGradient(
              0,
              chartArea.bottom,
              0,
              chartArea.top
            );
            gradient.addColorStop(0, 'rgba(137, 111, 255, 0.2)');
            gradient.addColorStop(1, 'rgba(137, 111, 255, 0.8)');
            return gradient;
          } else if (this.chartType() === 'line') {
            const gradient = ctx.createLinearGradient(
              0,
              chartArea.bottom,
              0,
              chartArea.top
            );
            gradient.addColorStop(0, 'rgba(137, 111, 255, 0.1)');
            gradient.addColorStop(1, 'rgba(137, 111, 255, 0.6)');
            return gradient;
          } else {
            return 'rgba(137, 111, 255, 0.7)';
          }
        },
        borderColor: 'rgba(255, 126, 146, 1)',
        hoverBackgroundColor: 'rgba(255, 126, 146, 0.9)',
        pointBackgroundColor: 'rgba(255, 126, 146, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 126, 146, 1)',
        borderWidth: this.chartType() === 'line' ? 3 : 0,
      };
    }
  });

  readonly chartData = computed((): ChartData => {
    if (this.viewingBy() === ViewingBy.Students) {
      return {
        labels: this.studentLabels(),
        datasets: [this.studentDataset()],
      };
    } else {
      return {
        labels: this.groupLabels(),
        datasets: [this.groupDataset()],
      };
    }
  });

  readonly chartOptions = computed((): ChartConfiguration['options'] => ({
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 100,
    layout: {
      padding: {
        top: 10,
        right: 25,
        bottom: 10,
        left: 10,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        font: {
          family: "'Inter', sans-serif",
          size: 18,
          weight: 600,
        },
        padding: {
          top: 15,
          bottom: 25,
        },
        color: '#5c5c5c',
      },
      tooltip: {
        backgroundColor: 'rgba(20, 20, 20, 0.85)',
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
          weight: 600,
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 13,
          weight: 400,
        },
        padding: 14,
        cornerRadius: 8,
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        boxPadding: 4,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        caretSize: 6,
        caretPadding: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Score',
          font: {
            family: "'Inter', sans-serif",
            size: 14,
            weight: 500,
          },
          padding: {
            bottom: 10,
          },
          color: '#6b6b6b',
        },
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(200, 200, 200, 0.15)',
          tickLength: 8,
          lineWidth: 1,
        },
        border: {
          display: false,
        },
        ticks: {
          padding: 12,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          color: '#757575',
        },
      },
      x: {
        title: {
          display: true,
          text: this.viewingBy() === ViewingBy.Students ? 'Students' : 'Groups',
          font: {
            family: "'Inter', sans-serif",
            size: 14,
            weight: 500,
          },
          padding: {
            top: 15,
          },
          color: '#6b6b6b',
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          padding: 8,
          maxRotation: 45,
          minRotation: 0,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          color: '#757575',
          autoSkip: true,
          maxTicksLimit: 15,
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 3,
        fill: true,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2,
        hoverBorderWidth: 2,
        hitRadius: 8,
      },
      bar: {
        borderRadius: 8,
        borderSkipped: false,
        borderWidth: 0,
      },
    },
    animation: {
      duration: 700,
      easing: 'easeOutQuint',
      delay: (context) => {
        return context.dataIndex * 50;
      },
    },
    borderColor: 'transparent',
  }));

  readonly averageClassScore = computed(() => {
    if (this.selectedColumn() === 'average') {
      const values = Object.values(this.averageScores());
      return values.length > 0
        ? values.reduce((sum, val) => sum + val, 0) / values.length
        : 0;
    } else {
      const scores = this.allStudentDetails()
        .map((s) =>
          parseFloat(s.fieldIdsToValues[this.selectedColumn()] || '0')
        )
        .filter((v) => !isNaN(v));

      return scores.length > 0
        ? scores.reduce((sum, val) => sum + val, 0) / scores.length
        : 0;
    }
  });

  readonly ViewingBy = ViewingBy;

  constructor() {
    const customHoverPlugin = {
      id: 'customHoverEffects',
      beforeDatasetsDraw: (chart: any) => {
        const activeElements = chart.getActiveElements();
        if (activeElements.length === 0) return;

        const ctx = chart.ctx;
        ctx.save();
        const activeDatasetIndex = activeElements[0].datasetIndex;

        chart.data.datasets.forEach((dataset: any, i: any) => {
          if (i !== activeDatasetIndex) {
            chart.getDatasetMeta(i).data.forEach((dataPoint: any) => {
              dataPoint.options.backgroundColor = this.adjustOpacity(
                dataPoint.options.backgroundColor,
                0.3
              );
            });
          }
        });
      },
      afterDatasetsDraw: (chart: any) => {
        chart.ctx.restore();
      },
    };

    // Register the plugin correctly
    Chart.register(customHoverPlugin);
  }

  adjustOpacity(color: string, opacity: number) {
    if (typeof color === 'string' && color.startsWith('rgba')) {
      const parts = color.match(
        /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d*(?:\.\d+)?)\)$/
      );
      if (parts) {
        return `rgba(${parts[1]}, ${parts[2]}, ${parts[3]}, ${opacity})`;
      }
    }
    return color;
  }

  setViewMode(mode: ViewingBy) {
    this.viewingBy.set(mode);
  }

  setSelectedColumn(column: string | 'average') {
    this.selectedColumn.set(column);
  }

  setChartType(type: ChartType) {
    this.chartType.set(type);
  }
}
