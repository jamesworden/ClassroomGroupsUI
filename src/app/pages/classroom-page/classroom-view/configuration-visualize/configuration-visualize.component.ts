import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
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
    FormsModule,
    BaseChartDirective,
  ],
  templateUrl: './configuration-visualize.component.html',
  styleUrl: './configuration-visualize.component.scss',
  providers: [provideCharts(withDefaultRegisterables())],
})
export class ConfigurationVisualizeComponent {
  readonly configurationDetail = input.required<ConfigurationDetail>();
  readonly classroom = input.required<ClassroomDetail>();
  readonly columnDetails = input.required<ColumnDetail[]>();
  readonly defaultGroup = input.required<GroupDetail>();
  readonly groupDetails = input.required<GroupDetail[]>();
  readonly averageScores = input.required<{ [id: string]: number }>();

  viewMode: 'students' | 'groups' = 'students';
  selectedColumn: string | 'average' = 'average';
  chartType: ChartType = 'bar';

  // Computed properties
  readonly allGroupDetails = computed(() => {
    return [this.defaultGroup(), ...this.groupDetails()];
  });

  readonly allStudentDetails = computed(() => {
    return this.allGroupDetails().flatMap((group) => group.studentDetails);
  });

  readonly chartData = computed((): ChartData => {
    if (this.viewMode === 'students') {
      return this.getStudentChartData();
    } else {
      return this.getGroupChartData();
    }
  });

  readonly chartOptions = computed((): ChartConfiguration['options'] => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
        },
        title: {
          display: true,
          text: this.getChartTitle(),
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Score',
          },
          min: 0,
          max: 100,
        },
        x: {
          title: {
            display: true,
            text: this.viewMode === 'students' ? 'Students' : 'Groups',
          },
        },
      },
    };
  });

  // Helper methods
  private getChartTitle(): string {
    if (this.selectedColumn === 'average') {
      return `Average Scores by ${this.viewMode === 'students' ? 'Student' : 'Group'}`;
    } else {
      const columnLabel =
        this.columnDetails().find((col) => col.fieldId === this.selectedColumn)
          ?.label || '';
      return `${columnLabel} Scores by ${this.viewMode === 'students' ? 'Student' : 'Group'}`;
    }
  }

  private getStudentChartData(): ChartData {
    const students = this.allStudentDetails();
    const labels = students.map((student, index) => `Student ${index + 1}`);

    let datasets = [];

    if (this.selectedColumn === 'average') {
      // Average scores
      const data = students.map((student) => {
        const studentScores = this.columnDetails()
          .filter((col) => col.type === 'NUMBER')
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
      });
    } else {
      // Specific column
      const data = students.map((student) => {
        const value = student.fieldIdsToValues[this.selectedColumn] || '0';
        return parseFloat(value) || 0;
      });

      const columnLabel =
        this.columnDetails().find((col) => col.fieldId === this.selectedColumn)
          ?.label || '';
      datasets.push({
        data,
        label: columnLabel,
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

    if (this.selectedColumn === 'average') {
      // Average scores
      const data = groups.map((group) => {
        const groupStudents = group.studentDetails;

        // Get all number column scores for all students in the group
        const allScores = groupStudents.flatMap((student) =>
          this.columnDetails()
            .filter((col) => col.type === 'NUMBER')
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
      });
    } else {
      // Specific column
      const data = groups.map((group) => {
        const groupStudents = group.studentDetails;

        const columnScores = groupStudents
          .map((student) =>
            parseFloat(student.fieldIdsToValues[this.selectedColumn] || '0')
          )
          .filter((score) => !isNaN(score));

        return columnScores.length
          ? columnScores.reduce((sum, score) => sum + score, 0) /
              columnScores.length
          : 0;
      });

      const columnLabel =
        this.columnDetails().find((col) => col.fieldId === this.selectedColumn)
          ?.label || '';
      datasets.push({
        data,
        label: columnLabel,
      });
    }

    return {
      labels,
      datasets,
    };
  }

  onChartTypeChange(type: ChartType) {
    this.chartType = type;
  }

  // Add this computed value to your ConfigurationVisualizeComponent class:

  readonly averageClassScore = computed(() => {
    if (this.selectedColumn === 'average') {
      const values = Object.values(this.averageScores());
      return values.length > 0
        ? values.reduce((sum, val) => sum + val, 0) / values.length
        : 0;
    } else {
      const scores = this.allStudentDetails()
        .map((s) => parseFloat(s.fieldIdsToValues[this.selectedColumn] || '0'))
        .filter((v) => !isNaN(v));

      return scores.length > 0
        ? scores.reduce((sum, val) => sum + val, 0) / scores.length
        : 0;
    }
  });
}
