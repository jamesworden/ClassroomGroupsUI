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
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

import {
  ConfigurationDetail,
  GroupDetail,
  ColumnDetail,
  ClassroomDetail,
  StudentDetail,
} from '@shared/classrooms';

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
  readonly viewMode = signal<'students' | 'groups'>('students');
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

  readonly chartData = computed((): ChartData => {
    if (this.viewMode() === 'students') {
      return this.getStudentChartData();
    } else {
      return this.getGroupChartData();
    }
  });

  readonly chartOptions = computed((): ChartConfiguration['options'] => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 100, // Add resize delay for smoother responsiveness
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
          },
        },
        title: {
          display: true,
          text: this.getChartTitle(),
          font: {
            size: 16,
            weight: 'bold',
          },
          padding: {
            top: 10,
            bottom: 20,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.7)',
          titleFont: {
            size: 14,
          },
          bodyFont: {
            size: 13,
          },
          padding: 12,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Score',
            font: {
              size: 14,
              weight: 'bold',
            },
          },
          min: 0,
          max: 100,
          grid: {
            color: 'rgba(0,0,0,0.05)',
          },
        },
        x: {
          title: {
            display: true,
            text: this.viewMode() === 'students' ? 'Students' : 'Groups',
            font: {
              size: 14,
              weight: 'bold',
            },
          },
          grid: {
            display: false,
          },
        },
      },
      elements: {
        line: {
          tension: 0.4, // Smoother lines
        },
        point: {
          radius: 4,
          hoverRadius: 6,
        },
        bar: {
          borderRadius: 4,
        },
      },
      animation: {
        duration: 500, // Reduced animation time for better performance
        easing: 'easeOutQuart',
      },
    };
  });

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

  // Action methods
  setViewMode(mode: 'students' | 'groups') {
    this.viewMode.set(mode);
  }

  setSelectedColumn(column: string | 'average') {
    this.selectedColumn.set(column);
  }

  setChartType(type: ChartType) {
    this.chartType.set(type);
  }

  // Helper methods
  private getChartTitle(): string {
    if (this.selectedColumn() === 'average') {
      return `Average Scores by ${this.viewMode() === 'students' ? 'Student' : 'Group'}`;
    } else {
      const columnLabel =
        this.columnDetails().find(
          (col) => col.fieldId === this.selectedColumn()
        )?.label || '';
      return `${columnLabel} Scores by ${this.viewMode() === 'students' ? 'Student' : 'Group'}`;
    }
  }

  private getStudentChartData(): ChartData {
    const students = this.allStudentDetails();

    // Create more readable student labels
    const labels = students.map((student) => {
      // Use student name if available
      const firstName = student.fieldIdsToValues['firstName'] || '';
      const lastName = student.fieldIdsToValues['lastName'] || '';

      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }

      return `Student ${student.id.slice(-4)}`;
    });

    let datasets = [];

    if (this.selectedColumn() === 'average') {
      // Average scores
      const data = students.map((student) => {
        const studentScores = this.numberColumns()
          .map((col) =>
            parseFloat(student.fieldIdsToValues[col.fieldId] || '0')
          )
          .filter((score) => !isNaN(score));

        return studentScores.length
          ? studentScores.reduce((sum, score) => sum + score, 0) /
              studentScores.length
          : 0;
      });

      datasets.push({
        data,
        label: 'Average Score',
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        hoverBackgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderWidth: 1,
      });
    } else {
      // Specific column
      const data = students.map((student) => {
        const value = student.fieldIdsToValues[this.selectedColumn()] || '0';
        return parseFloat(value) || 0;
      });

      const columnLabel =
        this.columnDetails().find(
          (col) => col.fieldId === this.selectedColumn()
        )?.label || '';
      datasets.push({
        data,
        label: columnLabel,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        hoverBackgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderWidth: 1,
      });
    }

    return {
      labels,
      datasets,
    };
  }

  private getGroupChartData(): ChartData {
    const groups = this.allGroupDetails();
    const labels = groups.map((group) => group.label);

    let datasets = [];

    if (this.selectedColumn() === 'average') {
      // Average scores
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

      datasets.push({
        data,
        label: 'Average Score',
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        hoverBackgroundColor: 'rgba(153, 102, 255, 0.8)',
        borderWidth: 1,
      });
    } else {
      // Specific column
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

      const columnLabel =
        this.columnDetails().find(
          (col) => col.fieldId === this.selectedColumn()
        )?.label || '';
      datasets.push({
        data,
        label: columnLabel,
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        hoverBackgroundColor: 'rgba(255, 159, 64, 0.8)',
        borderWidth: 1,
      });
    }

    return {
      labels,
      datasets,
    };
  }
}
