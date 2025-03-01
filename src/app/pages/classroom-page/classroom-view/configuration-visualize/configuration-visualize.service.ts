import { computed, inject, Injectable, signal } from '@angular/core';
import { ViewingBy } from './configuration-visualize.component';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ClassroomPageService } from '../../classroom-page.service';
import {
  calculateAverageScores,
  ClassroomsService,
  FieldType,
} from '@shared/classrooms';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationVisualizeService {
  readonly #classroomsService = inject(ClassroomsService);
  readonly #classroomPageService = inject(ClassroomPageService);

  readonly classroomId = this.#classroomPageService.classroomId;
  readonly configurationId = this.#classroomPageService.configurationId;
  readonly columnDetails = computed(() =>
    this.#classroomsService.select.columnDetails(this.configurationId())
  );
  readonly allGroupDetails = computed(() =>
    this.#classroomsService.select.groupDetails(this.configurationId())()
  );
  readonly listGroupDetails = computed(() =>
    this.#classroomsService.select.listGroupDetails(this.configurationId())()
  );
  readonly defaultGroup = computed(() =>
    this.#classroomsService.select.defaultGroup(this.configurationId())()
  );

  private readonly _viewingBy = signal<ViewingBy>(ViewingBy.Students);
  public viewingBy = this._viewingBy.asReadonly();

  // TODO: Type this better.
  private readonly _selectedColumn = signal<string | 'average'>('average');
  readonly selectedColumn = this._selectedColumn.asReadonly();

  private readonly _chartType = signal<ChartType>('bar');
  readonly chartType = this._chartType.asReadonly();

  private readonly _showUngroupedStudents = signal(true);
  readonly showUngroupedStudents = this._showUngroupedStudents.asReadonly();

  readonly showingGroups = computed(() =>
    this.showUngroupedStudents()
      ? this.allGroupDetails()
      : this.listGroupDetails()
  );

  readonly showingStudentDetails = computed(() =>
    this.showingGroups().flatMap((group) => group.studentDetails)
  );

  readonly averageStudentScores = computed(() =>
    calculateAverageScores(this.showingStudentDetails(), this.columnDetails())
  );

  readonly numericColumns = computed(() =>
    this.columnDetails().filter(({ type }) => FieldType.NUMBER === type)
  );

  readonly averageScore = computed(() =>
    this.viewingBy() === ViewingBy.Groups
      ? this.averageGroupScore()
      : this.averageStudentScore()
  );

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

  readonly studentLabels = computed(() => {
    return this.showingStudentDetails().map((student) => {
      const firstName = student.fieldIdsToValues['firstName'] || '';
      const lastName = student.fieldIdsToValues['lastName'] || '';

      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }

      return student.id.slice(-4);
    });
  });

  readonly groupLabels = computed(() => {
    return this.showingGroups().map((group) =>
      group.id === this.defaultGroup()?.id ? 'Ungrouped Students' : group.label
    );
  });

  readonly studentDataset = computed(() => {
    const students = this.showingStudentDetails();

    if (this.selectedColumn() === 'average') {
      const data = students.map((student) => {
        const studentScores = this.numericColumns()
          .map((col) =>
            parseFloat(student.fieldIdsToValues[col.fieldId] || '0')
          )
          .filter((score) => !isNaN(score));

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
        pointBackgroundColor: 'rgba(66, 186, 255, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(66, 186, 255, 1)',
        borderWidth: this.chartType() === 'line' ? 3 : 0,
      };
    }
  });

  readonly groupDataset = computed(() => {
    const groups = this.showingGroups();

    if (this.selectedColumn() === 'average') {
      // Average scores across all columns for each group
      const data = groups.map((group) => {
        const groupStudents = group.studentDetails;

        const allScores = groupStudents.flatMap((student) =>
          this.numericColumns()
            .filter(({ type }) => type === FieldType.NUMBER)
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

  readonly averageStudentScore = computed(() => {
    if (this.selectedColumn() === 'average') {
      const values = Object.values(this.averageStudentScores());
      return values.length > 0
        ? values.reduce((sum, val) => sum + val, 0) / values.length
        : 0;
    } else {
      const scores = this.showingStudentDetails()
        .map((s) =>
          parseFloat(s.fieldIdsToValues[this.selectedColumn()] || '0')
        )
        .filter((v) => !isNaN(v));

      return scores.length > 0
        ? scores.reduce((sum, val) => sum + val, 0) / scores.length
        : 0;
    }
  });

  // TODO: Is broken.
  readonly averageGroupScore = computed(() => {
    if (this.selectedColumn() === 'average') {
      // For average column, calculate average of group average scores
      return this.showingGroups().length > 0
        ? this.showingGroups()
            .map((group) => {
              const studentValues = group.studentDetails
                .map((s) =>
                  parseFloat(s.fieldIdsToValues[this.selectedColumn()] || '0')
                )
                .filter((v) => !isNaN(v));

              return studentValues.length > 0
                ? studentValues.reduce((sum, val) => sum + val, 0) /
                    studentValues.length
                : 0;
            })
            .reduce((sum, val) => sum + val, 0) / this.showingGroups().length
        : 0;
    } else {
      // For other columns, calculate average of group average scores
      return this.showingGroups().length > 0
        ? this.showingGroups()
            .map((group) => {
              const studentValues = group.studentDetails
                .map((s) =>
                  parseFloat(s.fieldIdsToValues[this.selectedColumn()] || '0')
                )
                .filter((v) => !isNaN(v));

              return studentValues.length > 0
                ? studentValues.reduce((sum, val) => sum + val, 0) /
                    studentValues.length
                : 0;
            })
            .reduce((sum, val) => sum + val, 0) / this.showingGroups().length
        : 0;
    }
  });

  setViewingBy(viewingBy: ViewingBy) {
    this._viewingBy.set(viewingBy);
  }

  setShowUngroupedStudents(showUngroupedStudents: boolean) {
    this._showUngroupedStudents.set(showUngroupedStudents);
  }

  setChartType(chartType: ChartType) {
    this._chartType.set(chartType);
  }

  setSelectedColumn(selectedColumn: string) {
    this._selectedColumn.set(selectedColumn);
  }
}
